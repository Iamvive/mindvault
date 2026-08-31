# Candidate Snapshot, LinkedIn Experience Extractor & Resume Studio — Design Spec

## 1. Overview
This specification details two tightly integrated systems:
1. **Candidate Snapshot & LinkedIn Extractor:** Automatically extracts and computes the candidate's baseline profile (Current Role, Current Company, Total Years of Experience from LinkedIn timeline, Target Level, and Location) via Chrome CDP.
2. **Interactive Resume Studio & Viewer:** A full-featured workspace to **View**, **Edit live**, **Generate with AI**, and **Download ATS-Compliant PDF / Markdown** resumes.

---

## 2. Architecture & Data Flow

```
[Candidate Master Profile (master_profile.json & SQLite)]
                │
    ┌───────────┴───────────────────────────────┐
    ▼                                           ▼
[Candidate Snapshot Bar]              [Interactive Resume Studio]
  ├── Current Role & Company            ├── Live Visual HTML/PDF Preview
  ├── Total Experience (YoE)            ├── Real-time Section Editor
  ├── Target Seniority                  ├── 1-Click AI Bullet Polisher (Claude)
  └── Synced with LinkedIn Status       ├── 📥 Download ATS PDF
                                        └── 📋 Export Clean Text/Markdown
```

---

## 3. Detailed Component Design

### 3.1 LinkedIn Experience Extractor (`src/core/linkedin-auditor.js`)
- Inspects `#experience` section via Chrome CDP.
- Extracts date intervals (`Month Year - Month Year · X yrs Y mos`).
- Calculates aggregate total career duration (e.g. `6.5 Years`).
- Extracts current company, job title, and location.

### 3.2 Master Profile Schema Additions (`src/core/profile.js`)
```json
{
  "personal": {
    "name": "Alex Mercer",
    "title": "Senior Backend Engineer",
    "currentRole": "Senior Backend Engineer",
    "currentCompany": "Razorpay",
    "totalYearsExperience": 6.5,
    "targetSeniority": "Staff / Lead Software Engineer",
    "location": "Bengaluru, India",
    "workPreference": "Remote / Hybrid"
  }
}
```

### 3.3 Candidate Snapshot Bar Component
- Rendered prominently across **Scorecard**, **Resume Studio**, and **Live Profile**.
- Displays badges for:
  - `👤 Role: Senior Backend Engineer @ Razorpay`
  - `⏳ Experience: 6.5 Years (✓ Synced with LinkedIn)`
  - `🎯 Target: Staff / Lead Engineer`
  - `📍 Location: Bengaluru, India`
- Quick inline edit button to modify any field and persist to disk.

### 3.4 Interactive Resume Studio (`public/index.html`, `app.js`, `server.js`)
- **Navigation Tab:** `📄 Resume Studio & PDF Viewer`.
- **Left Pane (Live Editor):**
  - Edit Contact Info & Links.
  - Edit Executive Summary.
  - Edit Experience Bullets per company (Add/Remove/Reorder).
  - Edit Categorized Skills.
- **Right Pane (Live ATS Visual Preview):**
  - Responsive rendered resume formatted identically to the ATS single-column standard.
- **Action Toolbar:**
  - `⚡ Re-Generate & Polish with Claude`: Sends bullets to Claude for metric quantification.
  - `📥 Download ATS PDF`: Calls `/api/resume/download-pdf` and downloads the compiled PDF.
  - `📋 Copy Plain Text Resume`: Copies formatted text for job portal textboxes.
  - `💾 Save to Master Profile`: Persists changes immediately.

---

## 4. Verification Plan
- Automated unit tests in `tests/core/linkedin-auditor.test.js` for date math and role parsing.
- Server integration test in `tests/server/resume-studio.test.js` verifying live PDF rendering and master profile persistence.
- Manual verification via browser UI at `http://localhost:4200`.
