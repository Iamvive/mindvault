const { GoogleGenAI } = require('@google/genai');
const { getDailyScores } = require('./database');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY || "mock-key";

function handleChatQuery(userMessage, chatHistory, callback) {
  if (!userMessage || typeof userMessage !== 'string') {
    return callback(new Error("User message is required"));
  }

  getDailyScores((err, rows) => {
    if (err) return callback(err);

    // Compile memory vault & behavioral scores context
    let scoresContext = "";
    if (rows && rows.length > 0) {
      scoresContext = rows.slice(0, 7).map(r => {
        let memories = [];
        try { memories = JSON.parse(r.key_memories || '[]'); } catch (e) {}
        const memList = memories.map(m => `- [${m.time || 'N/A'}] ${m.title}: ${m.description || m.summary}`).join('\n');
        return `Date: ${r.date}
CBT Distortion Score: ${r.cognitive_distortion}/10
Gottman Bids Score: ${r.conversational_connection}/10
Rogers Active Listening Score: ${r.active_listening}/10
Speech Clarity Score: ${r.speech_clarity}/10
Summary: ${r.summary}
Kaizen Target: ${r.kaizen_target}
Key Memories:
${memList || 'None'}`;
      }).join('\n\n---\n\n');
    }

    // Include recent vault transcript files if available
    const vaultDir = path.join(__dirname, '../smriti/vault');
    let vaultSnippet = "";
    if (fs.existsSync(vaultDir)) {
      try {
        const files = fs.readdirSync(vaultDir).filter(f => f.endsWith('-raw.json')).slice(0, 3);
        for (const file of files) {
          const content = fs.readFileSync(path.join(vaultDir, file), 'utf8');
          const parsed = JSON.parse(content);
          if (parsed.conversations && parsed.conversations.length > 0) {
            vaultSnippet += `\nRaw Conversations (${file}):\n` + parsed.conversations.slice(0, 10).map(c => `[${c.time}] ${c.speaker}: ${c.text}`).join('\n');
          }
        }
      } catch (e) {}
    }

    const systemPrompt = `You are Sanjaya, the Divine Visionary Narrator and AI Behavioral Assistant.
You have omniscient insight into the user's recorded audio memories, behavioral metrics, communication patterns, and Kaizen improvement targets.

User Behavioral & Memory Context:
${scoresContext || "No scores recorded yet."}
${vaultSnippet}

Answer the user's query thoughtfully, accurately, and concisely based strictly on their memories and behavioral data.
Be empathetic, insightful, and practical. Offer actionable Kaizen micro-steps when appropriate.`;

    if (process.env.NODE_ENV === 'test' || apiKey === "mock-key") {
      const fallbackResponse = generateLocalRAGAnswer(userMessage, rows);
      return callback(null, { answer: fallbackResponse });
    }

    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

    ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    }).then(res => {
      const answer = res.text || "I have reflected on your memories, but could not formulate a clear response.";
      callback(null, { answer });
    }).catch(apiErr => {
      console.error("[Chat] Gemini API error, using RAG fallback:", apiErr.message || apiErr);
      const fallbackResponse = generateLocalRAGAnswer(userMessage, rows);
      callback(null, { answer: fallbackResponse });
    });
  });
}

function generateLocalRAGAnswer(query, rows) {
  const q = query.toLowerCase();
  if (!rows || rows.length === 0) {
    return "I don't have any recorded memories or behavioral scores in Smriti vault yet. Sync your Locket to start tracking!";
  }

  const latest = rows[0];
  let memories = [];
  try { memories = JSON.parse(latest.key_memories || '[]'); } catch (e) {}

  if (q.includes('distortion') || q.includes('cbt') || q.includes('beck')) {
    return `Your latest Cognitive Distortion score is **${latest.cognitive_distortion}/10**. Summary: ${latest.summary} Focus on objective evidence rather than black-and-white thinking.`;
  }
  if (q.includes('gottman') || q.includes('bid') || q.includes('connection') || q.includes('relationship')) {
    return `Your Conversational Bids score is **${latest.conversational_connection}/10**. Active bids: ${latest.summary}`;
  }
  if (q.includes('listening') || q.includes('rogers')) {
    return `Your Active Listening score is **${latest.active_listening}/10**. Mirror back blockers before proposing solutions.`;
  }
  if (q.includes('clarity') || q.includes('speech') || q.includes('fluff')) {
    return `Your Speech Economy score is **${latest.speech_clarity}/10**. Keep vocal placeholders and filler words to a minimum.`;
  }
  if (q.includes('kaizen') || q.includes('target') || q.includes('goal') || q.includes('improve')) {
    return `Your Kaizen target for tomorrow is: **${latest.kaizen_target}**`;
  }
  if (q.includes('memory') || q.includes('discussed') || q.includes('yesterday') || q.includes('talk')) {
    if (memories.length > 0) {
      const memList = memories.map(m => `• **${m.title}** (${m.time}): ${m.description}`).join('\n');
      return `Here are key memories recorded for ${latest.date}:\n\n${memList}`;
    }
  }

  return `Based on your memories for ${latest.date}: ${latest.summary}\n\nKaizen Target: ${latest.kaizen_target}`;
}

module.exports = { handleChatQuery };
