# Instant JD Link Fetcher & Auto-Parser Design Specification

## Overview
The Instant JD Tailor feature in CareerCraft enables users to generate an ATS-scored, tailored resume and queue job applications. Currently, users must manually copy-paste the Job Title, Company Name, Platform, and full Job Description (JD) text.

This feature adds an autonomous **URL Fetcher & Auto-Parser** (`POST /api/jobs/fetch-url`) that allows users to simply paste any job posting link (LinkedIn, Naukri, Instahyre, Greenhouse, Lever, Ashby, Cutshort, or direct company career pages) to automatically extract:
- Job Title
- Company Name
- Location (Remote / Hybrid / City)
- Platform Source
- Experience (YoE) & Salary/CTC (when available)
- Clean, uncollapsed Job Description without boilerplate/nav headers

---

## User Interaction Flow (Fetch & Review)

1. **User Navigation**: User opens the **Instant JD Tailor** tab (`#tab-tailor`).
2. **URL Input**: At the top of the tab, a prominent input bar provides:
   - Input: `#tailor-url-input` (Placeholder: *"Paste job link from LinkedIn, Naukri, Instahyre, Greenhouse, Lever, Ashby..."*)
   - Action Button: `#btn-tailor-fetch-url` (*"⚡ Auto-Fetch Details"*)
   - Keyboard: Pressing `Enter` triggers the fetch.
3. **Fetching Feedback**:
   - Button switches to *"⏳ Fetching via Chrome..."* and disables to prevent duplicate clicks.
4. **Form Population**:
   - Extracted data populates `#tailor-title`, `#tailor-company`, `#tailor-location`, `#tailor-platform`, and `#tailor-jd`.
   - Metadata insight chips render above the JD (e.g. `📍 Location`, `⏳ Experience`, `💰 Salary`).
   - Visual subtle pulse/highlight signals successful population.
5. **Tailor & Queue**:
   - User reviews or adjusts any field and clicks *"✨ Tailor Resume & Queue Job"* to proceed with ATS scoring and PDF generation.

---

## Architecture & Extraction Pipeline

### 1. Endpoint: `POST /api/jobs/fetch-url`
- **Request Body**:
  ```json
  {
    "url": "https://www.linkedin.com/jobs/view/123456789"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://www.linkedin.com/jobs/view/123456789",
      "title": "Senior Staff Android Engineer",
      "company": "Swiggy",
      "location": "Bengaluru, India (Hybrid)",
      "platform": "linkedin",
      "experience": "6-10 years",
      "salary": "₹45L - ₹65L PA",
      "jdText": "Swiggy is seeking an experienced Senior Staff Android Engineer...\n\nKey Responsibilities:\n- Architect KMP modules...",
      "skillsExtracted": ["Kotlin", "KMP", "Jetpack Compose", "Coroutines"]
    }
  }
  ```
- **Error Response (400 / 500)**:
  ```json
  {
    "success": false,
    "error": "Failed to extract job details from URL: <details>"
  }
  ```

---

### 2. Module: `src/scrapers/url-extractor.js`

#### Platform Resolvers:
1. **LinkedIn (`linkedin.com/jobs/*`)**:
   - Targets `.top-card-layout__title`, `.job-details-jobs-unified-top-card__job-title`, `h1`.
   - Targets `.top-card-layout__first-subline`, `.job-details-jobs-unified-top-card__company-name`.
   - Expands hidden description: clicks `.show-more-less-html__button`, `.jobs-description__footer-button` if present.
   - Extracts clean HTML/text from `.show-more-less-html__markup`, `#job-details`.
2. **Greenhouse (`boards.greenhouse.io/*`, `job-boards.greenhouse.io/*`)**:
   - Extracts `#header .app-title`, `.company-name`, `.location`, `#content`.
3. **Lever (`jobs.lever.co/*`)**:
   - Extracts `.posting-headline h2`, `.posting-category`, `.section-wrapper`.
4. **Ashby (`jobs.ashbyhq.com/*`)**:
   - Extracts `h1`, `[data-qa="job-description"]`, metadata blocks.
5. **Instahyre (`instahyre.com/job-*`)**:
   - Extracts `.job-details`, `.company-name`, experience, skills, and JD text.
6. **Naukri (`naukri.com/job-listings-*`)**:
   - Extracts `.styles_jcp__header`, `.styles_job-desc-container`, experience, CTC, skills.
7. **Cutshort (`cutshort.io/job/*`)**:
   - Extracts job header, salary range, tech tags, and description.
8. **Universal / Schema.org Fallback (Company Career Sites & Custom Boards)**:
   - Scrapes JSON-LD `<script type="application/ld+json">` matching `@type: "JobPosting"`.
   - Extracts `title`, `hiringOrganization.name`, `jobLocation`, `baseSalary`, `description`.
   - Strips `<nav>`, `<header>`, `<footer>`, `<script>`, `<style>`, and cookie banners.

#### Execution Strategy:
- **Primary (CDP / Playwright)**: When Chrome CDP (port 9222) is active, opens a lightweight background page using `connectToChrome()`. This automatically inherits active browser cookies/sessions (bypassing auth-walls or anti-bot checks) and waits for full DOM hydration. Always closes the page in a `finally` block.
- **Secondary (HTTP Fetch Fallback)**: If CDP is not running, performs a direct `fetch()` request with a standard browser User-Agent and extracts OpenGraph / JSON-LD / HTML semantic tags.

---

## UI Components & Styles (`public/index.html`, `public/style.css`, `public/app.js`)

### 1. `public/index.html` (Instant JD Tailor section):
- Add the Quick URL Import card at the top of `#tab-tailor`.
- Add `#tailor-location` input field to the form.
- Add `#tailor-insights` container for extracted metadata badges (`📍 Location`, `⏳ Experience`, `💰 Salary`).

### 2. `public/app.js`:
- Add event listeners for `#btn-tailor-fetch-url` and `keydown` (`Enter`) on `#tailor-url-input`.
- Call `POST /api/jobs/fetch-url`.
- Populate `#tailor-title`, `#tailor-company`, `#tailor-location`, `#tailor-platform`, `#tailor-jd`.
- Render detected insight chips.

---

## Error Handling & Edge Cases
- **Invalid URL format**: Client validates URL syntax before sending.
- **Page Load Timeout**: Page navigation bounded by 20s timeout; cleans up browser tab in `finally` block to prevent resource leaks.
- **Missing Fields**: If a website provides title and description but no salary or location, available fields are populated while leaving unknown fields blank for user input.
- **Bot-Detection / Blocked Sites**: If a page returns 403/CAPTCHA, returns a friendly error message instructing the user to paste manually without clearing form state.

---

## Verification & Testing
1. **Unit & Integration Tests (`tests/url-extractor.test.js`)**:
   - Test platform URL classifier.
   - Test JSON-LD and OpenGraph metadata extractor on sample HTML payloads.
   - Test text cleaner (stripping HTML tags, whitespace normalizing).
2. **Live End-to-End Verification**:
   - Test extraction from LinkedIn job URLs.
   - Test extraction from Greenhouse / Lever / Ashby URLs.
   - Test extraction from Instahyre / Naukri URLs.
   - Verify UI population and 1-click tailored resume generation on `http://localhost:4200`.
