# Zero-Cost AI Job Search & Application Engine — System Design

**Date:** 2026-08-31  
**Status:** Approved  
**Author:** Pair-Programming Assistant & User  

---

## 1. Executive Summary

The **Zero-Cost AI Job Search & Application Engine** is a local, privacy-first automation platform designed to streamline job hunting across platforms (Instahyre, LinkedIn) with zero additional API or SaaS costs. By connecting to an active Google Chrome browser session via Chrome DevTools Protocol (CDP), the system leverages existing logged-in subscriptions (such as Claude Web) to analyze job descriptions (JDs), evaluate ATS compatibility, generate tailor-made single-page HTML/CSS PDF resumes, and stage job applications for one-click human approval before submitting.

---

## 2. Core Architectural Principles

1. **Zero External API Cost:** Harnesses existing logged-in Claude browser sessions and Chrome PDF rendering rather than pay-per-token API calls.
2. **Persistent Master Presence vs. Per-Job Tailoring:**
   - **Global Profiles (LinkedIn & GitHub):** Preserved as persistent, high-visibility master profiles optimized periodically for broad recruiter SEO and technical authority.
   - **Master Profile Data (`master_profile.json`):** Single source of truth containing exhaustive project details, quantified metric bullets, and categorized skills.
   - **Per-JD Dynamic Tailoring:** Generates custom-weighted resumes, ATS scores, and screening answers strictly derived from the master profile for each discovered JD.
3. **Human-in-the-Loop (Semi-Automated Approval Queue):** Daily jobs are discovered and pre-processed in the background. The user reviews tailored PDFs and auto-filled answers in a web dashboard and submits with 1-click approval.
4. **Anti-Detection & Safe Automation:** Reuses existing Chrome user cookies/sessions with humanized delays, daily application rate limits, and deduplication to prevent account flags.

---

## 3. System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    Local Machine                                      |
|                                                                                       |
|  +---------------------------------------------------------------------------------+  |
|  |                            Active Google Chrome                                 |  |
|  |   [Claude Web Tab]      [LinkedIn Logged In]       [Instahyre Logged In]        |  |
|  |   (Zero API Billing)    (Real Cookies & 2FA)       (Real Cookies & 2FA)         |  |
|  +----------------------------------------^----------------------------------------+  |
|                                           | Chrome DevTools Protocol (CDP)            |
|  +----------------------------------------v----------------------------------------+  |
|  |                         MindHunt Engine & Local Server                          |  |
|  |                                                                                 |  |
|  |  [Scheduler / Cron]  --> Triggers daily morning discovery batch                 |  |
|  |  [Job Discovery]    --> Scrapes matching JDs from Instahyre & LinkedIn          |  |
|  |  [Claude AI Worker] --> Automates JD analysis, ATS scoring & resume tailoring   |  |
|  |  [PDF Renderer]     --> Compiles print-optimized HTML/CSS to ATS-friendly PDF   |  |
|  |  [SQLite Database]  --> Tracks jobs, ATS scores, PDFs, application status       |  |
|  |  [Cockpit Web UI]   --> Profile Audit Suite + Daily Approval Queue Dashboard    |  |
|  |  [Auto-Submitter]   --> Executes form filling & PDF upload upon approval        |  |
|  +---------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

---

## 4. Subsystem Specifications

### 4.1 Master Profile & Global Audit Suite
- **Location:** `data/master_profile.json`
- **Schema:**
  - `personal`: Name, title, email, phone, location, LinkedIn, GitHub, portfolio.
  - `masterExperience[]`: Company, role, dates, location, exhaustive bullet points with quantified achievements, tech stack tags.
  - `projects[]`: Name, summary, githubUrl, liveUrl, techStack, highlights.
  - `skills`: Categorized dictionary (languages, frameworks, cloud, databases, tools).
  - `preferences`: Target titles, min salary, remote/hybrid preference, excluded companies.
- **Audit Workflows:**
  - **LinkedIn Optimizer:** Prompts Claude to evaluate current profile text, produce 3 targeted headline options, restructure About section, and format experience bullets with action verbs.
  - **GitHub Optimizer:** Generates a structured profile `README.md` and standard project README templates highlighting architecture, tech choices, and live links.

### 4.2 Daily Job Discovery & Deduplication Worker
- **Platforms (Phase 1):** Instahyre & LinkedIn Easy Apply.
- **Discovery Engine:**
  - Connects to Chrome CDP session.
  - Fetches matching job cards matching configured search terms and experience filters.
  - Checks target job URL and `[company, role]` hash against SQLite DB (`applied_jobs` table).
  - Skips already processed or archived postings.

### 4.3 Claude AI Worker (Zero-Cost Resume Tailoring & ATS Scoring)
- **Execution:** Automated prompt orchestration via the active Claude browser tab using CDP.
- **Input Payload:** Target JD + `master_profile.json` + Screening Questions.
- **Output JSON Structure:**
  ```json
  {
    "atsScore": 91,
    "matchingKeywords": ["TypeScript", "Distributed Systems", "PostgreSQL"],
    "missingKeywords": ["Kafka"],
    "tailoredSummary": "Full-Stack Engineer with 5+ years building distributed backend services...",
    "selectedExperience": [
      {
        "company": "Company A",
        "role": "Senior Engineer",
        "bullets": [
          "Optimized PostgreSQL query latency by 42% for 1M+ DAUs using connection pooling.",
          "Engineered distributed workflow engine in TypeScript and Node.js."
        ]
      }
    ],
    "highlightedSkills": ["TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    "screeningAnswers": {
      "notice_period": "30 days",
      "years_of_experience": "5",
      "expected_ctc": "Negotiable"
    }
  }
  ```

### 4.4 High-ATS HTML/CSS to PDF Engine
- **Template:** Clean, single-column ATS template in HTML/CSS with standard web-safe typography (`Inter` / `Calibri`), standard semantic headers (`<h1>`, `<h2>`), and zero nested multi-column tables.
- **PDF Generation:** Headless Chrome prints to PDF with `@media print` CSS rules, producing crisp selectable text layers.
- **Storage:** Saved locally to `data/generated_resumes/[YYYY-MM-DD]_[Company]_[Role].pdf`.

### 4.5 Approval Queue Dashboard & Platform Submitter
- **Web Dashboard:**
  - Displays queued applications with ATS score badges, matching highlights, and company info.
  - Embedded side-by-side PDF preview and inline editable screening answers.
  - Action buttons: `[Approve & Apply]`, `[Batch Apply]`, `[Edit Answers]`, `[Dismiss]`.
  - Application History Kanban: Tracks status (`Queued` $\rightarrow$ `Applying` $\rightarrow$ `Applied` $\rightarrow$ `Failed` $\rightarrow$ `Interview`).
- **Platform Submitter Worker:**
  - **Instahyre:** Navigates to opportunity, uploads tailored PDF, pre-fills screening notes, submits, and records confirmation.
  - **LinkedIn Easy Apply:** Steps through multi-page modal, fills text inputs, attaches generated PDF, submits, and records status.

---

## 5. Safety, Rate Limiting & Error Handling

1. **Daily Volume Caps:** Default limit of 15 applications per day to simulate natural human usage.
2. **Humanized Interaction:** Playwright injects randomized delays (2–6s), smooth scroll behaviors, and natural keystroke timing.
3. **Modal Exception Handling:** If an application modal contains unhandled custom input types (e.g. unknown radio groups or proprietary assessments), the submission safely aborts, flags the job as `Manual Attention Needed`, and alerts the user.
4. **Data Isolation:** All personal information, resumes, and cookies remain exclusively on the local machine.

---

## 6. Verification & Testing Strategy

1. **CDP Connection Test:** Verify local engine can attach to running Chrome profile and inspect open tabs.
2. **Master Profile Parser Test:** Validate JSON schema parsing and fallback handling.
3. **Claude Prompt & JSON Extractor Test:** Test round-trip prompting to Claude tab and JSON response extraction.
4. **PDF Generator Test:** Render test resume HTML to PDF and verify ATS text extractability (via `pdf-parse`).
5. **Platform Discovery & Application Dry-Run:**
   - Test Instahyre discovery and form fill up to confirmation step without clicking final submit.
   - Test LinkedIn Easy Apply navigation with test job.
6. **Approval Dashboard End-to-End Test:** Verify approval button triggers submission and updates database status in real time.
