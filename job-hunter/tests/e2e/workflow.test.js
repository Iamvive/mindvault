import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase, getQueuedJobs, getJobById, updateJobStatus } from '../../src/db/database.js';
import { loadMasterProfile } from '../../src/core/profile.js';
import { processDiscoveredJob } from '../../src/scrapers/discovery-manager.js';
import { renderResumePdf } from '../../src/pdf/resume-renderer.js';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB = path.resolve(process.cwd(), 'tests/e2e/test-e2e.db');

describe('End-to-End Workflow Integration', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('should run full pipeline: JD ingestion -> ATS Scoring -> PDF rendering -> Queue -> Approval', async () => {
    const db = initDatabase(TEST_DB);
    const profile = loadMasterProfile('data/master_profile.json');

    const incomingJD = {
      platform: 'instahyre',
      platformJobId: 'insta_e2e_01',
      title: 'Principal Distributed Systems Architect',
      company: 'Razorpay',
      location: 'Bengaluru / Remote',
      url: 'https://instahyre.com/job/razorpay-e2e',
      jdText: 'Seeking Principal Architect with Go, Kafka, PostgreSQL, and AWS to design fault-tolerant payment systems.'
    };

    // 1. Ingest and tailor
    const queuedJob = await processDiscoveredJob(db, incomingJD, profile);
    assert.ok(queuedJob);
    assert.ok(queuedJob.atsScore >= 85);
    assert.equal(queuedJob.status, 'queued');

    // Verify PDF was created
    if (queuedJob.pdfPath) {
      assert.ok(fs.existsSync(path.resolve(process.cwd(), queuedJob.pdfPath)));
    }

    // 2. Fetch Queued Jobs for Cockpit display
    const queuedList = getQueuedJobs(db);
    assert.equal(queuedList.length, 1);
    assert.equal(queuedList[0].company, 'Razorpay');

    // 3. User Approves Job in Cockpit
    updateJobStatus(db, queuedJob.id, 'applied', {
      submittedAt: new Date().toISOString(),
      notes: 'Approved 1-click apply'
    });

    const finalRecord = getJobById(db, queuedJob.id);
    assert.equal(finalRecord.status, 'applied');
    assert.ok(finalRecord.submittedAt);

    // 4. Queued list should now be empty
    const remainingQueued = getQueuedJobs(db);
    assert.equal(remainingQueued.length, 0);
  });
});
