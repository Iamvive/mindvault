# MindVault GitHub Repo Intelligence & Auto-Pruning System Design

**Date:** 2026-07-26  
**Status:** Approved  
**Target System:** MindVault (Personal Resource Dashboard)

---

## 1. Executive Summary & Problem Statement

When discovering useful GitHub repositories, developers frequently bookmark or save links but lack the time and immediate context to evaluate their real-world applicability or test them locally. Over time, resource vaults become cluttered graveyards of unexamined links.

This feature enhances **MindVault** with an automated **GitHub Intelligence & Auto-Pruning Engine** that:
1. Performs deep repository inspection on ingested GitHub links (README, manifests, language, stars).
2. Uses **Gemini 2.5 Flash** to generate **3 tailored use-cases** for the user's projects and a **2-minute copyable setup playbook**.
3. Enforces a **14-day inactivity auto-pruning rule**: Repositories that are not interacted with (viewed, copied, noted, or pinned) within 14 days are automatically pruned to keep MindVault clean.
4. Allows users to **Pin** repos to exempt them from auto-deletion.

---

## 2. System Architecture & Database Schema

### 2.1 Database Schema (`backend/database.js`)

We extend `resources` and introduce a `github_details` table:

```sql
-- Extend existing resources table
ALTER TABLE resources ADD COLUMN last_interacted_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE resources ADD COLUMN is_pinned INTEGER DEFAULT 0;
ALTER TABLE resources ADD COLUMN status TEXT DEFAULT 'active'; -- 'active', 'pinned', 'archived', 'pruned'

-- New github_details table for deep enrichment data
CREATE TABLE IF NOT EXISTS github_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id INTEGER UNIQUE NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  primary_language TEXT,
  use_cases TEXT, -- JSON array of 3 personalized use-cases
  quickstart_playbook TEXT, -- JSON object: { prerequisites, commands: [], one_liner }
  tech_stack_summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);
```

### 2.2 Inactivity Auto-Pruning Engine (`backend/pruner.js`)

* **Execution**: Runs on server boot and once daily via a background interval.
* **Pruning Logic**:
  $$\text{Prune} \iff \text{platform} = \text{'GitHub'} \land \text{is\_pinned} = 0 \land \text{status} = \text{'active'} \land \text{last\_interacted\_at} < (\text{NOW} - 14\text{ days})$$
* **Action**: Updates `status = 'pruned'` (or deletes record based on config) and logs the pruning event.

---

## 3. GitHub Scraper & Gemini Enrichment Engine

### 3.1 GitHub Data Inspector (`backend/githubScraper.js`)

When a URL matching `https://github.com/:owner/:repo` is submitted:
1. Fetches metadata via GitHub REST API / raw endpoints:
   - Stars, forks, language, default branch, description.
   - `README.md` raw text (truncated to top ~4,000 characters).
   - Manifest snippets (`package.json`, `requirements.txt`, `Cargo.toml`, `docker-compose.yml`).

### 3.2 Gemini 2.5 Flash Deep Enrichment (`backend/gemini.js`)

Passes raw GitHub metadata alongside user project context (`ai-play-ground`, `mindvault`, `sanjaya`, Telegram bot, React, Node.js). Returns structured JSON:

```json
{
  "title": "Clean repository title & tagline",
  "summary": "1-2 sentence core value proposition",
  "use_cases": [
    "Use-Case 1: How to integrate with MindVault / Telegram bot",
    "Use-Case 2: How to use for local development / testing",
    "Use-Case 3: Useful patterns / algorithms to extract"
  ],
  "quickstart_playbook": {
    "prerequisites": "Node.js 18+, Docker",
    "commands": [
      "git clone https://github.com/owner/repo",
      "npm install",
      "npm test"
    ],
    "one_liner": "docker run -p 8080:8080 owner/repo"
  },
  "tech_stack_summary": "Built with TypeScript and Express, uses Redis for caching.",
  "interest_score": 8,
  "usefulness_score": 9
}
```

---

## 4. API Endpoints & Backend Routes

* `POST /api/resources` — Ingests resource link. If GitHub URL, triggers `githubScraper` & deep Gemini enrichment, populates `github_details`.
* `POST /api/resources/:id/interact` — Resets `last_interacted_at = CURRENT_TIMESTAMP` when user views playbook or copies commands.
* `PATCH /api/resources/:id/pin` — Toggles `is_pinned` (0/1) to freeze/unfreeze 14-day auto-deletion timer.
* `GET /api/github-repos` — Returns GitHub repos with remaining days until pruning ($14 - \text{days\_since\_interaction}$).

---

## 5. Frontend Dashboard UX (`frontend/src/App.jsx`)

1. **GitHub Repos Filter**: Dedicated filter tab in MindVault UI.
2. **Repo Card Badges**:
   - Primary Language & Star count.
   - `⏳ Prunes in X days` countdown badge (styled orange/red when < 3 days remain).
   - `📌 Pin` toggle button.
3. **Personalized Use-Cases**: Displays 3 bullet points showing direct application to user projects.
4. **Interactive Playbook Modal**:
   - Displays copyable terminal installation steps and 1-liner commands.
   - Shows tech stack breakdown.
   - Automatically calls `/interact` endpoint on click to refresh the 14-day timer.

---

## 6. Verification & Testing Plan

1. **Automated Unit & API Tests**:
   - Verify GitHub URL parsing and metadata scraping.
   - Verify Gemini JSON structure parsing for GitHub playbooks.
   - Test pruning logic with simulated timestamps older than 14 days.
   - Verify `is_pinned = 1` prevents pruning.
2. **Manual Verification**:
   - Ingest a real GitHub repository via MindVault Web UI & Telegram bot.
   - Check generated use-cases, quickstart commands, and countdown badge in UI.
   - Test pinning and resetting interaction timers.
