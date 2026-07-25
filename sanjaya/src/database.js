const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../smriti');
const DB_PATH = path.join(DB_DIR, 'sanjaya.db');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getDbConnection() {
  return new sqlite3.Database(DB_PATH);
}

function runMigrations(callback) {
  const db = getDbConnection();
  const migrationPath = path.join(__dirname, '../smriti/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  db.exec(sql, (err) => {
    if (err) {
      console.error("Migration failed", err);
    } else {
      console.log("Migrations applied successfully");
    }
    db.close();
    if (callback) callback(err);
  });
}

function saveDailyScore(date, scores, callback) {
  const db = getDbConnection();
  const query = `
    INSERT OR REPLACE INTO daily_scores 
    (date, cognitive_distortion, conversational_connection, active_listening, speech_clarity, summary, kaizen_target, raw_vault_path) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [
    date,
    scores.cognitive_distortion,
    scores.conversational_connection,
    scores.active_listening,
    scores.speech_clarity,
    scores.summary,
    scores.kaizen_target,
    scores.raw_vault_path
  ], function(err) {
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
