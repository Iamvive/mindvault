import path from 'node:path';
import fs from 'node:fs';

export async function applyLinkedInEasy(page, jobRecord, options = {}) {
  const url = jobRecord.url;
  if (!url) throw new Error('Missing LinkedIn job URL');

  if (!page.url().includes(url)) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  await page.waitForTimeout(2000);

  // 1. Check for Easy Apply button
  const easyApplyBtn = await page.$('.jobs-apply-button, button:has-text("Easy Apply")');
  if (!easyApplyBtn) {
    return {
      success: false,
      reason: 'Job does not have Easy Apply button or has already been applied.'
    };
  }

  await easyApplyBtn.click();
  await page.waitForTimeout(1500);

  // 2. Multi-step modal navigation loop
  let maxSteps = 8;
  while (maxSteps > 0) {
    maxSteps--;

    // If PDF upload is present on this step, upload our tailored PDF
    if (jobRecord.pdfPath && fs.existsSync(path.resolve(process.cwd(), jobRecord.pdfPath))) {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        try {
          await fileInput.setInputFiles(path.resolve(process.cwd(), jobRecord.pdfPath));
          await page.waitForTimeout(1000);
        } catch (e) {
          // ignore upload error if optional
        }
      }
    }

    // Check if Submit application button is visible
    const submitBtn = await page.$('button[aria-label="Submit application"], button:has-text("Submit application")');
    if (submitBtn) {
      if (options.dryRun) {
        return { success: true, dryRun: true, message: 'Reached final submit screen in dry-run mode.' };
      }
      await submitBtn.click();
      await page.waitForTimeout(2000);
      return { success: true, submittedAt: new Date().toISOString() };
    }

    // Otherwise click Next or Review
    const nextBtn = await page.$('button[aria-label="Continue to next step"], button:has-text("Next"), button:has-text("Review")');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    } else {
      // Stuck on complex custom questionnaire
      return {
        success: false,
        reason: 'Requires manual input for complex questions.'
      };
    }
  }

  return {
    success: false,
    reason: 'Application modal exceeded maximum steps without submit.'
  };
}
