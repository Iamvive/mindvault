# Project Sanjaya Scale & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement memory-scaling architectures (date selector, top 3 highlights, full vault streaming) and completely restyle the Darshana Dashboard using the shared Subtle Gradient Design System.

**Architecture:**
- **Database Migration:** Add `002_add_key_memories.sql` to introduce a `key_memories` column (storing the top 3 highlights as a JSON array in SQLite).
- **Backend API Update:** Expose a new `/api/raw-transcript?date=YYYY-MM-DD` endpoint that streams full transcripts from the Smriti Vault.
- **Frontend Redesign:** Link `/shared/design-system/subtle-gradient.css` into the React stylesheet, apply the desaturated gradients, oval geometry (`32px` cards, `9999px` pills), and double-ring focus states.
- **Frontend Memory Features:** Add a Date Picker, a list showing the Top 3 Memories, and a modal drawer showing the full transcript of the day.

**Tech Stack:** React, Express, SQLite, Subtle Gradient CSS.

## Global Constraints

- **Design System Constraints:** Inter/system-ui fonts only, desaturated background washes, `--sg-primary` (`#e60023`) accent, `--radius-lg` (`32px`) cards, `--radius-full` (`9999px`) pills/badges, and double-ring focus shadows.
- **Zero Data Loss:** Raw transcripts are always fetched, written to `smriti/vault/` first, then parsed and stored.

---

### Task 1: Smriti Schema Migration for Memories

**Files:**
- Create: `sanjaya/smriti/migrations/002_add_key_memories.sql`
- Modify: `sanjaya/src/database.js`
- Test: `sanjaya/tests/database.test.js`

**Interfaces:**
- Consumes: None (SQL execution)
- Produces: SQLite migration runner updates, expanded schema columns.

- [ ] **Step 1: Create the new migration file**
  Create `sanjaya/smriti/migrations/002_add_key_memories.sql`:
  ```sql
  ALTER TABLE daily_scores ADD COLUMN key_memories TEXT;
  ```

- [ ] **Step 2: Update migration runner in database.js**
  Modify `sanjaya/src/database.js` to run migration `002` if column doesn't exist:
  ```javascript
  // Replace runMigrations function to read and run both SQL files sequentially:
  function runMigrations(callback) {
    const db = getDbConnection();
    const migration1 = path.join(__dirname, '../smriti/migrations/001_initial_schema.sql');
    const sql1 = fs.readFileSync(migration1, 'utf8');

    db.exec(sql1, (err) => {
      if (err) {
        db.close();
        return callback(err);
      }
      
      // Run migration 2
      const migration2 = path.join(__dirname, '../smriti/migrations/002_add_key_memories.sql');
      const sql2 = fs.readFileSync(migration2, 'utf8');
      
      // We wrap in a check to see if key_memories column exists
      db.all("PRAGMA table_info(daily_scores)", (err2, columns) => {
        if (err2) {
          db.close();
          return callback(err2);
        }
        const hasKeyMemories = columns.some(c => c.name === 'key_memories');
        if (!hasKeyMemories) {
          db.exec(sql2, (err3) => {
            db.close();
            if (callback) callback(err3);
          });
        } else {
          db.close();
          if (callback) callback(null);
        }
      });
    });
  }
  ```

- [ ] **Step 3: Update database query signatures in database.js**
  Modify `saveDailyScore` in `sanjaya/src/database.js` to include the `key_memories` column:
  ```javascript
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
      db.close();
      if (callback) callback(err);
    });
  }
  ```

- [ ] **Step 4: Update database tests to verify new column**
  Modify `sanjaya/tests/database.test.js` to include `key_memories` verification:
  ```javascript
  // Add key_memories: [{time: "10:30 AM", title: "Meeting", description: "Details"}] to mockScore in database.test.js
  // Assert rows[0].key_memories contains the JSON array string
  ```

- [ ] **Step 5: Run database tests to verify passing**
  Run: `node --test tests/database.test.js`
  Expected: PASS

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add sanjaya/smriti/migrations/002_add_key_memories.sql sanjaya/src/database.js sanjaya/tests/database.test.js
  git commit -m "feat: add key_memories migration and update database helpers"
  ```

---

### Task 2: Update Ingestion & Manana Prompt for Top 3 Highlights

**Files:**
- Modify: `sanjaya/src/shravana.js`
- Modify: `sanjaya/src/manana.js`
- Modify: `sanjaya/tests/manana.test.js`

- [ ] **Step 1: Update shravana.js to provide mock memories representing daily logs**
  Modify `fetchDailyTranscripts` in `sanjaya/src/shravana.js` to return a larger transcript set to test parsing:
  ```javascript
  const mockMemories = {
    timestamp: date,
    conversations: [
      { speaker: "User", text: "I think we should launch today. We can fix bugs later." },
      { speaker: "Colleague", text: "Are you sure? We have critical crashes." },
      { speaker: "User", text: "Actually, you are right. Let's do a quick validation pass first." },
      { speaker: "Partner", text: "Make sure you call the plumber today." },
      { speaker: "User", text: "Will do. I will dial them right after this meeting." }
    ]
  };
  ```

- [ ] **Step 2: Update manana.js to extract the top 3 highlight memories**
  Modify the prompt in `sanjaya/src/manana.js` to extract `key_memories`:
  ```javascript
  // Prompt instructions:
  // "key_memories": [
  //   {"time": "10:30 AM", "title": "Launch Discussion", "description": "Debated releasing with crashes. Selected validation pass."},
  //   ... (exactly 3 objects representing the most significant moments)
  // ]
  ```

- [ ] **Step 3: Update tests in tests/manana.test.js**
  Verify the analyzer returns `key_memories` with length 3.

- [ ] **Step 4: Run manana tests**
  Run: `node --test tests/manana.test.js`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add sanjaya/src/shravana.js sanjaya/src/manana.js sanjaya/tests/manana.test.js
  git commit -m "feat: update Manana analyzer to extract top 3 key memories"
  ```

---

### Task 3: Ingress API to Fetch Full Transcript & Date Queries

**Files:**
- Modify: `sanjaya/src/server.js`
- Create: `sanjaya/tests/server-detail.test.js`

- [ ] **Step 1: Add date query filter to /api/scores**
  Modify `sanjaya/src/server.js` to optionally fetch scores by a specific date:
  ```javascript
  app.get('/api/scores', (req, res) => {
    const { date } = req.query;
    getDailyScores((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (date) {
        const filtered = rows.filter(r => r.date === date);
        return res.json(filtered);
      }
      res.json(rows);
    });
  });
  ```

- [ ] **Step 2: Implement /api/raw-transcript endpoint**
  Add raw transcript route to `sanjaya/src/server.js`:
  ```javascript
  app.get('/api/raw-transcript', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date parameter is required" });
    const vaultPath = path.join(__dirname, `../smriti/vault/${date}-raw.json`);
    fs.readFile(vaultPath, 'utf8', (err, data) => {
      if (err) return res.status(404).json({ error: "Transcript not found" });
      res.json(JSON.parse(data));
    });
  });
  ```

- [ ] **Step 3: Write tests verifying date filters and raw endpoints**
  Create `sanjaya/tests/server-detail.test.js`:
  ```javascript
  // Verify GET /api/scores?date=YYYY-MM-DD
  // Verify GET /api/raw-transcript?date=YYYY-MM-DD
  ```

- [ ] **Step 4: Run server integration tests**
  Run: `node --test tests/server-detail.test.js`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add sanjaya/src/server.js sanjaya/tests/server-detail.test.js
  git commit -m "feat: add date filters and raw transcript fetch API"
  ```

---

### Task 4: Darshana Styling & Subtle Gradient Design System Link

**Files:**
- Modify: `sanjaya/src/darshana/src/index.css`
- Modify: `sanjaya/src/darshana/src/App.jsx`

- [ ] **Step 1: Connect and load design variables in index.css**
  Link the shared CSS tokens in `sanjaya/src/darshana/src/index.css`:
  ```css
  @import '../../../../../shared/design-system/subtle-gradient.css';

  /* Map Subtle Gradient variables to app structure */
  body {
    background: var(--gradient-page);
    color: var(--text-body);
  }

  .card {
    background: var(--surface-canvas);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-lg); /* 32px major card */
  }

  button {
    border-radius: var(--radius-full); /* 9999px pills */
  }
  ```

- [ ] **Step 2: Update App.jsx to use CSS variables and UI rounded classes**
  Redesign the card interfaces, metric score charts, and focus states.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add sanjaya/src/darshana/src/index.css
  git commit -m "style: link Subtle Gradient Design System tokens"
  ```

---

### Task 5: Memory Date Navigation & Full Detail Modal in UI

**Files:**
- Modify: `sanjaya/src/darshana/src/App.jsx`

- [ ] **Step 1: Implement Date Picker & Selected Date State**
  Add a desaturated `<input type="date">` styled with Subtle Gradient borders and focus rings.

- [ ] **Step 2: Render Top 3 highlight memories**
  Display `key_memories` inside a desaturated list.

- [ ] **Step 3: Implement "View Full Transcript" Modal Drawer**
  Clicking the button fetches `/api/raw-transcript?date=selectedDate` and overlays the full raw transcript.

- [ ] **Step 4: Run production build and verify passes**
  Run: `npm run build && npm test`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add sanjaya/src/darshana/src/App.jsx
  git commit -m "feat: add date selection and full transcript overlay"
  ```
