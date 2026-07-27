# Sanjaya Second Brain System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Project Sanjaya into a comprehensive Second Brain and Personal Growth system featuring FTS5 sub-millisecond memory search, pending action items & follow-ups tracking, weakness & growth radar, top daily conversations, and research-backed daily Sadhana tips.

**Architecture:** Extend SQLite database with FTS5 virtual full-text indexing, action items, entities, and daily digests tables via Migration 003. Update Manana Gemini 2.5 Flash analyzer to extract structured Second Brain payloads. Add REST API endpoints and build interactive React UI components adhering to Subtle Gradient constraints.

**Tech Stack:** Node.js, Express, SQLite3 (FTS5), @google/genai, React 18, Vite, Three.js.

## Global Constraints

- **Design System**: Strict adherence to Subtle Gradient CSS (Inter font, `--sg-primary` #e60023 highlight, `--gradient-wash-*` desaturated cards, full pill buttons/chips, double-ring focus state `var(--focus-ring)`).
- **Code Style**: Vanilla CommonJS modules for backend, React JSX for frontend, standard Node `--test` test runner.
- **Zero Data Loss**: Raw JSON transcript backups written to `smriti/vault/YYYY-MM-DD-raw.json` prior to any processing.

---

### Task 1: Database Migration 003 & Data Access Methods

**Files:**
- Create: `sanjaya/smriti/migrations/003_second_brain_system.sql`
- Modify: `sanjaya/src/database.js`
- Test: `sanjaya/tests/database.test.js`

**Interfaces:**
- Consumes: Existing SQLite connection `getDbConnection()`
- Produces: `runMigrations()`, `saveActionItems()`, `getActionItems()`, `toggleActionItem()`, `saveEntities()`, `getEntities()`, `saveDailyDigest()`, `getDailyDigest()`, `searchTranscriptsFTS()`

- [ ] **Step 1: Write Migration 003 SQL Script**

Create file `sanjaya/smriti/migrations/003_second_brain_system.sql`:

```sql
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
```

- [ ] **Step 2: Write database test for Migration 003 & FTS5 search**

Add test to `sanjaya/tests/database.test.js`:

```javascript
const test = require('node.test');
const assert = require('assert');
const { runMigrations, getDbConnection, saveDailyDigest, getDailyDigest, searchTranscriptsFTS } = require('../src/database');

test('Migration 003 applies FTS5 and Second Brain tables', (t, done) => {
  runMigrations((err) => {
    assert.strictEqual(err, null);
    const db = getDbConnection();
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err2, tables) => {
      assert.strictEqual(err2, null);
      const names = tables.map(t => t.name);
      assert.ok(names.includes('action_items'));
      assert.ok(names.includes('entities'));
      assert.ok(names.includes('daily_digests'));
      db.close();
      done();
    });
  });
});
```

- [ ] **Step 3: Update `sanjaya/src/database.js` to run Migration 003 & helper queries**

Update `sanjaya/src/database.js` to include Migration 003 application and functions: `saveActionItems`, `getActionItems`, `toggleActionItem`, `saveEntities`, `getEntities`, `saveDailyDigest`, `getDailyDigest`, `searchTranscriptsFTS`.

- [ ] **Step 4: Run database tests to verify passing**

Run: `NODE_ENV=test node --test tests/database.test.js`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add sanjaya/smriti/migrations/003_second_brain_system.sql sanjaya/src/database.js sanjaya/tests/database.test.js
git commit -m "feat(database): add migration 003 FTS5 and second brain tables"
```

---

### Task 2: Manana Engine Second Brain Extraction

**Files:**
- Modify: `sanjaya/src/manana.js`
- Test: `sanjaya/tests/manana.test.js`

**Interfaces:**
- Consumes: Raw Wearable Transcript JSON
- Produces: `analyzeTranscript(rawJson, callback)` returning `{ cognitive_distortion, conversational_connection, active_listening, speech_clarity, summary, kaizen_target, key_memories, action_items, entities, daily_digest }`

- [ ] **Step 1: Write failing test for Second Brain extraction payload**

Update `sanjaya/tests/manana.test.js`:

```javascript
test('Manana Engine extracts action items, entities, and research tip', (t, done) => {
  const mockTranscript = { timestamp: "2026-07-27", memories: [] };
  analyzeTranscript(mockTranscript, (err, res) => {
    assert.strictEqual(err, null);
    assert.ok(Array.isArray(res.action_items));
    assert.ok(Array.isArray(res.entities));
    assert.ok(res.daily_digest);
    assert.ok(res.daily_digest.research_tip);
    done();
  });
});
```

- [ ] **Step 2: Update `sanjaya/src/manana.js` prompt & mock response**

Enhance `sanjaya/src/manana.js` Gemini prompt to request `action_items`, `entities`, `daily_digest` (containing `top_conversations`, `key_takeaways`, `weaknesses_identified`, `growth_areas`, `research_tip`) and include these in test mock fallback.

- [ ] **Step 3: Run test to verify passing**

Run: `NODE_ENV=test node --test tests/manana.test.js`
Expected: PASS

- [ ] **Step 4: Commit Task 2**

```bash
git add sanjaya/src/manana.js sanjaya/tests/manana.test.js
git commit -m "feat(manana): enhance Gemini prompt for action items, entities, and research tips"
```

---

### Task 3: Express API Server Second Brain Endpoints

**Files:**
- Modify: `sanjaya/src/server.js`
- Test: `sanjaya/tests/second-brain-api.test.js`

**Interfaces:**
- Consumes: Second Brain DB queries from `database.js`
- Produces: Endpoints `GET /api/action-items`, `POST /api/action-items/:id/toggle`, `GET /api/entities`, `GET /api/search`, `GET /api/digest`

- [ ] **Step 1: Write failing test for Second Brain REST API endpoints**

Create file `sanjaya/tests/second-brain-api.test.js`:

```javascript
const test = require('node.test');
const assert = require('assert');
const supertest = require('supertest');
const app = require('../src/server');

test('GET /api/action-items returns list', async () => {
  const res = await supertest(app).get('/api/action-items');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('GET /api/search handles keyword query', async () => {
  const res = await supertest(app).get('/api/search?q=test');
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
});
```

- [ ] **Step 2: Implement REST routes in `sanjaya/src/server.js`**

Add endpoint handlers to `server.js` for:
- `GET /api/action-items`
- `POST /api/action-items/:id/toggle`
- `GET /api/entities`
- `GET /api/search`
- `GET /api/digest`

- [ ] **Step 3: Run API tests to verify passing**

Run: `NODE_ENV=test node --test tests/second-brain-api.test.js`
Expected: PASS

- [ ] **Step 4: Commit Task 3**

```bash
git add sanjaya/src/server.js sanjaya/tests/second-brain-api.test.js
git commit -m "feat(server): add REST API endpoints for action items, entities, search, and digests"
```

---

### Task 4: Darshana UI React Components (Subtle Gradient Design)

**Files:**
- Create: `sanjaya/src/darshana/src/ActionItemsCard.jsx`
- Create: `sanjaya/src/darshana/src/WeaknessTracker.jsx`
- Create: `sanjaya/src/darshana/src/SearchDrawer.jsx`
- Modify: `sanjaya/src/darshana/src/App.jsx`
- Modify: `sanjaya/src/darshana/src/index.css`

**Interfaces:**
- Consumes: REST APIs `/api/action-items`, `/api/digest`, `/api/entities`, `/api/search`
- Produces: Interactive React Second Brain dashboard views.

- [ ] **Step 1: Create `ActionItemsCard.jsx`**

Implement filterable tabs (`All`, `TODOs`, `Promises`, `Follow-ups`) with interactive checkbox toggling (`/api/action-items/:id/toggle`).

- [ ] **Step 2: Create `WeaknessTracker.jsx`**

Display detected speech/cognitive weaknesses, 7-day trend score badges, actionable growth areas, and research-backed daily Sadhana tip.

- [ ] **Step 3: Create `SearchDrawer.jsx`**

Global search modal providing real-time FTS5 keyword search across stored transcripts.

- [ ] **Step 4: Update `App.jsx` & `index.css`**

Integrate `ActionItemsCard`, `WeaknessTracker`, and `SearchDrawer` into the main Darshana layout. Apply Subtle Gradient design system tokens (`--sg-primary` #e60023 highlight, desaturated washes, rounded pills, negative letter-spacing).

- [ ] **Step 5: Run Vite Build to verify production build**

Run: `npm run build` (in `sanjaya/`)
Expected: PASS with 0 build errors.

- [ ] **Step 6: Commit Task 4**

```bash
git add sanjaya/src/darshana/src/
git commit -m "feat(darshana): implement ActionItemsCard, WeaknessTracker, SearchDrawer, and main UI integration"
```

---

### Task 5: End-to-End Verification & Full Test Suite Pass

**Files:**
- Modify/Verify: All project files and tests.

- [ ] **Step 1: Run complete test suite**

Run: `npm test` (in `sanjaya/`)
Expected: All tests pass cleanly (100% pass rate).

- [ ] **Step 2: Verify production build output**

Run: `npm run build` (in `sanjaya/`)
Expected: Built cleanly in `dist/`.

- [ ] **Step 3: Commit Task 5**

```bash
git add .
git commit -m "chore: complete Sanjaya Second Brain system implementation and verification"
```
