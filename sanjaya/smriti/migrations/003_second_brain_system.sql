CREATE VIRTUAL TABLE IF NOT EXISTS fts_transcripts USING fts5(
  date,
  time,
  speaker,
  content
);

CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT,
  task TEXT NOT NULL,
  category TEXT DEFAULT 'todo',
  status TEXT DEFAULT 'pending',
  context TEXT,
  assignee TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  context_snippet TEXT,
  sentiment TEXT
);

CREATE TABLE IF NOT EXISTS daily_digests (
  date TEXT PRIMARY KEY,
  top_conversations TEXT,
  key_takeaways TEXT,
  weaknesses_identified TEXT,
  growth_areas TEXT,
  research_tip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
