# Project Crucible: Design Specification

An automated, screenless-wearable companion system for cognitive coaching, behavioral analysis, and 1% daily self-improvement using the NeoSapien Neo 1.

---

## 1. Goal & Context
The user wears a NeoSapien Neo 1 locket that records and transcribes daily conversations. The goal of Project Crucible is to build an automated, self-contained system that:
*   Schedules a daily pull of transcripts from the NeoSapien MCP at 8:00 PM.
*   Analyzes the conversation data using LLMs calibrated against established psychological/behavioral studies.
*   Presents a beautiful, minimalist, and responsive dashboard.
*   Proposes daily 1% improvement targets based on the user's weekly behavioral trend.

---

## 2. Architecture & Directory Structure
To keep the project clean, modular, and completely separate from other apps in the workspace, we will structure it inside a new directory: `crucible-coach/`.

```
crucible-coach/
├── package.json
├── data/
│   ├── vault/               # IMMUTABLE RAW JSON BACKUPS (Zero data loss safety net)
│   │   └── YYYY-MM-DD-raw.json
│   ├── migrations/          # SQLite schema version control
│   │   └── 001_initial_schema.sql
│   └── crucible.db          # Active SQLite database
├── src/
│   ├── scheduler.js         # Cron job runner (8:00 PM Daily)
│   ├── mcp-client.js        # Connects to NeoSapien MCP to fetch transcripts
│   ├── analyzer.js          # Gemini API prompt processing & scientific scoring
│   ├── database.js          # Database connector & migration runner
│   ├── server.js            # Express backend API for dashboard data
│   └── dashboard/           # Frontend (Vite/React with Subtle Gradient design)
│       ├── index.html
│       └── src/
│           ├── App.jsx
│           └── index.css
```

---

## 3. Data Protection & Scalability Strategy
To address the critical requirement of **zero data loss**:
*   **Immutable Raw Vault:** The first step of the 8 PM scheduler is to write the fetched raw JSON from NeoSapien directly to `crucible-coach/data/vault/YYYY-MM-DD-raw.json`. No processing, cleaning, or database interaction occurs before this file is safely written. If the database is corrupted or schemas change, we can rebuild the database from scratch by re-processing these raw files.
*   **Database Migrations:** Schema changes will be run via a simple migration runner that checks a `schema_version` table.
*   **Modular Pipeline:** The ingestion scheduler, analysis script, database writer, and API server are completely decoupled.

---

## 4. Scientific Behavioral Analysis Engine
The `analyzer.js` component will process transcripts using specialized prompts based on established studies:
1.  **Cognitive Distortion Index (CBT / Aaron Beck):** Identifies occurrences of cognitive biases (e.g., all-or-nothing thinking, catastrophizing, jumping to conclusions).
2.  **Conversational Connection (John Gottman):** Analyzes conversational bidding, responsiveness, validation, and interruption rates.
3.  **Active Listening Scale (Carl Rogers):** Scores queries vs. directives, empathetic reflections, and statement clarity.
4.  **Speech Clarity & Economy:** Measures filler word count and cognitive clutter.

---

## 5. Subtle Gradient Dashboard UI
Adhering to the project's **Subtle Gradient Design System Constraints**:
*   **Surfaces:** Translucent card mockups with desaturated background washes.
*   **Typography:** Inter font family with negative letter-spacing (`-1px` to `-1.2px`) on display headings.
*   **Colors:** Clean, minimal desaturated interface with `--sg-primary` (`#e60023`) as the sole saturated highlight accent.
*   **Interaction:** Smooth hover transitions on cards, interactive metric detail modals, and a line chart plotting the user's 1% daily improvement trajectory.
*   **Science Modals:** Clicking a score (e.g., "Cognitive Distortions: 8.5/10") opens a drawer referencing Aaron Beck's research, highlighting the exact sentences spoken that day that triggered the score, and suggesting how to rephrase them.

---

## 6. Daily 1% Improvement Engine
At 8 PM, after generating the scorecard, the system calculates the **"Kaizen Focus for Tomorrow"**:
1.  It compares today's scores against the user's 7-day moving average.
2.  It identifies the metric that showed the sharpest drop or remains the lowest.
3.  It pulls the corresponding re-framing framework and generates exactly one micro-target:
    *   *Example:* `"Focus on: Active Listening. Micro-Target: In your meetings tomorrow, repeat the key blocker Alice raises before offering your suggestion."`

---

## 7. Verification Plan
*   **Unit Tests:** Verify that the transcript analyzer parses transcripts into correct categories without data corruption.
*   **Mock Ingestion Test:** Write a script to ingest a mock transcript, write to the Raw Vault, run the analyzer, save to SQLite, and serve it via the API.
*   **Schema Modification Test:** Run a test migration, modify a schema, verify the migration runner completes, and re-import historical files from the Raw Vault.
