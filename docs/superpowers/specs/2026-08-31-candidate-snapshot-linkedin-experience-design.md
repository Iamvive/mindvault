# Candidate Snapshot & Automated LinkedIn Experience Extractor — Design Spec

## 1. Overview
The goal is to automatically extract and compute the candidate's core baseline information (Current Role, Current Company, Total Years of Experience, Location, and Target Seniority) directly from their LinkedIn profile via Chrome CDP, and display a persistent **Candidate Snapshot** bar across the platform.

---

## 2. Architecture & Data Flow

```
[User's Active LinkedIn in Chrome]
                │
                ▼ (via Chrome CDP port 9222)
[linkedin-auditor.js (fetchLinkedInProfileData)]
    ├── Extracts Current Role & Company
    ├── Extracts Date Ranges & Computes Total Years of Experience (YoE)
    └── Extracts Location & Current Headline
                │
                ▼
[Master Profile Store (master_profile.json & SQLite)]
    ├── personal.currentRole
    ├── personal.totalYearsExperience
    ├── personal.targetSeniority
    └── personal.location
                │
                ▼
[Frontend: Candidate Snapshot Card]
    ├── Instant visual preview
    ├── 1-click inline edit/override
    └── Feeds into Contextual Claude Prompter & ATS Scoring
```

---

## 3. Detailed Component Design

### 3.1 LinkedIn Experience Timeline Extractor (`src/core/linkedin-auditor.js`)
- Parses `.pvs-list` inside `#experience` section.
- Extracts date intervals (`Month Year - Month Year · X yrs Y mos`).
- Calculates total aggregate career duration.
- Extracts current company and job title.

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

### 3.3 UI Candidate Snapshot Card (`public/index.html`, `style.css`, `app.js`)
- Pinned at top of **My Profile & Scorecard** and **Live Candidate Profile**.
- Shows:
  - Role & Company pill
  - Total Experience badge with `✓ Synced with LinkedIn` status
  - Target Role pill
  - Inline edit modal / inputs.

---

## 4. Verification Plan
- Unit tests in `tests/core/linkedin-auditor.test.js` verifying duration calculations and role extraction.
- End-to-end audit test with master profile persistence.
