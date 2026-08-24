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
      if (callback) return callback(err);
      return;
    }
    
    // Check and apply migration 002
    const migration2 = path.join(__dirname, '../smriti/migrations/002_add_key_memories.sql');
    const sql2 = fs.readFileSync(migration2, 'utf8');
    
    db.all("PRAGMA table_info(daily_scores)", (err2, columns) => {
      if (err2) {
        console.error("PRAGMA table_info failed", err2);
        db.close();
        if (callback) return callback(err2);
        return;
      }
      
      const hasKeyMemories = columns.some(c => c.name === 'key_memories');
      const applyMigration3 = () => {
        const migration3 = path.join(__dirname, '../smriti/migrations/003_second_brain_system.sql');
        if (fs.existsSync(migration3)) {
          const sql3 = fs.readFileSync(migration3, 'utf8');
          db.exec(sql3, (err4) => {
            if (err4) {
              console.error("Migration 003 failed", err4);
              db.close();
              if (callback) callback(err4);
            } else {
              console.log("Migration 003 applied successfully");
              const indexSql = `
                DELETE FROM action_items WHERE rowid NOT IN (SELECT MIN(rowid) FROM action_items GROUP BY date, task);
                DELETE FROM entities WHERE rowid NOT IN (SELECT MIN(rowid) FROM entities GROUP BY date, entity_name, entity_type);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_action_items_date_task ON action_items(date, task);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_entities_date_name ON entities(date, entity_name, entity_type);
              `;
              db.exec(indexSql, (err5) => {
                db.all("PRAGMA table_info(daily_digests)", (err6, cols) => {
                  const hasRecommendedResources = cols && cols.some(c => c.name === 'recommended_resources');
                  if (!hasRecommendedResources) {
                    db.run("ALTER TABLE daily_digests ADD COLUMN recommended_resources TEXT", (err7) => {
                      db.close();
                      if (callback) callback(err5 || err6 || err7 || null);
                    });
                  } else {
                    db.close();
                    if (callback) callback(err5 || err6 || null);
                  }
                });
              });
            }
          });
        } else {
          db.close();
          if (callback) callback(null);
        }
      };

      if (!hasKeyMemories) {
        db.exec(sql2, (err3) => {
          if (err3) console.error("Migration 002 failed", err3);
          else console.log("Migration 002 applied successfully");
          applyMigration3();
        });
      } else {
        applyMigration3();
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
    if (err) console.error("Database save failed with error:", err);
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

// ==========================================
// SECOND BRAIN QUERIES (Migration 003)
// ==========================================

function saveActionItems(date, items, callback) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    if (callback) callback(null);
    return;
  }
  const db = getDbConnection();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO action_items (date, time, task, category, status, context, assignee)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `);

  db.serialize(() => {
    for (const item of items) {
      stmt.run([
        date,
        item.time || 'N/A',
        item.task || 'Task',
        item.category || 'todo',
        item.context || '',
        item.assignee || 'Self'
      ]);
    }
    stmt.finalize((err) => {
      db.close();
      if (callback) callback(err || null);
    });
  });
}

function getActionItems(categoryFilter, callback) {
  const db = getDbConnection();
  let query = `SELECT * FROM action_items`;
  let params = [];
  if (categoryFilter && categoryFilter !== 'all') {
    query += ` WHERE category = ?`;
    params.push(categoryFilter);
  }
  query += ` ORDER BY created_at DESC`;

  db.all(query, params, (err, rows) => {
    db.close();
    callback(err || null, rows);
  });
}

function toggleActionItem(id, callback) {
  const db = getDbConnection();
  db.get(`SELECT status FROM action_items WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      db.close();
      return callback(err || new Error("Action item not found"));
    }
    const newStatus = row.status === 'completed' ? 'pending' : 'completed';
    db.run(`UPDATE action_items SET status = ? WHERE id = ?`, [newStatus, id], function(err2) {
      db.close();
      callback(err2 || null, { id, status: newStatus });
    });
  });
}

function saveEntities(date, entities, callback) {
  if (!entities || !Array.isArray(entities) || entities.length === 0) {
    if (callback) callback(null);
    return;
  }
  const db = getDbConnection();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO entities (date, entity_name, entity_type, context_snippet, sentiment)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.serialize(() => {
    for (const ent of entities) {
      stmt.run([
        date,
        ent.entity_name || 'Entity',
        ent.entity_type || 'topic',
        ent.context_snippet || '',
        ent.sentiment || 'neutral'
      ]);
    }
    stmt.finalize((err) => {
      db.close();
      if (callback) callback(err || null);
    });
  });
}

function getEntities(date, callback) {
  const db = getDbConnection();
  let query = `SELECT * FROM entities`;
  let params = [];
  if (date) {
    query += ` WHERE date = ?`;
    params.push(date);
  }
  query += ` ORDER BY date DESC`;

  db.all(query, params, (err, rows) => {
    db.close();
    callback(err || null, rows);
  });
}

function saveDailyDigest(date, digest, callback) {
  const db = getDbConnection();
  const query = `
    INSERT OR REPLACE INTO daily_digests
    (date, top_conversations, key_takeaways, weaknesses_identified, growth_areas, research_tip, recommended_resources)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [
    date,
    JSON.stringify(digest.top_conversations || []),
    JSON.stringify(digest.key_takeaways || []),
    JSON.stringify(digest.weaknesses_identified || []),
    JSON.stringify(digest.growth_areas || []),
    digest.research_tip || '',
    JSON.stringify(digest.recommended_resources || {})
  ], function(err) {
    db.close();
    if (callback) callback(err || null);
  });
}

function getDailyDigest(date, callback) {
  const db = getDbConnection();
  db.get(`SELECT * FROM daily_digests WHERE date = ?`, [date], (err, row) => {
    if (err || !row) {
      db.all(`SELECT * FROM daily_digests ORDER BY date DESC LIMIT 1`, (err2, rows) => {
        db.close();
        if (err2 || !rows || rows.length === 0) return callback(null, null);
        return callback(null, rows[0]);
      });
    } else {
      db.close();
      callback(null, row);
    }
  });
}

function indexTranscriptFTS(date, time, speaker, content, callback) {
  const db = getDbConnection();
  db.run(`INSERT INTO fts_transcripts (date, time, speaker, content) VALUES (?, ?, ?, ?)`,
    [date, time || 'N/A', speaker || 'Speaker', content || ''],
    function(err) {
      db.close();
      if (callback) callback(err || null);
    }
  );
}

function searchTranscriptsFTS(queryText, callback) {
  if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
    return callback(null, []);
  }
  const db = getDbConnection();
  // Safe FTS query construction
  const cleanQuery = queryText.replace(/['"]/g, '').trim();
  const sql = `
    SELECT date, time, speaker, content 
    FROM fts_transcripts 
    WHERE fts_transcripts MATCH ? 
    ORDER BY date DESC LIMIT 50
  `;
  db.all(sql, [`"${cleanQuery}"*`], (err, rows) => {
    if (err) {
      // Fallback to LIKE if FTS format error
      db.all(`SELECT date, time, speaker, content FROM fts_transcripts WHERE content LIKE ? LIMIT 50`,
        [`%${cleanQuery}%`], (err2, fallbackRows) => {
          db.close();
          callback(err2, fallbackRows || []);
        });
    } else {
      db.close();
      callback(null, rows || []);
    }
  });
}

module.exports = {
  runMigrations,
  getDbConnection,
  saveDailyScore,
  getDailyScores,
  saveActionItems,
  getActionItems,
  toggleActionItem,
  saveEntities,
  getEntities,
  saveDailyDigest,
  getDailyDigest,
  indexTranscriptFTS,
  searchTranscriptsFTS
};
