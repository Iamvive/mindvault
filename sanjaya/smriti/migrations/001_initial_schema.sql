CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS daily_scores (
  date TEXT PRIMARY KEY,
  cognitive_distortion REAL,
  conversational_connection REAL,
  active_listening REAL,
  speech_clarity REAL,
  summary TEXT,
  kaizen_target TEXT,
  raw_vault_path TEXT
);
