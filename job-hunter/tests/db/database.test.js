import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase, saveJob, getQueuedJobs, updateJobStatus, isJobApplied, getJobById } from '../../src/db/database.js';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB_PATH = path.resolve(process.cwd(), 'tests/db/test-jobs.db');

describe('Database Layer', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it('should initialize database schema and save a new job', () => {
    const db = initDatabase(TEST_DB_PATH);
    assert.ok(db);

    const job = {
      platform: 'instahyre',
      platformJobId: 'insta_123',
      title: 'Senior Backend Engineer',
      company: 'Razorpay',
      location: 'Bengaluru / Remote',
      url: 'https://instahyre.com/job/123',
      jdText: 'Looking for Go, Kubernetes, and PostgreSQL expert.',
      atsScore: 92,
      tailoredSummary: 'Experienced backend specialist...',
      tailoredBullets: JSON.stringify(['Built distributed ledger']),
      highlightedSkills: JSON.stringify(['Go', 'PostgreSQL', 'Kubernetes']),
      screeningAnswers: JSON.stringify({ notice: 'Immediate' }),
      pdfPath: '/resumes/razorpay_resume.pdf',
      status: 'queued'
    };

    const saved = saveJob(db, job);
    assert.ok(saved.id);

    const queued = getQueuedJobs(db);
    assert.equal(queued.length, 1);
    assert.equal(queued[0].title, 'Senior Backend Engineer');
    assert.equal(queued[0].company, 'Razorpay');
    assert.equal(queued[0].atsScore, 92);
  });

  it('should check if a job was already applied or saved', () => {
    const db = initDatabase(TEST_DB_PATH);
    const job = {
      platform: 'linkedin',
      platformJobId: 'li_456',
      title: 'Lead Architect',
      company: 'Stripe',
      location: 'Remote',
      url: 'https://linkedin.com/jobs/view/456',
      jdText: 'System design expert',
      status: 'applied'
    };

    saveJob(db, job);
    assert.equal(isJobApplied(db, 'Stripe', 'Lead Architect', 'https://linkedin.com/jobs/view/456'), true);
    assert.equal(isJobApplied(db, 'Google', 'Lead Architect', 'https://google.com'), false);
  });

  it('should update job status and metadata', () => {
    const db = initDatabase(TEST_DB_PATH);
    const job = {
      platform: 'instahyre',
      platformJobId: 'insta_789',
      title: 'Staff Engineer',
      company: 'Swiggy',
      location: 'Bengaluru',
      url: 'https://instahyre.com/job/789',
      jdText: 'High scale backend',
      status: 'queued'
    };

    const saved = saveJob(db, job);
    updateJobStatus(db, saved.id, 'applied', { submittedAt: '2026-08-31T22:00:00Z' });

    const updated = getJobById(db, saved.id);
    assert.equal(updated.status, 'applied');
    assert.equal(updated.submittedAt, '2026-08-31T22:00:00Z');
  });
});
