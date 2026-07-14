import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Database } from './database.js';
import { scrapeUrl } from './scraper.js';
import { enrichResourceMetadata } from './gemini.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

export function initBot() {
  if (!token) {
    console.log('\n==================================================================');
    console.log('🤖 [MindVault Bot] WARNING: TELEGRAM_BOT_TOKEN is not configured.');
    console.log('   Telegram ingestion is disabled. Configure it in backend/.env');
    console.log('==================================================================\n');
    return null;
  }

  // Create bot in polling mode
  const bot = new TelegramBot(token, { polling: true });
  console.log('🤖 [MindVault Bot] Bot listener initialized successfully.');

  // Helper to extract URLs
  function extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  // Helper to verify user whitelists
  function isAuthorized(msg) {
    const allowedUser = process.env.TELEGRAM_ALLOWED_USER;
    if (!allowedUser) return true; // Open/unsecured if no env variable is defined

    const username = msg.from?.username;
    return username && username.toLowerCase() === allowedUser.toLowerCase();
  }

  // Command: /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) {
      return bot.sendMessage(chatId, '🔒 Unauthorized: This is a private MindVault bot.');
    }
    const username = msg.from.first_name || 'friend';
    const welcomeText = `Hello ${username}! Welcome to **MindVault** 🧠✨\n\nI am your automated dashboard ingestion bot. Whenever you find a cool link on Instagram, YouTube, Google, GitHub, or anywhere else, just send it here!\n\nI will:\n1. 🔍 Scrape metadata and titles.\n2. 🤖 Use Gemini AI to summarize, categorize, and tag the resource.\n3. 📊 Score it for Interest and Usefulness.\n4. 📥 Save it to your local SQLite database for the web dashboard.\n\nTry sending me a link now!`;
    bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
  });

  // Command: /stats
  bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) {
      return bot.sendMessage(chatId, '🔒 Unauthorized: This is a private MindVault bot.');
    }
    try {
      const stats = Database.getStats();
      const statsText = `📊 **MindVault Stats**:\n\n` +
        `• **Total Saved:** ${stats.total} resources\n` +
        `• **Avg Interest Score:** ⭐ ${stats.avg_interest}/10\n` +
        `• **Avg Usefulness Score:** 🧠 ${stats.avg_usefulness}/10\n\n` +
        `🗂 **Categories:**\n` +
        stats.categories.map(c => ` - ${c.category}: ${c.count}`).join('\n') + `\n\n` +
        `🌐 **Platforms:**\n` +
        stats.platforms.map(p => ` - ${p.platform}: ${p.count}`).join('\n');
      
      bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Error loading statistics.');
    }
  });

  // Command: /list
  bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) {
      return bot.sendMessage(chatId, '🔒 Unauthorized: This is a private MindVault bot.');
    }
    try {
      const resources = Database.getAllResources('', '', '', 'created_at', 'DESC');
      if (resources.length === 0) {
        return bot.sendMessage(chatId, 'Your MindVault is empty! Send me a link to get started.');
      }
      
      const latest = resources.slice(0, 5);
      let text = `📥 **Last 5 Saved Resources**:\n\n`;
      latest.forEach((res, i) => {
        text += `${i + 1}. [${res.title}](${res.url})\n` +
                `   *Category:* ${res.category} | *Platform:* ${res.platform}\n` +
                `   *Scores:* Interest ${res.interest_score}/10, Usefulness ${res.usefulness_score}/10\n\n`;
      });
      
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (error) {
      bot.sendMessage(chatId, '❌ Error loading list.');
    }
  });

  // Handle all incoming text messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorized(msg)) {
      // Quietly ignore or reply for normal text entries
      return;
    }
    const text = msg.text;

    // Ignore commands (they are handled separately)
    if (!text || text.startsWith('/')) return;

    const url = extractUrl(text);

    // Get active conversation state
    let convState = null;
    try {
      convState = Database.getConversationState(chatId);
    } catch (err) {
      console.error('Error fetching conversation state:', err);
    }

    // 1. If it's a URL, save/scrape it
    if (url) {
      bot.sendChatAction(chatId, 'typing');
      
      try {
        // Check if URL is already saved
        const existing = Database.getResourceByUrl(url);
        if (existing) {
          return bot.sendMessage(
            chatId, 
            `⚠️ You've already saved this resource!\n\n**Title:** ${existing.title}\n**Category:** ${existing.category}\nLink: ${existing.url}`
          );
        }

        // Scrape page content
        const meta = await scrapeUrl(url);
        
        if (meta.isBlocked) {
          // If scraping failed/blocked (Instagram/Twitter), create a placeholder entry
          const resourceId = Database.createResource({
            url: meta.url,
            title: meta.title,
            platform: meta.platform,
            summary: 'Scraper was blocked. Awaiting user description.',
            category: 'Other',
            tags: meta.platform.toLowerCase()
          });

          // Save state to wait for user note
          Database.setConversationState(chatId, 'AWAITING_NOTES', resourceId);

          const promptMsg = `📥 **Saved the link from ${meta.platform}!**\n\nSince this platform blocks automated crawlers, I couldn't fetch the title or description. \n\n👉 **Please reply to this message** (or just send a message) with a short sentence or notes about what this link is and why you're saving it. I'll use Gemini to categorize and summarize it for you!`;
          return bot.sendMessage(chatId, promptMsg);
        }

        // Scrape succeeded: Use Gemini to enrich
        const enriched = await enrichResourceMetadata(url, meta);
        
        // Save to DB
        Database.createResource({
          url,
          title: enriched.title,
          summary: enriched.summary,
          category: enriched.category,
          tags: enriched.tags.join(','),
          platform: enriched.platform,
          interest_score: enriched.interest_score,
          usefulness_score: enriched.usefulness_score
        });

        // Send success message
        const summaryText = `✅ **Resource Saved!**\n\n` +
          `• **Title:** ${enriched.title}\n` +
          `• **Platform:** ${enriched.platform}\n` +
          `• **Category:** ${enriched.category}\n` +
          `• **Tags:** ${enriched.tags.map(t => `#${t}`).join(' ')}\n` +
          `• **Scores:** Interest ${enriched.interest_score}/10 | Usefulness ${enriched.usefulness_score}/10\n\n` +
          `**Summary:** ${enriched.summary}`;

        bot.sendMessage(chatId, summaryText);
        
      } catch (error) {
        console.error('Bot URL handling error:', error);
        bot.sendMessage(chatId, '❌ Sorry, I had an error processing that link.');
      }
      
    // 2. If it's a note follow-up (AWAITING_NOTES state)
    } else if (convState && convState.state === 'AWAITING_NOTES') {
      const resourceId = convState.last_resource_id;
      bot.sendChatAction(chatId, 'typing');

      try {
        const resource = Database.getResourceById(resourceId);
        if (!resource) {
          Database.clearConversationState(chatId);
          return bot.sendMessage(chatId, '❌ Something went wrong: the resource could not be found.');
        }

        // We have the notes. Let's run Gemini enrichment with these notes
        const mockMeta = {
          title: resource.title,
          description: '',
          platform: resource.platform,
          isBlocked: true
        };

        const enriched = await enrichResourceMetadata(resource.url, mockMeta, text);

        // Update database with AI parsed notes & categories
        Database.updateResource(resourceId, {
          title: enriched.title,
          summary: enriched.summary,
          category: enriched.category,
          tags: enriched.tags.join(','),
          platform: enriched.platform,
          interest_score: enriched.interest_score,
          usefulness_score: enriched.usefulness_score,
          user_notes: text
        });

        // Clear user state
        Database.clearConversationState(chatId);

        // Notify user
        const successText = `🧠 **Vault Updated with Context!**\n\n` +
          `• **Title:** ${enriched.title}\n` +
          `• **Platform:** ${enriched.platform}\n` +
          `• **Category:** ${enriched.category}\n` +
          `• **Tags:** ${enriched.tags.map(t => `#${t}`).join(' ')}\n` +
          `• **Scores:** Interest ${enriched.interest_score}/10 | Usefulness ${enriched.usefulness_score}/10\n\n` +
          `**Summary:** ${enriched.summary}`;

        bot.sendMessage(chatId, successText);

      } catch (error) {
        console.error('Error processing user note reply:', error);
        bot.sendMessage(chatId, '❌ Error updating resource details.');
      }
    }
  });

  return bot;
}
