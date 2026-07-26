# MindVault GitHub Repo Intelligence & Auto-Pruning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deep GitHub repository analysis and 14-day inactivity auto-pruning system inside MindVault.

**Architecture:** Extend MindVault's Node.js SQLite backend (`backend/database.js`) with a new `github_details` table, a raw GitHub inspector (`backend/githubScraper.js`), Gemini 2.5 Flash deep enrichment (`backend/gemini.js`), and a background auto-pruning cron service (`backend/pruner.js`). Update the React frontend (`frontend/src/App.jsx`) with a dedicated GitHub Repos view, countdown badges, pin toggle, and interactive playbook modal.

**Tech Stack:** Node.js (ES Modules), SQLite (`DatabaseSync`), Express, `@google/generative-ai` (Gemini 2.5 Flash), React (Vite).

## Global Constraints

- Use ES Modules (`import/export`) for all Node.js backend files.
- Store database timestamps in ISO 8601 string format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Non-interacted GitHub repos auto-prune after 14 days ($14 \times 86400 \text{ seconds}$). Pinned repos (`is_pinned = 1`) are exempt from pruning.

---

### Task 1: Database Schema Extension & Helper Functions

**Files:**
- Modify: `backend/database.js`
- Test: `backend/test_db_github.js`

**Interfaces:**
- Produces: `Database.saveGitHubDetails(resourceId, details)`, `Database.getGitHubDetails(resourceId)`, `Database.updateLastInteracted(resourceId)`, `Database.togglePin(resourceId)`, `Database.pruneInactiveGitHubRepos(days)`

- [ ] **Step 1: Write the failing test for DB schema and helper methods**

Create `backend/test_db_github.js`:
```javascript
import { Database } from './database.js';

console.log('Testing GitHub Database Extension...');

// Test inserting dummy resource
const insertStmt = Database.addResource ? null : null; 
// Add test resource directly via SQL for testing schema
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'mindvault.db');
const db = new DatabaseSync(dbPath);

const res = db.prepare(`INSERT INTO resources (url, title, platform, last_interacted_at, is_pinned, status) VALUES (?, ?, ?, ?, ?, ?)`).run('https://github.com/test/repo', 'Test Repo', 'GitHub', new Date(Date.now() - 15 * 86400 * 1000).toISOString(), 0, 'active');

const resourceId = Number(res.lastInsertRowid);

// Test saveGitHubDetails
Database.saveGitHubDetails(resourceId, {
  repo_owner: 'test',
  repo_name: 'repo',
  stars: 120,
  forks: 15,
  primary_language: 'JavaScript',
  use_cases: JSON.stringify(['Use case 1', 'Use case 2']),
  quickstart_playbook: JSON.stringify({ prerequisites: 'Node.js', commands: ['npm start'], one_liner: 'docker run test' }),
  tech_stack_summary: 'Node.js app'
});

const details = Database.getGitHubDetails(resourceId);
if (!details || details.repo_owner !== 'test') {
  throw new Error('FAILED: saveGitHubDetails / getGitHubDetails');
}

// Test togglePin
Database.togglePin(resourceId, 1);
const pinnedRes = db.prepare('SELECT is_pinned FROM resources WHERE id = ?').get(resourceId);
if (pinnedRes.is_pinned !== 1) {
  throw new Error('FAILED: togglePin');
}
Database.togglePin(resourceId, 0);

// Test pruneInactiveGitHubRepos
const prunedCount = Database.pruneInactiveGitHubRepos(14);
if (prunedCount < 1) {
  throw new Error('FAILED: pruneInactiveGitHubRepos did not prune 15-day old repo');
}

console.log('✅ DB Schema & Helper tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/test_db_github.js`  
Expected: FAIL with `Database.saveGitHubDetails is not a function` or missing column error.

- [ ] **Step 3: Modify `backend/database.js` to add schema migrations and helper methods**

Update `backend/database.js`:
```javascript
// Add schema columns to resources if not exist
try { db.exec(`ALTER TABLE resources ADD COLUMN last_interacted_at TEXT DEFAULT CURRENT_TIMESTAMP;`); } catch (e) {}
try { db.exec(`ALTER TABLE resources ADD COLUMN is_pinned INTEGER DEFAULT 0;`); } catch (e) {}
try { db.exec(`ALTER TABLE resources ADD COLUMN status TEXT DEFAULT 'active';`); } catch (e) {}

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

// Add helper functions inside export const Database = { ... }
export const Database = {
  // Existing functions...

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node backend/test_db_github.js`  
Expected: PASS with `✅ DB Schema & Helper tests passed successfully!`

- [ ] **Step 5: Commit task changes**

```bash
git add backend/database.js backend/test_db_github.js
git commit -m "feat: add github_details schema and database helper methods"
```

---

### Task 2: GitHub URL Inspector & Scraper Module

**Files:**
- Create: `backend/githubScraper.js`
- Test: `backend/test_github_scraper.js`

**Interfaces:**
- Produces: `scrapeGitHubRepo(url)` -> returns `{ owner, repo, stars, forks, language, description, readme, manifests }`

- [ ] **Step 1: Write the failing test for `githubScraper.js`**

Create `backend/test_github_scraper.js`:
```javascript
import { parseGitHubUrl, scrapeGitHubRepo } from './githubScraper.js';

console.log('Testing GitHub Scraper Module...');

const parsed = parseGitHubUrl('https://github.com/expressjs/express');
if (!parsed || parsed.owner !== 'expressjs' || parsed.repo !== 'express') {
  throw new Error('FAILED: parseGitHubUrl');
}

scrapeGitHubRepo('https://github.com/expressjs/express').then(data => {
  if (!data || data.owner !== 'expressjs' || !data.readme) {
    throw new Error('FAILED: scrapeGitHubRepo did not return readme');
  }
  console.log('✅ GitHub Scraper tests passed successfully!');
}).catch(err => {
  console.error('FAILED scrapeGitHubRepo:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/test_github_scraper.js`  
Expected: FAIL with `Cannot find module './githubScraper.js'`

- [ ] **Step 3: Create `backend/githubScraper.js` implementation**

Create `backend/githubScraper.js`:
```javascript
import fetch from 'node-fetch';

/**
 * Parses GitHub URL to extract owner and repo name
 */
export function parseGitHubUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('github.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch (e) {
    return null;
  }
}

/**
 * Scrapes metadata, README, and manifest files for a GitHub repository
 */
export async function scrapeGitHubRepo(url) {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo } = parsed;
  let repoData = {};
  let readme = '';
  let manifest = '';

  // 1. Fetch Repository Info from GitHub REST API
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'MindVault-Bot' }
    });
    if (apiRes.ok) {
      repoData = await apiRes.json();
    }
  } catch (err) {
    console.warn(`GitHub API request failed for ${owner}/${repo}:`, err.message);
  }

  // 2. Fetch README.md from raw content
  const branches = [repoData.default_branch || 'main', 'master'];
  for (const branch of branches) {
    try {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
      if (readmeRes.ok) {
        readme = await readmeRes.text();
        break;
      }
    } catch (e) {}
  }

  // Truncate README to 4,000 characters for token efficiency
  if (readme.length > 4000) {
    readme = readme.slice(0, 4000) + '\n...(truncated for analysis)...';
  }

  // 3. Attempt to fetch package manifest (package.json or requirements.txt)
  for (const branch of branches) {
    try {
      const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`);
      if (pkgRes.ok) {
        manifest = await pkgRes.text();
        break;
      }
    } catch (e) {}
  }

  return {
    owner,
    repo,
    title: `${owner}/${repo}`,
    description: repoData.description || '',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    primary_language: repoData.language || 'JavaScript',
    readme: readme || repoData.description || 'No README content found.',
    manifest: manifest ? manifest.slice(0, 1000) : ''
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node backend/test_github_scraper.js`  
Expected: PASS with `✅ GitHub Scraper tests passed successfully!`

- [ ] **Step 5: Commit task changes**

```bash
git add backend/githubScraper.js backend/test_github_scraper.js
git commit -m "feat: add raw github repo parser and scraper module"
```

---

### Task 3: Gemini Deep GitHub Enrichment Prompting

**Files:**
- Modify: `backend/gemini.js`
- Test: `backend/test_gemini_github.js`

**Interfaces:**
- Produces: `enrichGitHubRepoMetadata(url, scrapedData, userNotes)` -> returns structured JSON with `use_cases`, `quickstart_playbook`, `tech_stack_summary`, `interest_score`, `usefulness_score`

- [ ] **Step 1: Write the failing test for `enrichGitHubRepoMetadata`**

Create `backend/test_gemini_github.js`:
```javascript
import { enrichGitHubRepoMetadata } from './gemini.js';

console.log('Testing Gemini GitHub Deep Enrichment...');

const scrapedData = {
  owner: 'expressjs',
  repo: 'express',
  title: 'expressjs/express',
  description: 'Fast, unopinionated, minimalist web framework for node.',
  stars: 62000,
  forks: 14000,
  primary_language: 'JavaScript',
  readme: 'Express is a minimal and flexible Node.js web application framework...',
  manifest: '{"dependencies": {"express": "^4.18.2"}}'
};

enrichGitHubRepoMetadata('https://github.com/expressjs/express', scrapedData, 'Want to check for MindVault server').then(result => {
  if (!result || !Array.isArray(result.use_cases) || !result.quickstart_playbook) {
    throw new Error('FAILED: enrichGitHubRepoMetadata invalid structure');
  }
  console.log('✅ Gemini GitHub Enrichment test passed successfully!');
}).catch(err => {
  console.error('FAILED Gemini test:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/test_gemini_github.js`  
Expected: FAIL with `enrichGitHubRepoMetadata is not a function`

- [ ] **Step 3: Modify `backend/gemini.js` to implement `enrichGitHubRepoMetadata`**

Add to `backend/gemini.js`:
```javascript
/**
 * Enriches metadata for a GitHub repository using Gemini 2.5 Flash
 * @param {string} url - GitHub URL
 * @param {object} scrapedData - Data from githubScraper
 * @param {string} userNotes - User context
 * @returns {Promise<object>} Enriched JSON
 */
export async function enrichGitHubRepoMetadata(url, scrapedData = {}, userNotes = '') {
  if (!apiKey) {
    return {
      title: scrapedData.title || 'GitHub Repository',
      summary: scrapedData.description || 'No summary available.',
      category: 'Tech & Coding',
      tags: ['github', scrapedData.primary_language ? scrapedData.primary_language.toLowerCase() : 'coding'],
      platform: 'GitHub',
      interest_score: 8,
      usefulness_score: 8,
      use_cases: [
        'Explore codebase for project inspiration',
        'Test local execution via setup commands',
        'Extract reusable utilities & patterns'
      ],
      quickstart_playbook: {
        prerequisites: 'Node.js / Git',
        commands: [`git clone ${url}`, 'cd ' + (scrapedData.repo || 'repo'), 'npm install'],
        one_liner: `git clone ${url}`
      },
      tech_stack_summary: `Primary language: ${scrapedData.primary_language || 'Software'}`
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const prompt = `You are a Senior Software Architect inspecting a GitHub repository for a developer's personal vault (MindVault).
Analyze the repository details and README snippet to produce structured use-cases and setup playbooks.

User's Existing Tech Stack Context: Node.js, Express, SQLite, React, Telegram Bot, AI Agents, Python.

Repository Data:
- URL: ${url}
- Name: ${scrapedData.owner}/${scrapedData.repo}
- Primary Language: ${scrapedData.primary_language}
- Stars: ${scrapedData.stars} | Forks: ${scrapedData.forks}
- Description: ${scrapedData.description}
- User Notes: ${userNotes || '(None)'}
- README Snippet:
${scrapedData.readme}

Return a JSON object matching this EXACT schema:
{
  "title": "${scrapedData.owner}/${scrapedData.repo}: Clean repository name & tagline",
  "summary": "1-2 sentence core value proposition of what this repository does",
  "category": "Tech & Coding",
  "tags": ["github", "language-name", "topic-1", "topic-2"],
  "platform": "GitHub",
  "interest_score": 8, // Integer 1-10
  "usefulness_score": 8, // Integer 1-10
  "use_cases": [
    "Use-Case 1: Specific integration idea for the user's projects (MindVault, Telegram bot, React, AI tools)",
    "Use-Case 2: Practical local developer workflow or testing application",
    "Use-Case 3: Architectural pattern, design decision, or code snippet worth saving"
  ],
  "quickstart_playbook": {
    "prerequisites": "Prerequisites list (e.g. Node 18+, Docker, Python 3.10)",
    "commands": [
      "git clone ${url}",
      "cd ${scrapedData.repo}",
      "npm install"
    ],
    "one_liner": "docker run command or one-liner if applicable, else git clone command"
  },
  "tech_stack_summary": "1-2 sentence overview of core dependencies and framework choice"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      title: parsed.title || `${scrapedData.owner}/${scrapedData.repo}`,
      summary: parsed.summary || scrapedData.description || '',
      category: 'Tech & Coding',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['github'],
      platform: 'GitHub',
      interest_score: Number.isInteger(parsed.interest_score) ? Math.max(1, Math.min(10, parsed.interest_score)) : 8,
      usefulness_score: Number.isInteger(parsed.usefulness_score) ? Math.max(1, Math.min(10, parsed.usefulness_score)) : 8,
      use_cases: Array.isArray(parsed.use_cases) ? parsed.use_cases : [
        'Explore codebase for project inspiration',
        'Test local execution via setup commands',
        'Extract reusable utilities & patterns'
      ],
      quickstart_playbook: parsed.quickstart_playbook || {
        prerequisites: 'Git',
        commands: [`git clone ${url}`],
        one_liner: `git clone ${url}`
      },
      tech_stack_summary: parsed.tech_stack_summary || `Primary language: ${scrapedData.primary_language}`
    };
  } catch (error) {
    console.error('Gemini GitHub enrichment failed:', error);
    return {
      title: `${scrapedData.owner}/${scrapedData.repo}`,
      summary: scrapedData.description || 'GitHub repository',
      category: 'Tech & Coding',
      tags: ['github'],
      platform: 'GitHub',
      interest_score: 7,
      usefulness_score: 7,
      use_cases: ['Inspect repo codebase', 'Test locally'],
      quickstart_playbook: { prerequisites: 'Git', commands: [`git clone ${url}`], one_liner: `git clone ${url}` },
      tech_stack_summary: `Primary language: ${scrapedData.primary_language}`
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node backend/test_gemini_github.js`  
Expected: PASS with `✅ Gemini GitHub Enrichment test passed successfully!`

- [ ] **Step 5: Commit task changes**

```bash
git add backend/gemini.js backend/test_gemini_github.js
git commit -m "feat: add Gemini 2.5 Flash deep GitHub enrichment prompt"
```

---

### Task 4: Auto-Pruning Background Cron & API Integration

**Files:**
- Create: `backend/pruner.js`
- Modify: `backend/server.js`
- Test: `backend/test_api_github.js`

**Interfaces:**
- Produces: `POST /api/resources/:id/interact`, `PATCH /api/resources/:id/pin`, and automated daily pruning interval.

- [ ] **Step 1: Create `backend/pruner.js` module**

Create `backend/pruner.js`:
```javascript
import { Database } from './database.js';

export function startAutoPruner(intervalMs = 24 * 60 * 60 * 1000) {
  console.log('⏰ [MindVault Pruner] Starting 14-day inactivity auto-pruner service...');
  
  const runPrune = () => {
    try {
      const prunedCount = Database.pruneInactiveGitHubRepos(14);
      if (prunedCount > 0) {
        console.log(`🧹 [MindVault Pruner] Successfully pruned ${prunedCount} inactive GitHub repos (>14 days uninteracted).`);
      }
    } catch (e) {
      console.error('Error running MindVault Pruner:', e.message);
    }
  };

  // Run once immediately on start
  runPrune();

  // Schedule daily run
  return setInterval(runPrune, intervalMs);
}
```

- [ ] **Step 2: Update API endpoints in `backend/server.js`**

Modify `backend/server.js`:
1. Import `parseGitHubUrl`, `scrapeGitHubRepo`, `enrichGitHubRepoMetadata`, and `startAutoPruner`.
2. In `POST /api/resources`, check if URL is GitHub. If so, call `scrapeGitHubRepo` and `enrichGitHubRepoMetadata`, then save base resource AND `Database.saveGitHubDetails(resourceId, enriched)`.
3. In `GET /api/resources`, join `github_details` if present and calculate `days_remaining = 14 - Math.floor((NOW - last_interacted_at) / 86400000)`.
4. Add endpoint `POST /api/resources/:id/interact` -> calls `Database.updateLastInteracted(req.params.id)`.
5. Add endpoint `PATCH /api/resources/:id/pin` -> calls `Database.togglePin(req.params.id, req.body.is_pinned)`.
6. Start `startAutoPruner()` on server boot.

- [ ] **Step 3: Write test for new API endpoints**

Create `backend/test_api_github.js`:
```javascript
import fetch from 'node-fetch';

console.log('Testing GitHub Endpoints on running server...');
const BASE = 'http://localhost:3001';

async function testEndpoints() {
  // Test POST interact
  const res = await fetch(`${BASE}/api/resources/1/interact`, { method: 'POST' });
  console.log('POST /interact status:', res.status);
}

testEndpoints().catch(console.error);
```

- [ ] **Step 4: Run server & test endpoints**

Run: `node backend/server.js` in background or test script  
Expected: Server runs, endpoints respond with HTTP 200 OK.

- [ ] **Step 5: Commit task changes**

```bash
git add backend/pruner.js backend/server.js backend/test_api_github.js
git commit -m "feat: integrate github api routes, interact/pin endpoints, and background pruner"
```

---

### Task 5: Frontend React Dashboard UI Updates

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.css` (or `index.css`)

**Interfaces:**
- Displays: GitHub Repos filter tab, 14-day countdown badge (`⏳ Prunes in X days`), `📌 Pin` toggle button, Use-Cases list, and interactive Playbook modal.

- [ ] **Step 1: Add GitHub tab, Countdown Badge, and Pin Button in `App.jsx`**

Update `frontend/src/App.jsx`:
1. Add platform filter option `'GitHub'`.
2. On repo card:
   - Display primary language badge & star count.
   - Display countdown badge: if `resource.is_pinned`, show `📌 Pinned`. Else show `⏳ Prunes in ${daysRemaining}d` (red badge if `daysRemaining <= 3`).
   - Add Pin toggle button calling `PATCH /api/resources/${id}/pin`.
   - Display `resource.github_details.use_cases` bullet points.
   - Add button `"⚡ View Playbook & Commands"` which opens Playbook Modal AND calls `POST /api/resources/${id}/interact`.

- [ ] **Step 2: Add Playbook Modal component**

Render Playbook Modal when selected:
- Title & Repo link.
- Copyable terminal code blocks for `quickstart_playbook.commands` and `quickstart_playbook.one_liner`.
- Tech stack summary & prerequisites.

- [ ] **Step 3: Add CSS styles for GitHub card elements in `App.css`**

Add CSS styles:
```css
.github-badge {
  background: var(--gradient-wash-1, #1e293b);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 0.8rem;
}

.prune-warning {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.pin-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.pin-btn.active {
  color: #f59e0b;
}

.playbook-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

- [ ] **Step 4: Verify Frontend Build**

Run: `npm run build` inside `frontend` directory  
Expected: PASS with 0 build errors.

- [ ] **Step 5: Commit task changes**

```bash
git add frontend/src/App.jsx frontend/src/App.css
git commit -m "feat: add GitHub Repos tab, countdown badge, pin toggle, and playbook modal in frontend UI"
```

---

## Plan Handoff & Execution Choice

Plan complete and saved to `docs/superpowers/plans/2026-07-26-github-repo-digest.md`.

Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like to take?
