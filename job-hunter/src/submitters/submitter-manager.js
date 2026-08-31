import { updateJobStatus, getJobById } from '../db/database.js';
import { applyInstahyre } from './instahyre-submitter.js';
import { applyLinkedInEasy } from './linkedin-submitter.js';

export async function submitApprovedJob(db, jobId, browser, options = {}) {
  const job = getJobById(db, jobId);
  if (!job) {
    throw new Error(`Job not found with ID ${jobId}`);
  }

  updateJobStatus(db, jobId, 'applying');

  // Enforce random delay (2-4s) for anti-detection
  const delay = Math.floor(Math.random() * 2000) + 2000;
  await new Promise(r => setTimeout(r, delay));

  const page = await browser.newPage();
  try {
    let result;
    if (job.platform === 'instahyre') {
      result = await applyInstahyre(page, job, options);
    } else if (job.platform === 'linkedin') {
      result = await applyLinkedInEasy(page, job, options);
    } else {
      throw new Error(`Unsupported platform ${job.platform}`);
    }

    if (result.success) {
      updateJobStatus(db, jobId, 'applied', {
        submittedAt: result.submittedAt || new Date().toISOString(),
        notes: result.dryRun ? 'Dry run completed successfully' : 'Application submitted successfully'
      });
      return { success: true, jobId, status: 'applied' };
    } else {
      updateJobStatus(db, jobId, 'manual_review', {
        notes: result.reason || 'Failed to submit automatically'
      });
      return { success: false, jobId, status: 'manual_review', reason: result.reason };
    }
  } catch (err) {
    updateJobStatus(db, jobId, 'manual_review', { notes: err.message });
    return { success: false, jobId, status: 'manual_review', error: err.message };
  } finally {
    await page.close();
  }
}
