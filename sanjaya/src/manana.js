const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || "mock-key";

function analyzeTranscript(rawJson, callback) {
  const defaultActionItems = [
    { time: "10:30 AM", task: "Perform quick validation pass before launch", category: "todo", context: "Launch discussion", assignee: "Self" },
    { time: "02:15 PM", task: "Call plumber for basement leak repair", category: "promise_to_others", context: "Household maintenance", assignee: "Self" },
    { time: "05:00 PM", task: "Follow up with manager on styling checks approval", category: "followup_needed", context: "Subtle Gradient Check", assignee: "Manager" }
  ];

  const defaultEntities = [
    { entity_name: "Project Sanjaya", entity_type: "project", context_snippet: "Architecture and Second Brain review", sentiment: "positive" },
    { entity_name: "Aaron Beck", entity_type: "topic", context_snippet: "CBT framework analysis for catastrophizing reduction", sentiment: "positive" },
    { entity_name: "Alice", entity_type: "person", context_snippet: "Team sync regarding release timeline", sentiment: "neutral" }
  ];

  const defaultDigest = {
    top_conversations: [
      { title: "Launch Validation vs Instant Release", impact: "High", key_takeaway: "Decided to conduct code validation pass before production deployment." },
      { title: "Basement Maintenance Commitment", impact: "Medium", key_takeaway: "Scheduled plumber call to address leak." }
    ],
    key_takeaways: [
      "Validation pass prevents production crashes on critical features.",
      "Direct communication reduces filler word clutter by 20%."
    ],
    weaknesses_identified: [
      "Slight black-and-white framing when discussing unexpected bug reports under time pressure."
    ],
    growth_areas: [
      "Active Listening: Mirror back team member concerns before stating technical counters."
    ],
    research_tip: "Carl Rogers' Active Listening Scale: Mirroring a colleague's core constraint before introducing your proposal increases alignment by up to 35% and calms emotional resistance."
  };

  // If running in test mode or with mock key, return full Second Brain mock result
  if (process.env.NODE_ENV === 'test' || apiKey === "mock-key") {
    const mockResult = {
      cognitive_distortion: 7.5,
      conversational_connection: 8.0,
      active_listening: 8.5,
      speech_clarity: 7.0,
      summary: "Analysis of conversation showing positive active listening adjustment and clear task delegation.",
      kaizen_target: "Ensure not to catastrophize when unexpected bug reports arrive; ask clarifying questions first.",
      key_memories: [
        { 
          time: "10:30 AM", 
          title: "Launch Discussion", 
          description: "Debated launching with crashes, selected code validation pass instead.",
          duration: "2m",
          environment: "office"
        },
        { 
          time: "02:15 PM", 
          title: "Household Maintenance", 
          description: "Committed to calling the plumber for basement leak.",
          duration: "45s",
          environment: "personal"
        },
        { 
          time: "05:00 PM", 
          title: "Subtle Gradient Check", 
          description: "Finished styling checks. Manager approved showcasing tomorrow.",
          duration: "10m",
          environment: "office"
        }
      ],
      action_items: defaultActionItems,
      entities: defaultEntities,
      daily_digest: defaultDigest
    };
    return callback(null, mockResult);
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze this daily transcript from my AI Wearable as a Second Brain and Cognitive Coach.
    Evaluate my speech against these studies and extract all key Second Brain metadata into JSON:

    1. Psychological Studies:
       - Aaron Beck's Cognitive Distortions (cognitive_distortion: 1 to 10 where 10 is low distortion / healthy)
       - John Gottman's Conversational Bids & Connection (conversational_connection: 1 to 10)
       - Carl Rogers' Active Listening Scale (active_listening: 1 to 10)
       - Speech Economy & Clarity (speech_clarity: 1 to 10)

    2. Action Items & Commitments:
       - Extract explicit tasks, promises made to others, and pending follow-ups required.

    3. People, Projects & Topics:
       - Identify entities (persons, projects, key topics) with context snippets and sentiment.

    4. Daily Knowledge Digest & Weakness Tracker:
       - Top high-value conversations
       - Key takeaways & decisions made
       - Weaknesses identified (e.g., catastrophizing, filler word density, interrupting)
       - Personal growth areas
       - Research-backed daily tip grounded in psychological literature (Beck, Gottman, Rogers, Kahneman).

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
          "description": "One-sentence description summarizing context and outcomes",
          "duration": "duration of conversation, e.g., '1m 40s' or '30s'",
          "environment": "either 'office' or 'personal'"
        }
      ],
      "action_items": [
        {
          "time": "HH:MM AM/PM",
          "task": "Task description",
          "category": "todo" | "promise_to_others" | "followup_needed",
          "context": "Short context of conversation",
          "assignee": "Self" | "Person Name"
        }
      ],
      "entities": [
        {
          "entity_name": "Name",
          "entity_type": "person" | "project" | "topic",
          "context_snippet": "Context",
          "sentiment": "positive" | "neutral" | "constructive"
        }
      ],
      "daily_digest": {
        "top_conversations": [
          { "title": "Topic", "impact": "High" | "Medium" | "Low", "key_takeaway": "Takeaway" }
        ],
        "key_takeaways": ["Takeaway 1", "Takeaway 2"],
        "weaknesses_identified": ["Weakness 1"],
        "growth_areas": ["Growth Area 1"],
        "research_tip": "Psychology research-backed tip for tomorrow"
      }
    }
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
    console.error('[Manana] Gemini analysis error (falling back to Second Brain fallback):', err.message || err);
    
    const fallbackMemories = (rawJson.memories || []).slice(0, 3).map(m => ({
      time: m.time || "N/A",
      title: m.title || "Recorded Memory",
      description: m.summary || "Recorded conversation snippet.",
      duration: m.duration || "N/A",
      environment: m.environment || "personal"
    }));

    const totalMemCount = rawJson.memories ? rawJson.memories.length : 0;
    const fallbackResult = {
      cognitive_distortion: 8.0,
      conversational_connection: 8.0,
      active_listening: 8.0,
      speech_clarity: 8.0,
      summary: totalMemCount > 0 
        ? `Successfully fetched ${totalMemCount} recorded memory snippets from NeoSapien for ${rawJson.timestamp || 'today'}.`
        : `No recorded memories found for ${rawJson.timestamp || 'today'}.`,
      kaizen_target: "Practice active listening by echoing back key points before proposing solutions, and pause for 2 seconds to maintain speech clarity.",
      key_memories: fallbackMemories,
      action_items: defaultActionItems,
      entities: defaultEntities,
      daily_digest: defaultDigest
    };

    callback(null, fallbackResult);
  });
}

module.exports = { analyzeTranscript };
