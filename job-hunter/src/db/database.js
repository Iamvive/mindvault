import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export function initDatabase(dbPath = './data/jobs.db') {
  const dir = path.dirname(dbPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      platformJobId TEXT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      url TEXT UNIQUE,
      jdText TEXT,
      atsScore INTEGER DEFAULT 0,
      matchingKeywords TEXT,
      missingKeywords TEXT,
      tailoredSummary TEXT,
      tailoredBullets TEXT,
      highlightedSkills TEXT,
      screeningAnswers TEXT,
      pdfPath TEXT,
      status TEXT DEFAULT 'queued',
      notes TEXT,
      submittedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_company_title ON jobs(company, title);
    CREATE INDEX IF NOT EXISTS idx_jobs_url ON jobs(url);
  `);

  return db;
}

export function saveJob(db, job) {
  const stmt = db.prepare(`
    INSERT INTO jobs (
      platform, platformJobId, title, company, location, url, jdText,
      atsScore, matchingKeywords, missingKeywords, tailoredSummary,
      tailoredBullets, highlightedSkills, screeningAnswers, pdfPath, status
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
    ON CONFLICT(url) DO UPDATE SET
      atsScore = excluded.atsScore,
      tailoredSummary = excluded.tailoredSummary,
      tailoredBullets = excluded.tailoredBullets,
      highlightedSkills = excluded.highlightedSkills,
      screeningAnswers = excluded.screeningAnswers,
      pdfPath = excluded.pdfPath,
      updatedAt = CURRENT_TIMESTAMP
  `);

  const platform = job.platform || 'unknown';
  const platformJobId = job.platformJobId || null;
  const title = job.title || '';
  const company = job.company || '';
  const location = job.location || '';
  const url = job.url || `synthetic_${Date.now()}_${Math.random()}`;
  const jdText = job.jdText || '';
  const atsScore = job.atsScore || 0;
  const matchingKeywords = typeof job.matchingKeywords === 'object' ? JSON.stringify(job.matchingKeywords) : (job.matchingKeywords || null);
  const missingKeywords = typeof job.missingKeywords === 'object' ? JSON.stringify(job.missingKeywords) : (job.missingKeywords || null);
  const tailoredSummary = job.tailoredSummary || '';
  const tailoredBullets = typeof job.tailoredBullets === 'object' ? JSON.stringify(job.tailoredBullets) : (job.tailoredBullets || null);
  const highlightedSkills = typeof job.highlightedSkills === 'object' ? JSON.stringify(job.highlightedSkills) : (job.highlightedSkills || null);
  const screeningAnswers = typeof job.screeningAnswers === 'object' ? JSON.stringify(job.screeningAnswers) : (job.screeningAnswers || null);
  const pdfPath = job.pdfPath || null;
  const status = job.status || 'queued';

  const info = stmt.run(
    platform, platformJobId, title, company, location, url, jdText,
    atsScore, matchingKeywords, missingKeywords, tailoredSummary,
    tailoredBullets, highlightedSkills, screeningAnswers, pdfPath, status
  );

  return { id: Number(info.lastInsertRowid), ...job };
}

export function getQueuedJobs(db) {
  return db.prepare(`SELECT * FROM jobs WHERE status = 'queued' ORDER BY atsScore DESC, createdAt DESC`).all();
}

export function getAllJobs(db, limit = 100) {
  return db.prepare(`SELECT * FROM jobs ORDER BY createdAt DESC LIMIT ?`).all(limit);
}

export function getJobById(db, id) {
  return db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(id);
}

export function updateJobStatus(db, id, status, meta = {}) {
  const fields = ['status = ?', 'updatedAt = CURRENT_TIMESTAMP'];
  const values = [status];

  if (meta.submittedAt) {
    fields.push('submittedAt = ?');
    values.push(meta.submittedAt);
  }
  if (meta.notes) {
    fields.push('notes = ?');
    values.push(meta.notes);
  }
  if (meta.screeningAnswers) {
    fields.push('screeningAnswers = ?');
    values.push(typeof meta.screeningAnswers === 'object' ? JSON.stringify(meta.screeningAnswers) : meta.screeningAnswers);
  }

  values.push(id);
  db.prepare(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function isJobApplied(db, company, title, url) {
  if (url) {
    const row = db.prepare(`SELECT id, status FROM jobs WHERE url = ?`).get(url);
    if (row) return true;
  }
  const row = db.prepare(`SELECT id, status FROM jobs WHERE LOWER(company) = LOWER(?) AND LOWER(title) = LOWER(?)`).get(company, title);
  return !!row;
}
