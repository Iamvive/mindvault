import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase, saveJob, getJobById } from '../../src/db/database.js';
import { submitApprovedJob } from '../../src/submitters/submitter-manager.js';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB = path.resolve(process.cwd(), 'tests/submitters/test-submitter.db');

describe('Application Submitter Manager', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('should handle mock browser submission with dry-run mode', async () => {
    const db = initDatabase(TEST_DB);
    const job = saveJob(db, {
      platform: 'instahyre',
      title: 'Senior Engineer',
      company: 'TestCo',
      url: 'https://instahyre.com/job/test-123',
      status: 'queued'
    });

    // Mock browser and page
    const mockPage = {
      url: () => 'https://instahyre.com/job/test-123',
      goto: async () => {},
      waitForTimeout: async () => {},
      $: async (sel) => {
        if (sel.includes('Apply') || sel.includes('Interested')) {
          return { click: async () => {} };
        }
        return null;
      },
      close: async () => {}
    };

    const mockBrowser = {
      newPage: async () => mockPage
    };

    const res = await submitApprovedJob(db, job.id, mockBrowser, { dryRun: true });
    assert.equal(res.success, true);
    assert.equal(res.status, 'applied');

    const updated = getJobById(db, job.id);
    assert.equal(updated.status, 'applied');
    assert.ok(updated.submittedAt);
  });
});
