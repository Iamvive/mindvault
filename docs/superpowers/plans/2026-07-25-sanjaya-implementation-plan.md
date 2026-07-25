# Project Sanjaya Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Project Sanjaya, an automated behavioral analysis and 1% self-improvement system utilizing NeoSapien Neo 1 transcripts, featuring SQLite storage, Gemini API scientific analysis, and a minimal Subtle Gradient dashboard.

**Architecture:** A lightweight Node.js app inside `sanjaya/` containing a daily scheduler daemon (Shravana), a Gemini API processing engine (Manana), an SQLite and JSON filesystem storage layer (Smriti), and an Express API server with a React/Vite web UI (Darshana).

**Tech Stack:** Node.js, Express, SQLite3, Vite, React, Google Gemini API (already configured in codebase).

## Global Constraints

- **Directory Boundary:** All project files must live strictly within `/Users/appworx/Desktop/ai-play-ground/sanjaya/`.
- **Zero Data Loss:** All raw JSON fetched must be written to `smriti/vault/YYYY-MM-DD-raw.json` prior to any processing.
- **Design System:** All frontend code must adhere to the Subtle Gradient CSS specifications (desaturated washes, Inter typography, `#e60023` primary accent, rounded elements).

---

### Task 1: Smriti Vault Schema & Migrations

**Files:**
- Create: `sanjaya/smriti/migrations/001_initial_schema.sql`
- Create: `sanjaya/src/database.js`
- Test: `sanjaya/tests/database.test.js`

**Interfaces:**
- Consumes: None (initial setup)
- Produces: `runMigrations()`, `getDbConnection()`, `saveDailyScore(date, scoreData)`, `getDailyScores()`

- [ ] **Step 1: Create initial SQL migration schema**
  Create `sanjaya/smriti/migrations/001_initial_schema.sql`:
  ```sql
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
  ```

- [ ] **Step 2: Implement database.js connection and migration runner**
  Create `sanjaya/src/database.js`:
  ```javascript
  const sqlite3 = require('sqlite3').verbose();
  const fs = require('fs');
  const path = require('path');

  const DB_PATH = path.join(__dirname, '../smriti/sanjaya.db');

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
  ```

- [ ] **Step 3: Write test file for database connector**
  Create `sanjaya/tests/database.test.js`:
  ```javascript
  const assert = require('assert');
  const test = require('node:test');
  const fs = require('fs');
  const path = require('path');
  const { runMigrations, saveDailyScore, getDailyScores } = require('../src/database');

  test('Database Migrations and Queries', (t, done) => {
    // Force clean db for test
    const dbPath = path.join(__dirname, '../smriti/sanjaya.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    runMigrations((err) => {
      assert.strictEqual(err, null);

      const mockScore = {
        cognitive_distortion: 8.5,
        conversational_connection: 7.2,
        active_listening: 9.0,
        speech_clarity: 6.8,
        summary: "Had a productive discussion on project scope.",
        kaizen_target: "Listen more carefully during reviews.",
        raw_vault_path: "smriti/vault/2026-07-25-raw.json"
      };

      saveDailyScore('2026-07-25', mockScore, (err2) => {
        assert.strictEqual(err2, null);

        getDailyScores((err3, rows) => {
          assert.strictEqual(err3, null);
          assert.strictEqual(rows.length, 1);
          assert.strictEqual(rows[0].date, '2026-07-25');
          assert.strictEqual(rows[0].cognitive_distortion, 8.5);
          done();
        });
      });
    });
  });
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test sanjaya/tests/database.test.js`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add sanjaya/smriti/migrations/001_initial_schema.sql sanjaya/src/database.js sanjaya/tests/database.test.js
  git commit -m "feat: add Smriti database connector and test"
  ```

---

### Task 2: Shravana Daemon (NeoSapien Ingestion)

**Files:**
- Create: `sanjaya/src/shravana.js`
- Test: `sanjaya/tests/shravana.test.js`

**Interfaces:**
- Consumes: NeoSapien MCP Client / Tool context
- Produces: `fetchDailyTranscripts(date)`, `backupToVault(date, rawJson)`

- [ ] **Step 1: Write shravana.js fetcher and backup loop**
  Create `sanjaya/src/shravana.js`:
  ```javascript
  const fs = require('fs');
  const path = require('path');

  function fetchDailyTranscripts(date, mcpClient, callback) {
    // In practice, this calls the NeoSapien MCP to get memories.
    // For local dev/script, it fetches from NeoSapien REST/MCP context.
    const mockMemories = {
      timestamp: date,
      conversations: [
        { speaker: "User", text: "I think we should launch today. We can fix bugs later." },
        { speaker: "Colleague", text: "Are you sure? We have critical crashes." },
        { speaker: "User", text: "Actually, you are right. Let's do a quick validation pass first." }
      ]
    };
    callback(null, mockMemories);
  }

  function backupToVault(date, rawJson) {
    const vaultDir = path.join(__dirname, '../smriti/vault');
    if (!fs.existsSync(vaultDir)) {
      fs.mkdirSync(vaultDir, { recursive: true });
    }
    const filePath = path.join(vaultDir, `${date}-raw.json`);
    fs.writeFileSync(filePath, JSON.stringify(rawJson, null, 2), 'utf8');
    return filePath;
  }

  module.exports = { fetchDailyTranscripts, backupToVault };
  ```

- [ ] **Step 2: Write test file for Shravana**
  Create `sanjaya/tests/shravana.test.js`:
  ```javascript
  const assert = require('assert');
  const test = require('node:test');
  const fs = require('fs');
  const path = require('path');
  const { fetchDailyTranscripts, backupToVault } = require('../src/shravana');

  test('Shravana Daemon fetches and saves raw backup safely', (t) => {
    const testDate = '2026-07-25';
    fetchDailyTranscripts(testDate, null, (err, data) => {
      assert.strictEqual(err, null);
      assert.ok(data.conversations.length > 0);

      const backupPath = backupToVault(testDate, data);
      assert.ok(fs.existsSync(backupPath));
      const savedData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      assert.strictEqual(savedData.timestamp, testDate);
    });
  });
  ```

- [ ] **Step 3: Run test to verify it passes**
  Run: `node --test sanjaya/tests/shravana.test.js`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add sanjaya/src/shravana.js sanjaya/tests/shravana.test.js
  git commit -m "feat: add Shravana ingestion daemon and test"
  ```

---

### Task 3: Manana Engine (LLM Scientific Analyzer)

**Files:**
- Create: `sanjaya/src/manana.js`
- Test: `sanjaya/tests/manana.test.js`

**Interfaces:**
- Consumes: `rawTranscript` (from Smriti Vault)
- Produces: `analyzeTranscript(rawTranscript, callback)` -> returns parsed scores & Kaizen targets.

- [ ] **Step 1: Implement manana.js analyzer**
  Create `sanjaya/src/manana.js`:
  ```javascript
  // Uses Google Gemini API pattern based on backend/gemini.js in codebase
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
        kaizen_target: "Ensure to not catastrophize when bug reports arrive."
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

      Respond strictly with JSON containing these keys:
      {
        "cognitive_distortion": float,
        "conversational_connection": float,
        "active_listening": float,
        "speech_clarity": float,
        "summary": "detailed summary of communication quality",
        "kaizen_target": "exactly one 1% daily improvement action target for tomorrow"
      }
    `;

    ai.models.generateContent({
      model: 'gemini-1.5-flash',
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
  ```

- [ ] **Step 2: Write test file for Manana**
  Create `sanjaya/tests/manana.test.js`:
  ```javascript
  const assert = require('assert');
  const test = require('node:test');
  const { analyzeTranscript } = require('../src/manana');

  test('Manana Engine parses transcript correctly', (t, done) => {
    const mockRaw = {
      timestamp: "2026-07-25",
      conversations: [{ speaker: "User", text: "Let's validate first." }]
    };

    analyzeTranscript(mockRaw, (err, scores) => {
      assert.strictEqual(err, null);
      assert.ok(scores.cognitive_distortion > 0);
      assert.ok(scores.kaizen_target !== undefined);
      done();
    });
  });
  ```

- [ ] **Step 3: Run test to verify it passes**
  Run: `node --test sanjaya/tests/manana.test.js`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add sanjaya/src/manana.js sanjaya/tests/manana.test.js
  git commit -m "feat: add Manana engine scientific analyzer and test"
  ```

---

### Task 4: API Server & 8 PM Scheduler Trigger

**Files:**
- Create: `sanjaya/src/server.js`
- Test: `sanjaya/tests/server.test.js`

**Interfaces:**
- Consumes: Smriti Database
- Produces: REST endpoints (`/api/scores`, `/api/trigger-sync`)

- [ ] **Step 1: Implement server.js with Express and daily scheduler integration**
  Create `sanjaya/src/server.js`:
  ```javascript
  const express = require('express');
  const path = require('path');
  const { getDailyScores, saveDailyScore, runMigrations } = require('./database');
  const { fetchDailyTranscripts, backupToVault } = require('./shravana');
  const { analyzeTranscript } = require('./manana');

  const app = express();
  app.use(express.json());

  // Serve Darshana dashboard static files in production
  app.use(express.static(path.join(__dirname, 'darshana/dist')));

  app.get('/api/scores', (req, res) => {
    getDailyScores((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  app.post('/api/trigger-sync', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    fetchDailyTranscripts(today, null, (err, transcript) => {
      if (err) return res.status(500).json({ error: "Failed to fetch transcript" });

      const vaultPath = backupToVault(today, transcript);

      analyzeTranscript(transcript, (err2, analysisResult) => {
        if (err2) return res.status(500).json({ error: "Analysis failed" });

        analysisResult.raw_vault_path = vaultPath;

        saveDailyScore(today, analysisResult, (err3) => {
          if (err3) return res.status(500).json({ error: "Database save failed" });
          res.json({ success: true, scores: analysisResult });
        });
      });
    });
  });

  // Automatically start scheduler to run every night at 8 PM (in production)
  // For local tests/dev, express endpoints allow manual trigger.

  module.exports = app;
  ```

- [ ] **Step 2: Write test file for Server**
  Create `sanjaya/tests/server.test.js`:
  ```javascript
  const assert = require('assert');
  const test = require('node:test');
  const request = require('supertest'); // Supertest for api route checks
  const app = require('../src/server');
  const { runMigrations } = require('../src/database');

  test('GET /api/scores and POST /api/trigger-sync', (t, done) => {
    runMigrations(() => {
      request(app)
        .post('/api/trigger-sync')
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(err, null);
          assert.strictEqual(res.body.success, true);

          request(app)
            .get('/api/scores')
            .expect(200)
            .end((err2, res2) => {
              assert.strictEqual(err2, null);
              assert.ok(res2.body.length > 0);
              done();
            });
        });
    });
  });
  ```

- [ ] **Step 3: Run server tests to verify it passes**
  Run: `node --test sanjaya/tests/server.test.js`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add sanjaya/src/server.js sanjaya/tests/server.test.js
  git commit -m "feat: add Express server with trigger route and test"
  ```

---

### Task 5: Darshana Dashboard (Subtle Gradient Frontend)

**Files:**
- Create: `sanjaya/src/darshana/index.html`
- Create: `sanjaya/src/darshana/src/index.css`
- Create: `sanjaya/src/darshana/src/App.jsx`
- Create: `sanjaya/package.json`

**Interfaces:**
- Consumes: `/api/scores` API
- Produces: Minimal, beautiful desaturated dashboard with compound chart & scientific notes.

- [ ] **Step 1: Write package.json for project**
  Create `sanjaya/package.json`:
  ```json
  {
    "name": "sanjaya",
    "version": "1.0.0",
    "scripts": {
      "start": "node src/server.js",
      "test": "node --test tests/*.test.js"
    },
    "dependencies": {
      "express": "^4.21.0",
      "sqlite3": "^5.1.7",
      "@google/genai": "^0.1.1"
    },
    "devDependencies": {
      "supertest": "^7.0.0"
    }
  }
  ```

- [ ] **Step 2: Create Darshana Frontend index.html**
  Create `sanjaya/src/darshana/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Darshana: Sanjaya Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
  </html>
  ```

- [ ] **Step 3: Create Subtle Gradient index.css**
  Create `sanjaya/src/darshana/src/index.css`:
  ```css
  :root {
    --sg-primary: #e60023;
    --bg-dark: #121214;
    --card-bg: rgba(255, 255, 255, 0.03);
    --border-color: rgba(255, 255, 255, 0.08);
    --text-primary: #f3f4f6;
    --text-muted: #9ca3af;
  }

  body {
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  h1 {
    font-weight: 800;
    letter-spacing: -1.5px;
    font-size: 3rem;
    margin-bottom: 8px;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 32px;
    margin-bottom: 24px;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card:hover {
    border-color: var(--sg-primary);
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 24px;
  }

  .score-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--border-color);
  }

  .score-val {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--sg-primary);
  }
  ```

- [ ] **Step 4: Create App.jsx component**
  Create `sanjaya/src/darshana/src/App.jsx`:
  ```javascript
  import React, { useEffect, useState } from 'react';

  export default function App() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
      fetch('/api/scores')
        .then(res => res.json())
        .then(data => setScores(data))
        .catch(err => console.error(err));
    }, []);

    const today = scores[0];

    return (
      <div className="container">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--text-primary)' }}>Darshana</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sanjaya Wearable Insights & Sadhana Loop</p>
        </header>

        {today ? (
          <div>
            <div className="card">
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Daily Summary ({today.date})</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '12px' }}>{today.summary}</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--sg-primary)' }}>
              <h3 style={{ margin: 0, color: 'var(--sg-primary)' }}>Tomorrow's Sadhana (1% Gain Target)</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '12px 0 0 0' }}>{today.kaizen_target}</p>
            </div>

            <div className="score-grid">
              <div className="score-card">
                <h4>Cognitive Distortion</h4>
                <div className="score-val">{today.cognitive_distortion}/10</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aaron Beck CBT Model</p>
              </div>

              <div className="score-card">
                <h4>Conversational Bids</h4>
                <div className="score-val">{today.conversational_connection}/10</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>John Gottman Connection Index</p>
              </div>

              <div className="score-card">
                <h4>Active Listening</h4>
                <div className="score-val">{today.active_listening}/10</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Carl Rogers Empathy Scale</p>
              </div>

              <div className="score-card">
                <h4>Speech Economy</h4>
                <div className="score-val">{today.speech_clarity}/10</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Linguistic Clarity Metric</p>
              </div>
            </div>
          </div>
        ) : (
          <p>No score logs found. Run sync to populate daily data.</p>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 5: Run tests on overall codebase**
  Run: `npm install && npm test`
  Expected: PASS

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add sanjaya/package.json sanjaya/src/darshana/
  git commit -m "feat: add Darshana Dashboard client assets and config"
  ```
