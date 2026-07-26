const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../smriti');
function getDbConnection() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const dbPath = process.env.DB_PATH || path.join(DB_DIR, 'sanjaya.db');
  return new sqlite3.Database(dbPath);
}

function runMigrations(callback) {
  const db = getDbConnection();
  const migration1 = path.join(__dirname, '../smriti/migrations/001_initial_schema.sql');
  const sql1 = fs.readFileSync(migration1, 'utf8');

  db.exec(sql1, (err) => {
    if (err) {
      console.error("Migration 001 failed", err);
      db.close();
      return callback(err);
    }
    
    // Check and apply migration 002
    const migration2 = path.join(__dirname, '../smriti/migrations/002_add_key_memories.sql');
    const sql2 = fs.readFileSync(migration2, 'utf8');
    
    db.all("PRAGMA table_info(daily_scores)", (err2, columns) => {
      if (err2) {
        console.error("PRAGMA table_info failed", err2);
        db.close();
        return callback(err2);
      }
      
      const hasKeyMemories = columns.some(c => c.name === 'key_memories');
      if (!hasKeyMemories) {
        db.exec(sql2, (err3) => {
          if (err3) {
            console.error("Migration 002 failed", err3);
          } else {
            console.log("Migration 002 applied successfully");
          }
          db.close();
          if (callback) callback(err3);
        });
      } else {
        console.log("Migrations are up to date");
        db.close();
        if (callback) callback(null);
      }
    });
  });
}

function saveDailyScore(date, scores, callback) {
  const db = getDbConnection();
  const query = `
    INSERT OR REPLACE INTO daily_scores 
    (date, cognitive_distortion, conversational_connection, active_listening, speech_clarity, summary, kaizen_target, raw_vault_path, key_memories) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [
    date,
    scores.cognitive_distortion,
    scores.conversational_connection,
    scores.active_listening,
    scores.speech_clarity,
    scores.summary,
    scores.kaizen_target,
    scores.raw_vault_path,
    JSON.stringify(scores.key_memories || [])
  ], function(err) {
    if (err) {
      console.error("Database save failed with error:", err);
    }
    db.close();
    if (callback) callback(err);
  });
}

function getDailyScores(callback) {
  const db = getDbConnection();
  db.all(`SELECT * FROM daily_scores ORDER BY date DESC`, (err, rows) => {
    db.close();
    callback(err, rows);
  });
}

module.exports = { runMigrations, getDbConnection, saveDailyScore, getDailyScores };
