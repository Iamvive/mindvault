# Zero-Cost AI Job Search & Application Engine (`job-hunter`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cost, local AI job hunting assistant that connects to your active Chrome browser via CDP, leverages your logged-in Claude session for ATS resume tailoring & screening answers, generates single-page ATS-optimized PDFs, and manages one-click job applications on Instahyre & LinkedIn Easy Apply via an approval dashboard.

**Architecture:** A modular Node.js engine with SQLite local storage, Playwright CDP bridge to Chrome, template-based HTML-to-PDF compiler, platform-specific discovery/submission adapters (Instahyre, LinkedIn), and a Vanilla HTML/CSS/JS Cockpit UI adhering to the Subtle Gradient Design System.

**Tech Stack:** Node.js (ESM), Playwright / Chrome DevTools Protocol, Better-SQLite3 / SQLite3, Express.js, Vitest for TDD, HTML5 Canvas / PDF preview, Inter typography.

## Global Constraints
- **0 Extra Cost:** All AI inference runs through the active Claude browser tab via CDP or local CLI — zero paid API tokens required.
- **Design System:** Typography is `Inter`, negative letter spacing on headings, `--sg-primary: #e60023`, rounded cards (16px/32px/9999px pills).
- **Safe Automation:** Humanized delays (2-6s), daily application limit (max 15/day default), deduplication against past applications.

---

### Task 1: Project Setup & SQLite Database Layer

**Files:**
- Create: `job-hunter/package.json`
- Create: `job-hunter/src/db/database.js`
- Test: `job-hunter/tests/db/database.test.js`

**Interfaces:**
- Produces: `initDatabase(dbPath)`, `saveJob(job)`, `getQueuedJobs()`, `updateJobStatus(id, status, meta)`, `isJobApplied(company, title, url)`

- [ ] **Step 1: Create `job-hunter/package.json` and install dependencies**
- [ ] **Step 2: Write failing test for SQLite database operations** (`job-hunter/tests/db/database.test.js`)
- [ ] **Step 3: Run test to verify it fails** (`npx vitest run tests/db/database.test.js`)
- [ ] **Step 4: Implement minimal SQLite schema and helper functions** (`job-hunter/src/db/database.js`)
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(db): implement SQLite job and application schema"`)

---

### Task 2: Master Profile & ATS Scoring Engine

**Files:**
- Create: `job-hunter/data/master_profile.json`
- Create: `job-hunter/src/core/profile.js`
- Create: `job-hunter/src/core/ats.js`
- Test: `job-hunter/tests/core/ats.test.js`

**Interfaces:**
- Consumes: `master_profile.json`
- Produces: `calculateAtsScore(jdText, profileData)`, `extractKeywords(text)`, `filterRelevantBullets(masterExperience, targetSkills)`

- [ ] **Step 1: Create default `master_profile.json` template**
- [ ] **Step 2: Write failing test for ATS keyword extractor and score calculator** (`job-hunter/tests/core/ats.test.js`)
- [ ] **Step 3: Run test to verify it fails**
- [ ] **Step 4: Implement ATS keyword extraction, cosine/n-gram scoring, and bullet matching** (`job-hunter/src/core/ats.js`)
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(ats): implement master profile schema and ATS matching algorithm"`)

---

### Task 3: ATS HTML/CSS Template & PDF Rendering Engine

**Files:**
- Create: `job-hunter/src/pdf/templates/ats-clean.html`
- Create: `job-hunter/src/pdf/templates/style.css`
- Create: `job-hunter/src/pdf/resume-renderer.js`
- Test: `job-hunter/tests/pdf/resume-renderer.test.js`

**Interfaces:**
- Consumes: `tailoredProfileData`
- Produces: `generateResumeHtml(tailoredData)`, `renderResumePdf(tailoredData, outputPath)`

- [ ] **Step 1: Create ATS-compliant HTML/CSS resume template with single-column layout**
- [ ] **Step 2: Write failing test for HTML resume generator and PDF export** (`job-hunter/tests/pdf/resume-renderer.test.js`)
- [ ] **Step 3: Run test to verify it fails**
- [ ] **Step 4: Implement template hydration and Playwright/Chrome PDF rendering** (`job-hunter/src/pdf/resume-renderer.js`)
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(pdf): implement ATS-friendly single-page HTML-to-PDF resume compiler"`)

---

### Task 4: Chrome CDP Bridge & Claude AI Worker

**Files:**
- Create: `job-hunter/src/cdp/chrome-bridge.js`
- Create: `job-hunter/src/cdp/claude-worker.js`
- Test: `job-hunter/tests/cdp/claude-worker.test.js`

**Interfaces:**
- Consumes: Active Chrome debugging port (`http://127.0.0.1:9222`)
- Produces: `connectToChrome()`, `promptClaudeSession(promptText)`, `tailorResumeForJob(jd, masterProfile)`

- [ ] **Step 1: Implement Chrome DevTools Protocol connection and tab finder** (`job-hunter/src/cdp/chrome-bridge.js`)
- [ ] **Step 2: Write unit/mock test for Claude worker prompt dispatching and JSON response extraction** (`job-hunter/tests/cdp/claude-worker.test.js`)
- [ ] **Step 3: Run test to verify it fails**
- [ ] **Step 4: Implement Claude tab interaction & response parser** (`job-hunter/src/cdp/claude-worker.js`)
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(cdp): implement zero-cost Claude Chrome CDP worker"`)

---

### Task 5: Job Discovery & Scraper Adapters (Instahyre & LinkedIn)

**Files:**
- Create: `job-hunter/src/scrapers/instahyre.js`
- Create: `job-hunter/src/scrapers/linkedin.js`
- Create: `job-hunter/src/scrapers/discovery-manager.js`
- Test: `job-hunter/tests/scrapers/discovery.test.js`

**Interfaces:**
- Produces: `discoverInstahyreJobs(page, options)`, `discoverLinkedInJobs(page, options)`, `runDiscoveryPipeline()`

- [ ] **Step 1: Implement Instahyre job card parser and opportunity fetcher** (`job-hunter/src/scrapers/instahyre.js`)
- [ ] **Step 2: Implement LinkedIn Easy Apply job search scraper** (`job-hunter/src/scrapers/linkedin.js`)
- [ ] **Step 3: Write test for discovery deduplication and queue ingestion** (`job-hunter/tests/scrapers/discovery.test.js`)
- [ ] **Step 4: Implement `discovery-manager.js` to coordinate discovery $\rightarrow$ Claude tailoring $\rightarrow$ PDF creation**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(scrapers): implement Instahyre and LinkedIn job discovery adapters"`)

---

### Task 6: Platform Submitter Adapters (Instahyre & LinkedIn Easy Apply)

**Files:**
- Create: `job-hunter/src/submitters/instahyre-submitter.js`
- Create: `job-hunter/src/submitters/linkedin-submitter.js`
- Create: `job-hunter/src/submitters/submitter-manager.js`
- Test: `job-hunter/tests/submitters/submitter.test.js`

**Interfaces:**
- Consumes: Queued application record with generated PDF path & screening answers
- Produces: `applyInstahyre(jobRecord)`, `applyLinkedInEasy(jobRecord)`, `submitApplication(jobId)`

- [ ] **Step 1: Implement Instahyre form filler and PDF attachment handler** (`job-hunter/src/submitters/instahyre-submitter.js`)
- [ ] **Step 2: Implement LinkedIn Easy Apply multi-step modal stepper** (`job-hunter/src/submitters/linkedin-submitter.js`)
- [ ] **Step 3: Write test for submitter workflow and status recording** (`job-hunter/tests/submitters/submitter.test.js`)
- [ ] **Step 4: Implement safety delays, daily count enforcement, and retry/manual-flag fallback**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit** (`git commit -m "feat(submitters): implement Instahyre and LinkedIn automated application submitters"`)

---

### Task 7: Web Cockpit UI & Daily Approval Dashboard

**Files:**
- Create: `job-hunter/src/server/server.js`
- Create: `job-hunter/public/index.html`
- Create: `job-hunter/public/style.css`
- Create: `job-hunter/public/app.js`

**Interfaces:**
- Exposes:
  - `GET /api/jobs?status=queued` — Fetch queued applications
  - `POST /api/jobs/:id/approve` — Approve and submit application
  - `POST /api/jobs/:id/dismiss` — Dismiss job
  - `POST /api/discovery/trigger` — Trigger immediate scan
  - `GET /api/profile` & `PUT /api/profile` — Master profile editor
  - `GET /api/resumes/:filename` — Stream generated PDF

- [ ] **Step 1: Implement Express REST API endpoints in `job-hunter/src/server/server.js`**
- [ ] **Step 2: Build modern, premium Cockpit UI (`index.html`, `style.css`, `app.js`) matching Subtle Gradient Design System**
  - Queued jobs feed with ATS match badges
  - Side-by-side JD vs. Tailored PDF preview
  - Editable Q&A modal
  - Profile Audit & Master Profile JSON editor tab
  - "🚀 Approve & Apply" and "Batch Apply" buttons
- [ ] **Step 3: Test API endpoints and UI interactions**
- [ ] **Step 4: Commit** (`git commit -m "feat(ui): implement MindHunt Cockpit approval dashboard and profile editor"`)

---

### Task 8: End-to-End Integration & CLI Launcher

**Files:**
- Create: `job-hunter/bin/job-hunter.js`
- Create: `job-hunter/README.md`
- Test: `job-hunter/tests/e2e/workflow.test.js`

- [ ] **Step 1: Create unified CLI launcher (`bin/job-hunter.js`) with `start`, `scan`, `audit` commands**
- [ ] **Step 2: Write end-to-end integration test verifying the full pipeline** (`tests/e2e/workflow.test.js`)
- [ ] **Step 3: Add comprehensive `README.md` with Chrome CDP launch instructions (`--remote-debugging-port=9222`)**
- [ ] **Step 4: Commit** (`git commit -m "feat(cli): add unified CLI launcher and documentation"`)
