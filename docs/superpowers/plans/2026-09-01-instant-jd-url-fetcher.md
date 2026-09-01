# Instant JD Link Fetcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users in the Instant JD Tailor tab to paste any job posting link (LinkedIn, Naukri, Instahyre, Greenhouse, Lever, Ashby, Cutshort, or career pages) to automatically extract title, company, location, platform, experience, salary, and clean JD text into the form.

**Architecture:** A backend URL extraction module (`url-extractor.js`) parses incoming URLs, leveraging active Chrome CDP sessions to bypass auth walls/SPAs and query platform-specific DOM structures or universal JSON-LD schema, with HTTP fallback. The Express server exposes `POST /api/jobs/fetch-url`, and the frontend UI updates the Instant JD Tailor tab with an auto-fetch input bar, badges, and smooth population.

**Tech Stack:** Node.js (ESM), Express, Playwright-core (CDP), Vanilla JavaScript, Subtle Gradient CSS Design System.

## Global Constraints
- Must work with zero external API costs using Chrome CDP on port 9222.
- Clean text extraction: strip script tags, headers, navbars, footer links, and cookie notices.
- Non-destructive UX: preserve user edits if fetch partially fails.
- Follow Subtle Gradient design system tokens (`Inter` font, rounded 16px/9999px pills, `--sg-primary` accents).

---

### Task 1: Create URL Extraction Engine (`src/scrapers/url-extractor.js`)

**Files:**
- Create: `job-hunter/src/scrapers/url-extractor.js`

**Interfaces:**
- Produces: `extractJobFromUrl(url: string, browserInstance?: any): Promise<ExtractedJobData>`
  ```ts
  interface ExtractedJobData {
    url: string;
    platform: 'linkedin' | 'instahyre' | 'naukri' | 'greenhouse' | 'lever' | 'ashby' | 'cutshort' | 'custom';
    title: string;
    company: string;
    location: string;
    experience?: string;
    salary?: string;
    jdText: string;
    skillsExtracted?: string[];
  }
  ```

- [ ] **Step 1: Write `src/scrapers/url-extractor.js`**
  Implement URL classification, CDP browser page automation (including clicking "Show more" buttons on LinkedIn), domain-specific DOM selectors, and fallback JSON-LD / OpenGraph parsers.

- [ ] **Step 2: Commit Task 1**
  ```bash
  git add job-hunter/src/scrapers/url-extractor.js
  git commit -m "feat: add url-extractor engine for multi-platform job postings"
  ```

---

### Task 2: Implement Backend API Route (`POST /api/jobs/fetch-url`)

**Files:**
- Modify: `job-hunter/src/server/server.js`

**Interfaces:**
- Consumes: `extractJobFromUrl` from `../scrapers/url-extractor.js`
- Produces: Express POST endpoint `/api/jobs/fetch-url` returning `{ success: boolean, data?: ExtractedJobData, error?: string }`

- [ ] **Step 1: Add endpoint to `server.js`**
  Validate `url`, invoke `extractJobFromUrl(url)`, and handle error responses gracefully with standard HTTP status codes.

- [ ] **Step 2: Verify endpoint via curl**
  Test using a sample job URL or dummy URL.

- [ ] **Step 3: Commit Task 2**
  ```bash
  git add job-hunter/src/server/server.js
  git commit -m "feat: expose POST /api/jobs/fetch-url endpoint in express server"
  ```

---

### Task 3: Enhance Instant JD Tailor UI (`index.html` & `style.css`)

**Files:**
- Modify: `job-hunter/public/index.html`
- Modify: `job-hunter/public/style.css`

- [ ] **Step 1: Update `index.html`**
  Add the "Quick Import from Job URL" section with `#tailor-url-input` and `#btn-tailor-fetch-url`, add `#tailor-location` field to the form, and add `#tailor-insights` container for extracted chips.

- [ ] **Step 2: Update `style.css`**
  Add styles for the quick import bar, loading state animations, and insight badge chips following Subtle Gradient rules.

- [ ] **Step 3: Commit Task 3**
  ```bash
  git add job-hunter/public/index.html job-hunter/public/style.css
  git commit -m "feat: add quick URL import UI and insight badges to Instant JD Tailor"
  ```

---

### Task 4: Wire Frontend Auto-Fetch Logic (`public/app.js`)

**Files:**
- Modify: `job-hunter/public/app.js`

- [ ] **Step 1: Implement fetch handler and keyboard listeners**
  Add event listeners on `#btn-tailor-fetch-url` and `#tailor-url-input` (Enter key), call `/api/jobs/fetch-url`, populate form fields, render metadata insight chips, and update location in `/api/jobs/tailor-new` payload.

- [ ] **Step 2: Commit Task 4**
  ```bash
  git add job-hunter/public/app.js
  git commit -m "feat: wire auto-fetch logic and form auto-population in app.js"
  ```

---

### Task 5: Manual End-to-End Verification & Walkthrough

- [ ] **Step 1: Test real job URLs across platforms**
  - LinkedIn Job URL
  - Greenhouse / Ashby / Lever URL
  - Instahyre / Naukri URL
  - Custom Career page
- [ ] **Step 2: Verify form auto-fill and tailor flow**
  Confirm that clicking "✨ Tailor Resume & Queue Job" correctly calculates the ATS score and creates a tailored PDF with the extracted data.
- [ ] **Step 3: Document walkthrough**
