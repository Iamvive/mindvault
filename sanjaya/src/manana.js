const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || "mock-key";

function analyzeTranscript(rawJson, callback) {
  // If running in test mode with mock key, bypass real api call
  if (apiKey === "mock-key") {
    const mockResult = {
      cognitive_distortion: 7.5,
      conversational_connection: 8.0,
      active_listening: 8.5,
      speech_clarity: 7.0,
      summary: "Analysis of conversation showing positive active listening adjustment.",
      kaizen_target: "Ensure to not catastrophize when bug reports arrive.",
      key_memories: [
        { time: "10:30 AM", title: "Launch Discussion", description: "Debated launching with crashes, selected code validation pass instead." },
        { time: "02:15 PM", title: "Household Maintenance", description: "Committed to calling the plumber for basement leak." },
        { time: "05:00 PM", title: "Subtle Gradient Check", description: "Finished styling checks. Manager approved showcasing tomorrow." }
      ]
    };
    return callback(null, mockResult);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze this daily transcript from my AI Wearable.
    Evaluate my speech against these studies and return JSON:
    1. Aaron Beck's Cognitive Distortions (cognitive_distortion: 1 to 10 where 10 is low distortion / healthy)
    2. John Gottman's Conversational Bids & Connection (conversational_connection: 1 to 10)
    3. Carl Rogers' Active Listening Scale (active_listening: 1 to 10)
    4. Speech Economy & Clarity (speech_clarity: 1 to 10)

    Transcript: ${JSON.stringify(rawJson)}

    Respond strictly with JSON matching this structure:
    {
      "cognitive_distortion": float,
      "conversational_connection": float,
      "active_listening": float,
      "speech_clarity": float,
      "summary": "detailed summary of communication quality",
      "kaizen_target": "exactly one 1% daily improvement action target for tomorrow",
      "key_memories": [
        {
          "time": "HH:MM AM/PM",
          "title": "Short title of conversation topic",
          "description": "One-sentence description summarizing context and outcomes"
        }
      ]
    }

    Note: The "key_memories" array must contain exactly the top 3 most significant conversations or highlights of the day.
  `;

  ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  }).then(response => {
    try {
      const result = JSON.parse(response.text);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  }).catch(err => {
    callback(err);
  });
}

module.exports = { analyzeTranscript };
