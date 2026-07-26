import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support cloud persistent volumes (e.g. Render / Railway mount paths)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'mindvault.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    category TEXT,
    tags TEXT,
    platform TEXT,
    interest_score INTEGER DEFAULT 5,
    usefulness_score INTEGER DEFAULT 5,
    user_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    chat_id INTEGER PRIMARY KEY,
    state TEXT NOT NULL,
    last_resource_id INTEGER,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Check existing table columns and perform safe migrations
const columns = db.prepare(`PRAGMA table_info(resources)`).all().map(c => c.name);

if (!columns.includes('content')) {
  try { db.exec(`ALTER TABLE resources ADD COLUMN content TEXT;`); } catch (e) {}
}
if (!columns.includes('file_path')) {
  try { db.exec(`ALTER TABLE resources ADD COLUMN file_path TEXT;`); } catch (e) {}
}
if (!columns.includes('last_interacted_at')) {
  try { db.exec(`ALTER TABLE resources ADD COLUMN last_interacted_at TEXT;`); } catch (e) {}
}
if (!columns.includes('is_pinned')) {
  try { db.exec(`ALTER TABLE resources ADD COLUMN is_pinned INTEGER DEFAULT 0;`); } catch (e) {}
}
if (!columns.includes('status')) {
  try { db.exec(`ALTER TABLE resources ADD COLUMN status TEXT DEFAULT 'active';`); } catch (e) {}
}

// Create github_details table
db.exec(`
  CREATE TABLE IF NOT EXISTS github_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER UNIQUE NOT NULL,
    repo_owner TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    primary_language TEXT,
    use_cases TEXT,
    quickstart_playbook TEXT,
    tech_stack_summary TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
  );
`);

// Database Helper functions
export const Database = {
  // Resources
  getAllResources: (search = '', category = '', platform = '', sortBy = 'created_at', sortOrder = 'DESC') => {
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ? OR user_notes LIKE ? OR content LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild, searchWild);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (platform) {
      query += ' AND platform = ?';
      params.push(platform);
    }

    // Sanitize sort column and order to prevent SQL injection
    const allowedSortColumns = ['created_at', 'interest_score', 'usefulness_score', 'title', 'platform', 'category'];
    const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  getResourceById: (id) => {
    const stmt = db.prepare('SELECT * FROM resources WHERE id = ?');
    return stmt.get(id);
  },

  getResourceByUrl: (url) => {
    const stmt = db.prepare('SELECT * FROM resources WHERE url = ?');
    return stmt.get(url);
  },

  createResource: ({ url, title, summary, category, tags, platform, interest_score, usefulness_score, user_notes, content, file_path }) => {
    const stmt = db.prepare(`
      INSERT INTO resources (url, title, summary, category, tags, platform, interest_score, usefulness_score, user_notes, content, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      url,
      title || 'Untitled Resource',
      summary || '',
      category || 'Other',
      tags || '',
      platform || 'Other',
      interest_score !== undefined ? interest_score : 5,
      usefulness_score !== undefined ? usefulness_score : 5,
      user_notes || '',
      content || '',
      file_path || ''
    );
    return res.lastInsertRowid;
  },

  updateResource: (id, updates) => {
    const fields = [];
    const params = [];
    
    // Add updated_at automatically
    updates.updated_at = new Date().toISOString();

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
    
    if (fields.length === 0) return 0;
    
    params.push(id);
    const query = `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    const res = stmt.run(...params);
    return res.changes;
  },

  deleteResource: (id) => {
    const stmt = db.prepare('DELETE FROM resources WHERE id = ?');
    const res = stmt.run(id);
    return res.changes;
  },

  getStats: () => {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM resources');
    const total = totalStmt.get().count;

    const platformStmt = db.prepare('SELECT platform, COUNT(*) as count FROM resources GROUP BY platform');
    const platforms = platformStmt.all();

    const categoryStmt = db.prepare('SELECT category, COUNT(*) as count FROM resources GROUP BY category');
    const categories = categoryStmt.all();

    const avgScoresStmt = db.prepare('SELECT AVG(interest_score) as avg_interest, AVG(usefulness_score) as avg_usefulness FROM resources');
    const avgScores = avgScoresStmt.get();

    return {
      total,
      platforms,
      categories,
      avg_interest: avgScores.avg_interest ? Math.round(avgScores.avg_interest * 10) / 10 : 0,
      avg_usefulness: avgScores.avg_usefulness ? Math.round(avgScores.avg_usefulness * 10) / 10 : 0
    };
  },

  // Telegram Conversations
  getConversationState: (chatId) => {
    const stmt = db.prepare('SELECT * FROM conversations WHERE chat_id = ?');
    return stmt.get(chatId);
  },

  setConversationState: (chatId, state, lastResourceId = null) => {
    const stmt = db.prepare(`
      INSERT INTO conversations (chat_id, state, last_resource_id, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(chat_id) DO UPDATE SET
        state = excluded.state,
        last_resource_id = excluded.last_resource_id,
        updated_at = CURRENT_TIMESTAMP
    `);
    const res = stmt.run(chatId, state, lastResourceId);
    return res.changes;
  },

  clearConversationState: (chatId) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE chat_id = ?');
    const res = stmt.run(chatId);
    return res.changes;
  },

  // GitHub Extensions
  saveGitHubDetails: (resourceId, details) => {
    const stmt = db.prepare(`
      INSERT INTO github_details (resource_id, repo_owner, repo_name, stars, forks, primary_language, use_cases, quickstart_playbook, tech_stack_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(resource_id) DO UPDATE SET
        stars = excluded.stars,
        forks = excluded.forks,
        primary_language = excluded.primary_language,
        use_cases = excluded.use_cases,
        quickstart_playbook = excluded.quickstart_playbook,
        tech_stack_summary = excluded.tech_stack_summary
    `);
    return stmt.run(
      resourceId,
      details.repo_owner,
      details.repo_name,
      details.stars || 0,
      details.forks || 0,
      details.primary_language || 'Unknown',
      typeof details.use_cases === 'string' ? details.use_cases : JSON.stringify(details.use_cases || []),
      typeof details.quickstart_playbook === 'string' ? details.quickstart_playbook : JSON.stringify(details.quickstart_playbook || {}),
      details.tech_stack_summary || ''
    );
  },

  getGitHubDetails: (resourceId) => {
    return db.prepare('SELECT * FROM github_details WHERE resource_id = ?').get(resourceId);
  },

  updateLastInteracted: (resourceId) => {
    return db.prepare("UPDATE resources SET last_interacted_at = CURRENT_TIMESTAMP WHERE id = ?").run(resourceId);
  },

  togglePin: (resourceId, isPinned) => {
    const pinnedVal = isPinned ? 1 : 0;
    const statusVal = isPinned ? 'pinned' : 'active';
    return db.prepare("UPDATE resources SET is_pinned = ?, status = ?, last_interacted_at = CURRENT_TIMESTAMP WHERE id = ?").run(pinnedVal, statusVal, resourceId);
  },

  pruneInactiveGitHubRepos: (inactivityDays = 14) => {
    const cutoffDate = new Date(Date.now() - inactivityDays * 86400 * 1000).toISOString();
    const result = db.prepare(`
      UPDATE resources 
      SET status = 'pruned' 
      WHERE platform = 'GitHub' 
        AND is_pinned = 0 
        AND status = 'active' 
        AND (last_interacted_at < ? OR (last_interacted_at IS NULL AND created_at < ?))
    `).run(cutoffDate, cutoffDate);
    return Number(result.changes);
  }
};
