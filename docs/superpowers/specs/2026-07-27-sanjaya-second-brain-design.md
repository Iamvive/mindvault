# Project Sanjaya: Comprehensive Second Brain & Behavioral Growth Design Specification

## 1. Vision & Executive Summary
Project Sanjaya transforms daily wearable audio transcripts from the NeoSapien Neo 1 into an intelligent, reflective **Second Brain** and **Personal Growth System**. 

Beyond basic storage, Sanjaya acts as an active cognitive coach that:
1. **Identifies & Tracks Personal Weaknesses**: Tracks recurring cognitive distortions, vocal clutter, passive listening, or emotional reactivity across 7-day and 30-day moving trends.
2. **Highlights Top Valuable Conversations**: Surfacing top high-impact conversations daily with key takeaways, context, and key decisions.
3. **Extracts Pending Action Items & Follow-ups**: Automatically categorizes explicit TODOs, promises made to others, and pending follow-ups needed from colleagues/contacts.
4. **Identifies Personal Growth Areas**: Identifies specific communication and leadership skill gaps based on transcript patterns.
5. **Delivers Research-Backed Daily Tips**: Grounded in Beck's CBT, Gottman's Conversational Bids, Rogers' Active Listening, and Kahneman's Behavioral Economics.
6. **Enables Sub-Millisecond Memory Search & RAG Chat**: Uses SQLite FTS5 full-text indexing and Gemini 2.5 Flash RAG for natural language query over all historical memories.

---

## 2. Directory Structure & Architecture

```
sanjaya/
├── smriti/                           # SMRITI VAULT: Storage & Indexing Layer
│   ├── vault/                        # Immutable raw JSON transcript backups
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_key_memories.sql
│   │   └── 003_second_brain_system.sql # NEW: FTS5, Action Items, Entities, Growth Trends
│   └── sanjaya.db                    # SQLite Database with FTS5 index
├── src/
│   ├── shravana.js                   # SHRAVANA DAEMON: NeoSapien transcript fetcher
│   ├── manana.js                     # MANANA ENGINE: Gemini Second Brain extraction & scoring
│   ├── database.js                   # SQLite connector, migration runner & Second Brain queries
│   ├── chat.js                       # RAG engine querying FTS5 + memories
│   ├── server.js                     # Express API server for Second Brain endpoints
│   └── darshana/                     # DARSHANA DASHBOARD: Subtle Gradient React UI
│       └── src/
│           ├── App.jsx               # Main Dashboard with 6 Second Brain Pillars
│           ├── BrainVisualizer.jsx   # 3D Three.js Brain Visualizer
│           ├── ActionItemsCard.jsx   # Interactive TODO & Follow-up Tracker
│           ├── WeaknessTracker.jsx   # Weakness & Growth Trends Radar
│           ├── SearchDrawer.jsx      # Instant FTS5 Search & Transcript Viewer
│           ├── ChatDrawer.jsx        # Ask Sanjaya AI Assistant
│           └── index.css             # Subtle Gradient Design System
```

---

## 3. Database Schema (Migration 003)

```sql
-- SQLite FTS5 Full-Text Search Table for sub-millisecond memory retrieval
CREATE VIRTUAL TABLE IF NOT EXISTS fts_transcripts USING fts5(
  date,
  time,
  speaker,
  content
);

-- Action Items & Follow-ups Table
CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT,
  task TEXT NOT NULL,
  category TEXT DEFAULT 'todo', -- 'todo', 'promise_to_others', 'followup_needed'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  context TEXT,
  assignee TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- People & Project Entities Table
CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'person', 'project', 'topic'
  context_snippet TEXT,
  sentiment TEXT -- 'positive', 'neutral', 'constructive'
);

-- Daily Knowledge & Growth Digest Table
CREATE TABLE IF NOT EXISTS daily_digests (
  date TEXT PRIMARY KEY,
  top_conversations TEXT,  -- JSON string of top 3-5 valuable conversations
  key_takeaways TEXT,       -- JSON string of key takeaways & decisions
  weaknesses_identified TEXT, -- JSON string of cognitive & speech weaknesses detected
  growth_areas TEXT,        -- JSON string of actionable skill growth areas
  research_tip TEXT,        -- Grounded psychological research tip for tomorrow
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Manana Engine Gemini Extraction Specification

The `analyzeTranscript` function in `src/manana.js` will request Gemini 2.5 Flash to return a structured JSON response matching the following schema:

```json
{
  "cognitive_distortion": 8.0,
  "conversational_connection": 8.5,
  "active_listening": 7.5,
  "speech_clarity": 8.0,
  "summary": "High productive day focused on project architecture and team sync.",
  "kaizen_target": "Pause 2 seconds before answering questions to eliminate filler words.",
  "key_memories": [
    {
      "time": "10:30 AM",
      "title": "Architecture Review",
      "description": "Selected SQLite FTS5 hybrid pattern over heavy vector DBs.",
      "duration": "15m",
      "environment": "office"
    }
  ],
  "action_items": [
    {
      "time": "10:45 AM",
      "task": "Update database migration script for FTS5",
      "category": "todo",
      "context": "Spoken during architecture review",
      "assignee": "Self"
    },
    {
      "time": "02:15 PM",
      "task": "Send updated API schema doc to team lead",
      "category": "promise_to_others",
      "context": "Promised during afternoon sync",
      "assignee": "Team Lead"
    }
  ],
  "entities": [
    {
      "entity_name": "Project Sanjaya",
      "entity_type": "project",
      "context_snippet": "Discussed Second Brain features and FTS5 search",
      "sentiment": "positive"
    }
  ],
  "daily_digest": {
    "top_conversations": [
      {
        "title": "Project Sanjaya Second Brain Architecture",
        "impact": "High",
        "key_takeaway": "Agreed on SQLite FTS5 for sub-millisecond transcript retrieval."
      }
    ],
    "key_takeaways": ["FTS5 provides zero-dependency full-text search.", "Single-pass Gemini extraction reduces latency."],
    "weaknesses_identified": ["Slight tendency to interrupt during technical debates when excited."],
    "growth_areas": ["Empathetic Mirroring: Reflect the speaker's core blocker before stating technical solution."],
    "research_tip": "Carl Rogers' Active Listening principle: Mirroring a speaker's emotional state reduces resistance by up to 35% before introducing a counter-proposal."
  }
}
```

---

## 5. Express API Endpoints (`src/server.js`)

1. `GET /api/action-items`: Retrieve action items filtered by status (`pending`/`completed`) or date.
2. `POST /api/action-items/:id/toggle`: Toggle action item status (`pending` <-> `completed`).
3. `GET /api/entities`: Get all entities grouped by `person`, `project`, or `topic`.
4. `GET /api/search?q=keyword`: Perform sub-millisecond FTS5 search across all historical transcripts.
5. `GET /api/digest?date=YYYY-MM-DD`: Retrieve daily digest including weaknesses, top conversations, growth areas, and research-backed tips.
6. `GET /api/weakness-trends`: Retrieve 7-day and 30-day moving averages of communication scores & identified weaknesses.

---

## 6. Darshana Dashboard UI Structure

The Darshana Dashboard UI will be upgraded to feature 6 dedicated Second Brain sections:
1. **Header & Date Selector**: Quick date navigation, "Sync Locket", and "Ask Sanjaya AI" drawer trigger.
2. **Interactive 3D Brain Visualizer**: Real-time Three.js spatial mapping of daily memories across brain lobes.
3. **📌 Pending Action Items & Follow-ups Card**: Filterable tabs (`All`, `TODOs`, `Promises`, `Follow-ups`) with quick checkbox toggling.
4. **⚠️ Weakness & Growth Tracker**: Visual radar showing detected speech/cognitive weaknesses, 7-day trend analysis, and actionable growth areas.
5. **🌟 Top Valuable Conversations & Daily Knowledge Digest**: Summarizing the top 3 high-impact conversations, key decisions made, and research-backed daily Sadhana tip.
6. **🔍 Instant FTS5 Memory Search Drawer**: Global search bar that live-searches all stored transcript lines with exact timestamps and context.

---

## 7. Verification & Testing Strategy
1. **Database Migration Test**: Run migration `003_second_brain.sql` on test DB to verify FTS5 table creation and foreign constraints.
2. **Unit Tests**: Add tests in `tests/second-brain.test.js` covering action item CRUD, entity extraction, FTS5 search queries, and digest APIs.
3. **End-to-End Build Verification**: Execute `npm run build` in `sanjaya/` to ensure React UI compiles cleanly without bundle warnings or errors.
4. **Runtime & Server Tests**: Run all node unit tests with `npm test`.

