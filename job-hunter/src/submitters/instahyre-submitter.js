import path from 'node:path';
import fs from 'node:fs';

export async function applyInstahyre(page, jobRecord, options = {}) {
  const url = jobRecord.url;
  if (!url) {
    throw new Error('Missing job URL for Instahyre application');
  }

  if (!page.url().includes(url)) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  await page.waitForTimeout(2000);

  // 1. Look for Apply button / Interested button
  const applyBtnSelector = 'button:has-text("Apply"), button:has-text("Interested"), .apply-button, [data-action="apply"]';
  const applyBtn = await page.$(applyBtnSelector);

  if (!applyBtn) {
    return {
      success: false,
      reason: 'No visible Apply or Interested button found. Already applied or closed.'
    };
  }

  // 2. Click Apply to open modal
  await applyBtn.click();
  await page.waitForTimeout(1500);

  // 3. Attach custom PDF if file input is present
  if (jobRecord.pdfPath && fs.existsSync(path.resolve(process.cwd(), jobRecord.pdfPath))) {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(path.resolve(process.cwd(), jobRecord.pdfPath));
      await page.waitForTimeout(1500);
    }
  }

  // 4. Fill custom note / message to recruiter if field exists
  const noteArea = await page.$('textarea[name="note"], textarea[placeholder*="message"], textarea[placeholder*="note"]');
  if (noteArea && jobRecord.tailoredSummary) {
    await noteArea.fill(jobRecord.tailoredSummary);
  }

  // 5. If dry-run, do not submit final button
  if (options.dryRun) {
    return {
      success: true,
      dryRun: true,
      message: 'Dry run completed before final submit click'
    };
  }

  // 6. Click final Confirm / Send Application button
  const confirmBtn = await page.$('.modal button:has-text("Confirm"), .modal button:has-text("Apply"), button[type="submit"]');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.waitForTimeout(2500);
  }

  return {
    success: true,
    submittedAt: new Date().toISOString()
  };
}
