# ⚡ CareerCraft — Unified AI Career Profile & ATS Resume Studio

> **Autonomous, zero-API-cost career engineering platform that unifies your GitHub, LinkedIn, and ATS Resume into a persistent, high-converting career presence.**

---

## 🌟 Why CareerCraft?

Most job seekers struggle with disjointed career narratives across GitHub, LinkedIn, and their ATS Resumes. **CareerCraft** solves this by creating a single persistent source of truth with 3-pillar AI readiness scoring, live ATS single-column PDF compilation, instant cover letter synthesis, and autonomous multi-platform job application tracking.

### Key Highlights:
- 🏆 **3-Pillar Unified Readiness Scorecard:** Evaluates your GitHub code depth, LinkedIn profile completeness, and ATS resume keyword strength on a single unified scale.
- 📄 **Master ATS Resume Studio:** Live single-column ATS resume editor with sub-second headless Chromium PDF compilation.
- ✉️ **Cover Letter Studio & AI Improver:** Upload, parse, and tailor human-sounding, metric-dense cover letters without AI clichés.
- ⚡ **Zero API Cost Architecture:** Harnesses your active Chrome browser via Chrome DevTools Protocol (CDP port 9222) to run Claude / LLM workflows directly without external API keys or token billing.
- 🛡️ **100% Offline-Safe & Persistent:** All profiles, resumes, and tracked applications are stored locally on your hard drive with native SQLite ACID persistence.

---

## 🛠️ Tech Stack & Architecture

- **Backend:** Node.js (ESM), Express, SQLite (`node:sqlite`)
- **PDF Engine:** Playwright-Core / Headless Chromium (A4 print layout, sub-second compile)
- **AI Automation:** Chrome DevTools Protocol (CDP) WebSocket Bridge
- **PDF Extraction:** `unpdf` (ESM-native Uint8Array binary extraction)
- **Frontend:** Vanilla JS, Subtle Gradient Design System, Responsive Split-Screen Studio

---

## 🚀 Quick Start

### 1. Launch Chrome with CDP Enabled
```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &
```

### 2. Start CareerCraft
```bash
git clone git@github.com:Iamvive/mindvault.git
cd mindvault/job-hunter
npm install
npm start
```

### 3. Open the Studio
Navigate to **[http://localhost:4200](http://localhost:4200)** in your browser.

---

## 🎯 Candidate Focus: Senior Android & Mobile Engineering
Engineered with production configurations for high-impact tech talent:
- Kotlin Multiplatform (KMP), Jetpack Compose, Coroutines & Flow
- Clean Architecture, Modular SDK integrations, Performance Benchmarking (ANR reduction, cold launch optimization)
- Real metric tracking (e.g. 99.8% latency slashing, 92% ANR drop)

---

## 📄 License
MIT © Vivek Kumar
