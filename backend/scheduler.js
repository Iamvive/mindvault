import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { searchWeb } from './scraper.js';
import { Database } from './database.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Runs the daily automated scraping job
 */
export async function runDailyIngestion() {
  console.log('🕒 [Scheduler] Starting daily ingestion job...');
  
  if (!apiKey) {
    console.warn('⚠️ [Scheduler] Ingestion aborted: GEMINI_API_KEY not configured.');
    return { success: false, message: 'Gemini API key missing' };
  }

  // 1. Define search queries
  const queries = [
    { platform: 'Claude', query: 'latest features updates and releases Anthropic Claude AI 2026' },
    { platform: 'Gemini', query: 'latest features updates and releases Google Gemini AI 2026' },
    { platform: 'Antigravity', query: 'Google Antigravity SDK agent coding assistant updates' },
    { platform: 'Offers', query: 'Airtel subscription offers student discount refer earn India 2026' }
  ];

  // 2. Execute searches in parallel
  const searchPromises = queries.map(async (q) => {
    console.log(`🔍 [Scheduler] Searching the web for: "${q.query}"`);
    const results = await searchWeb(q.query);
    return { platform: q.platform, results };
  });

  const allSearchResults = await Promise.all(searchPromises);

  // 3. Compile all search results into context
  let searchContextText = '';
  allSearchResults.forEach((group) => {
    searchContextText += `=== Platform/Category: ${group.platform} ===\n`;
    if (group.results.length === 0) {
      searchContextText += '(No search results found)\n';
    } else {
      group.results.forEach((res, i) => {
        searchContextText += `[Result #${i + 1}]\n`;
        searchContextText += `Title: ${res.title}\n`;
        searchContextText += `URL: ${res.url}\n`;
        searchContextText += `Snippet: ${res.snippet}\n\n`;
      });
    }
  });

  // 4. Prompt Gemini to synthesize the results
  const systemInstruction = `You are an AI research assistant. Your task is to process search results about AI feature updates and consumer deals/offers, filtering for the most high-value, recent, and actionable opportunities to boost daily productivity.
Analyze the following compiled web search results and extract 3 to 6 distinct, high-value new features, tool updates, or subscription offers.

For each item, output:
1. URL: The exact URL from the search result. Avoid returning homepage URLs like "https://google.com" if a specific article or docs URL is available.
2. Title: Clean, user-friendly title.
3. Summary: 1-2 sentence description explaining the feature/offer and how it boosts daily productivity.
4. Category: Must be exactly one of: 'Tech & Coding', 'Productivity & Life Hacks', 'Business & Finance', 'Other'.
5. Tags: A comma-separated list of tags, ALWAYS including 'daily-scrape', plus platform tags (e.g., 'daily-scrape,claude,ai-update' or 'daily-scrape,airtel,discount').
6. Platform: E.g., 'Claude', 'Gemini', 'Antigravity', 'Airtel', or 'Offers'.
7. Interest Score: Rating 1-10.
8. Usefulness Score: Rating 1-10.

Input search results:
${searchContextText}

Output MUST be a valid JSON array and nothing else. Do not wrap it in markdown code block ticks. Use this exact schema:
[
  {
    "url": "...",
    "title": "...",
    "summary": "...",
    "category": "...",
    "tags": "...",
    "platform": "...",
    "interest_score": 8,
    "usefulness_score": 9
  }
]`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    const parsedUpdates = JSON.parse(text);

    if (!Array.isArray(parsedUpdates)) {
      throw new Error('Gemini response is not a JSON array');
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const update of parsedUpdates) {
      if (!update.url || !update.title) continue;

      // Clean/normalize tags to ensure 'daily-scrape' is always present
      let tagsArray = (update.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (!tagsArray.includes('daily-scrape')) {
        tagsArray.unshift('daily-scrape');
      }

      // Check if URL already exists in database
      const existing = Database.getResourceByUrl(update.url);
      if (existing) {
        skippedCount++;
        continue;
      }

      // Save to database
      Database.createResource({
        url: update.url,
        title: update.title,
        summary: update.summary,
        category: update.category || 'Other',
        tags: tagsArray.join(','),
        platform: update.platform || 'Web',
        interest_score: update.interest_score || 5,
        usefulness_score: update.usefulness_score || 5,
        user_notes: `Automatically scraped and processed on ${new Date().toLocaleDateString()}`
      });
      addedCount++;
    }

    console.log(`✅ [Scheduler] Ingestion completed. Added: ${addedCount}, Skipped (Duplicates): ${skippedCount}`);
    return {
      success: true,
      added: addedCount,
      skipped: skippedCount,
      message: `Successfully sync'd. Added ${addedCount} new updates.`
    };
  } catch (error) {
    console.error('❌ [Scheduler] Error during daily ingestion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initializes and starts the nightly scheduler loop
 */
export function startScheduler() {
  console.log('🕒 [Scheduler] Daily updates scheduler loop started.');

  // Run a check every hour
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(async () => {
    const now = new Date();
    // Run at 2:00 AM every night
    if (now.getHours() === 2) {
      console.log('🕒 [Scheduler] Nightly hour matches 2:00 AM. Checking last sync...');
      
      try {
        // Query if any resource has been scraped today
        const resources = Database.getAllResources();
        const todayStr = now.toLocaleDateString();
        const ranToday = resources.some(res => 
          res.tags.includes('daily-scrape') && 
          new Date(res.created_at).toLocaleDateString() === todayStr
        );

        if (!ranToday) {
          console.log('🕒 [Scheduler] No ingestion run detected for today. Initiating daily scraper...');
          await runDailyIngestion();
        } else {
          console.log('🕒 [Scheduler] Daily scraper has already run today. Skipping.');
        }
      } catch (error) {
        console.error('❌ [Scheduler] Error checking daily run status:', error);
      }
    }
  }, ONE_HOUR);
}
