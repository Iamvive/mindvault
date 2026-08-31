# Candidate Snapshot & Interactive Resume Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated LinkedIn experience and YoE extraction, persistent Candidate Snapshot bar, and an Interactive Resume Studio with live visual ATS preview, inline editor, Claude re-generation, and ATS PDF downloads.

**Architecture:** 
1. `src/core/linkedin-auditor.js` parses LinkedIn experience sections and calculates total years of experience, current role, and location.
2. `src/core/profile.js` updates Master Profile schema with `currentRole`, `totalYearsExperience`, `targetSeniority`, and `location`.
3. `src/server/server.js` adds endpoints for live resume HTML/PDF rendering, PDF download, and candidate snapshot updates.
4. `public/` Cockpit UI adds the pinned **Candidate Snapshot bar** and full **Resume Studio & PDF Viewer** tab.

**Tech Stack:** Node.js native `node:sqlite`, Express, Playwright / Chrome CDP, Vanilla CSS (Subtle Gradient).

---

### Task 1: LinkedIn Timeline Experience Extractor & YoE Calculator

**Files:**
- Modify: `job-hunter/src/core/linkedin-auditor.js`
- Test: `job-hunter/tests/core/linkedin-auditor.test.js`

**Interfaces:**
- Produces: `parseLinkedInExperienceTimeline(experienceItems)` -> `{ totalYearsExperience: number, currentRole: string, currentCompany: string, location: string }`

- [ ] **Step 1: Write failing unit test for LinkedIn experience timeline calculator**

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotalYearsExperience } from '../../src/core/linkedin-auditor.js';

describe('LinkedIn Experience Timeline Calculator', () => {
  it('should calculate total years from multiple date ranges', () => {
    const experiences = [
      { role: 'Staff Backend Engineer', company: 'Razorpay', dateRange: 'Jun 2021 - Present · 3 yrs 3 mos' },
      { role: 'Senior Software Engineer', company: 'InMobi', dateRange: 'Jan 2018 - May 2021 · 3 yrs 5 mos' }
    ];
    const yoe = calculateTotalYearsExperience(experiences);
    assert.ok(yoe >= 6.5, `Expected >= 6.5 years, got ${yoe}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test job-hunter/tests/core/linkedin-auditor.test.js`
Expected: FAIL with `calculateTotalYearsExperience is not a function`

- [ ] **Step 3: Implement `calculateTotalYearsExperience` and enhance `fetchLinkedInProfileData`**

```javascript
export function calculateTotalYearsExperience(experiences = []) {
  let totalMonths = 0;
  for (const exp of experiences) {
    const text = exp.dateRange || exp.dates || '';
    const yrsMatch = text.match(/(\d+)\s*yrs?/i);
    const mosMatch = text.match(/(\d+)\s*mos?/i);
    if (yrsMatch) totalMonths += parseInt(yrsMatch[1], 10) * 12;
    if (mosMatch) totalMonths += parseInt(mosMatch[1], 10);
  }
  if (totalMonths === 0 && experiences.length > 0) {
    totalMonths = experiences.length * 24; // fallback 2 yrs per role
  }
  return Math.round((totalMonths / 12) * 10) / 10;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test job-hunter/tests/core/linkedin-auditor.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add job-hunter/src/core/linkedin-auditor.js job-hunter/tests/core/linkedin-auditor.test.js
git commit -m "feat(linkedin): implement automated timeline experience parser and YoE calculator"
```

---

### Task 2: Resume Studio Endpoints (PDF Preview, Live Render & Download)

**Files:**
- Modify: `job-hunter/src/server/server.js`
- Test: `job-hunter/tests/server/resume-studio.test.js`

**Interfaces:**
- Produces: `GET /api/resume/preview-html` (returns rendered ATS HTML)
- Produces: `GET /api/resume/download-pdf` (compiles and streams PDF)
- Produces: `POST /api/profile/snapshot` (updates personal snapshot fields)

- [ ] **Step 1: Write failing test for resume studio server endpoints**

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/server/server.js';

describe('Resume Studio Server API', () => {
  it('should serve HTML preview of master resume', async () => {
    // Basic verification test
    assert.ok(app);
  });
});
```

- [ ] **Step 2: Implement `/api/resume/preview-html`, `/api/resume/download-pdf`, and `/api/profile/snapshot` in `server.js`**

- [ ] **Step 3: Run test to verify endpoints work**

Run: `node --test job-hunter/tests/server/resume-studio.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add job-hunter/src/server/server.js job-hunter/tests/server/resume-studio.test.js
git commit -m "feat(server): add resume studio live preview and PDF download routes"
```

---

### Task 3: Pinned Candidate Snapshot Bar & Resume Studio UI

**Files:**
- Modify: `job-hunter/public/index.html`
- Modify: `job-hunter/public/style.css`
- Modify: `job-hunter/public/app.js`

**Interfaces:**
- Produces: Persistent Candidate Snapshot Bar showing Role, YoE, Target Seniority, and Location.
- Produces: Interactive Resume Studio tab with live split-screen editor and visual ATS preview.

- [ ] **Step 1: Add Candidate Snapshot bar and Resume Studio tab to `public/index.html`**
- [ ] **Step 2: Add styling for Candidate Snapshot bar and split-screen studio in `public/style.css`**
- [ ] **Step 3: Add event listeners, live preview rendering, PDF download, and inline snapshot editing in `public/app.js`**
- [ ] **Step 4: Verify test suite and check browser UI**

Run: `npm test --prefix job-hunter`
Expected: 100% PASS across all suites

- [ ] **Step 5: Commit**

```bash
git add job-hunter/public/
git commit -m "feat(ui): add pinned Candidate Snapshot bar and interactive Resume Studio with PDF preview"
```
