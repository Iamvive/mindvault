# Project Sanjaya: Design Specification

An automated, screenless-wearable companion system for cognitive coaching, behavioral analysis, and 1% daily self-improvement using the NeoSapien Neo 1. 

Named after **Sanjaya**, who was gifted with divine hearing and vision to relate events with objective clarity. The components are named after the classical Vedic stages of learning, memory, and practice.

---

## 1. Goal & Context
The user wears a NeoSapien Neo 1 locket that records and transcribes daily conversations. The goal of Project Sanjaya is to build an automated, self-contained system that:
*   Schedules a daily pull of transcripts from the NeoSapien MCP at 8:00 PM.
*   Analyzes the conversation data using LLMs calibrated against established psychological/behavioral studies.
*   Presents a beautiful, minimalist, and responsive dashboard.
*   Proposes daily 1% improvement targets based on the user's weekly behavioral trend.

---

## 2. Component & Directory Structure
To keep the project clean, modular, and completely separate from other apps in the workspace, we will structure it inside a new directory: `sanjaya/`.

```
sanjaya/
├── package.json
├── smriti/                  # SMRITI VAULT: Storage & Memory Layer
│   ├── vault/               # Immutable raw JSON backups (Zero data loss)
│   │   └── YYYY-MM-DD-raw.json
│   ├── migrations/          # SQLite schema version control
│   │   └── 001_initial_schema.sql
│   └── sanjaya.db           # Structured SQLite database
├── src/
│   ├── shravana.js          # SHRAVANA DAEMON: Cron job fetching transcripts (8 PM Daily)
│   ├── manana.js            # MANANA ENGINE: Gemini prompt processor & scientific analyzer
│   ├── database.js          # SQLite connector & migration runner
│   ├── server.js            # Express API serving Darshana Dashboard
│   └── darshana/            # DARSHANA DASHBOARD: Subtle Gradient Frontend client
│       ├── index.html
│       └── src/
│           ├── App.jsx
│           └── index.css
```

---

## 3. Data Protection & Scalability (Smriti Vault)
To address the critical requirement of **zero data loss**:
*   **Immutable Backups:** The first step of the **Shravana Daemon** is to write the fetched raw JSON from NeoSapien directly to `sanjaya/smriti/vault/YYYY-MM-DD-raw.json`. No processing, cleaning, or database interaction occurs before this file is safely written. If the database is corrupted or schemas change, we can rebuild the database from scratch by re-running the **Manana Engine** on these raw files.
*   **Database Migrations:** Schema changes will be run via a simple migration runner that checks a `schema_version` table.

---

## 4. Scientific Behavioral Analysis (Manana Engine)
The `manana.js` component will process transcripts using specialized prompts based on established studies:
1.  **Cognitive Distortion Index (CBT / Aaron Beck):** Identifies occurrences of cognitive biases (e.g., all-or-nothing thinking, catastrophizing, jumping to conclusions).
2.  **Conversational Connection (John Gottman):** Analyzes conversational bidding, responsiveness, validation, and interruption rates.
3.  **Active Listening Scale (Carl Rogers):** Scores queries vs. directives, empathetic reflections, and statement clarity.
4.  **Speech Clarity & Economy:** Measures filler word count and cognitive clutter.

---

## 5. Subtle Gradient Dashboard UI (Darshana Dashboard)
Adhering to the project's **Subtle Gradient Design System Constraints**:
*   **Surfaces:** Translucent card mockups with desaturated background washes.
*   **Typography:** Inter font family with negative letter-spacing (`-1px` to `-1.2px`) on display headings.
*   **Colors:** Clean, minimal desaturated interface with `--sg-primary` (`#e60023`) as the sole saturated highlight accent.
*   **Interaction:** Smooth hover transitions on cards, interactive metric detail modals, and a line chart plotting the user's 1% daily improvement trajectory.
*   **Science Modals:** Clicking a score (e.g., "Cognitive Distortions: 8.5/10") opens a drawer referencing Aaron Beck's research, highlighting the exact sentences spoken that day that triggered the score, and suggesting how to rephrase them.

---

## 6. Daily 1% Improvement Engine (Sadhana Loop)
At 8 PM, after generating the scorecard, the system calculates the **"Sadhana Target for Tomorrow"**:
1.  It compares today's scores against the user's 7-day moving average.
2.  It identifies the metric that showed the sharpest drop or remains the lowest.
3.  It pulls the corresponding re-framing framework and generates exactly one micro-target:
    *   *Example:* `"Focus on: Active Listening. Micro-Target: In your meetings tomorrow, repeat the key blocker Alice raises before offering your suggestion."`

---

## 7. Verification Plan
*   **Unit Tests:** Verify that the transcript analyzer parses transcripts into correct categories without data corruption.
*   **Mock Ingestion Test:** Write a script to ingest a mock transcript, write to the Raw Vault, run the analyzer, save to SQLite, and serve it via the API.
*   **Schema Modification Test:** Run a test migration, modify a schema, verify the migration runner completes, and re-import historical files from the Raw Vault.
