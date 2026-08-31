# 🎯 MindHunt — Zero-Cost AI Job Search & Application Engine

> **Zero API Billing.** Connects directly to your active Google Chrome browser session via Chrome DevTools Protocol (CDP), using your logged-in Claude session for ATS resume tailoring, keyword optimization, and screening answers with **0 extra cost**.

---

## 🌟 Key Features

1. **Zero-Cost AI Worker:** Leverages your active Claude web session (or local runner) via CDP — no expensive OpenAI/Anthropic API bills.
2. **Persistent Master Presence vs. Per-Job Tailoring:**
   - **LinkedIn & GitHub:** Global profile optimization templates (recruiter SEO, boolean tags, README project showcase).
   - **Master Profile JSON:** Single source of truth for all your achievements, metrics, and skills.
   - **ATS PDF Generator:** Compiles single-page, ATS-compliant HTML/CSS resumes to PDF per JD.
3. **Semi-Automated Approval Queue Cockpit:**
   - Live web dashboard displaying discovered jobs, ATS match percentage (0-100%), and tailored summary.
   - Side-by-side PDF preview modal.
   - 1-click **"Approve & Apply"** and **"Batch Apply"** buttons.
4. **Platform Connectors:** Instahyre & LinkedIn Easy Apply with humanized delays and anti-detection protection.

---

## 🚀 Quick Start

### 1. Launch Chrome with Remote Debugging (One-time or daily)
Open your terminal and launch Google Chrome with your profile:

```bash
# macOS:
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-job-hunter-profile"
```
*(Log in to Claude, Instahyre, and LinkedIn once in this browser window).*

### 2. Launch MindHunt Cockpit
In another terminal:

```bash
cd job-hunter
npm start
```

Open your browser at **`http://localhost:4200`** to access the Cockpit.

---

## 🛠️ Project Structure

```
job-hunter/
├── bin/
│   └── job-hunter.js           # CLI Launcher
├── data/
│   ├── master_profile.json     # Master candidate data (Skills, metrics, roles)
│   └── jobs.db                 # SQLite database tracking queued & applied jobs
├── public/                     # Cockpit Web UI (Subtle Gradient Design)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── cdp/
│   │   ├── chrome-bridge.js    # Chrome DevTools Protocol connection
│   │   └── claude-worker.js    # Zero-cost Claude web session prompter
│   ├── core/
│   │   ├── profile.js          # Master profile loader & validator
│   │   └── ats.js              # Keyword extraction & ATS scoring engine
│   ├── db/
│   │   └── database.js         # Native node:sqlite storage
│   ├── pdf/
│   │   ├── resume-renderer.js  # HTML/CSS to PDF compiler
│   │   └── templates/          # ATS-friendly responsive print template
│   ├── scrapers/
│   │   ├── instahyre.js        # Instahyre job card extractor
│   │   ├── linkedin.js         # LinkedIn Easy Apply scraper
│   │   └── discovery-manager.js# Discovery & tailoring pipeline
│   ├── submitters/
│   │   ├── instahyre-submitter.js
│   │   ├── linkedin-submitter.js
│   │   └── submitter-manager.js
│   └── server/
│       └── server.js           # Express REST API
└── tests/                      # Full test suite (16 tests)
```

---

## 🧪 Running Tests

```bash
cd job-hunter
npm test
```
