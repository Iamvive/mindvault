import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase, getQueuedJobs } from '../../src/db/database.js';
import { loadMasterProfile } from '../../src/core/profile.js';
import { processDiscoveredJob, runDiscoveryBatch } from '../../src/scrapers/discovery-manager.js';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB = path.resolve(process.cwd(), 'tests/scrapers/test-discovery.db');

describe('Discovery Manager Pipeline', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('should process discovered job, score ATS, and queue for review', async () => {
    const db = initDatabase(TEST_DB);
    const profile = loadMasterProfile('data/master_profile.json');

    const sampleJob = {
      platform: 'instahyre',
      platformJobId: 'insta_999',
      title: 'Senior Go Backend Engineer',
      company: 'CRED',
      location: 'Bengaluru',
      url: 'https://instahyre.com/job/cred-999',
      jdText: 'CRED is hiring Go engineers for high throughput payment systems with Kafka and PostgreSQL.'
    };

    const saved = await processDiscoveredJob(db, sampleJob, profile);
    assert.ok(saved);
    assert.equal(saved.company, 'CRED');
    assert.ok(saved.atsScore >= 80);
    assert.equal(saved.status, 'queued');

    const queued = getQueuedJobs(db);
    assert.equal(queued.length, 1);
    assert.equal(queued[0].company, 'CRED');
  });

  it('should skip duplicate jobs already in DB', async () => {
    const db = initDatabase(TEST_DB);
    const profile = loadMasterProfile('data/master_profile.json');

    const sampleJob = {
      platform: 'linkedin',
      platformJobId: 'li_111',
      title: 'Lead Architect',
      company: 'Zerodha',
      location: 'Bengaluru',
      url: 'https://linkedin.com/jobs/view/111',
      jdText: 'Low latency systems and financial markets.'
    };

    await processDiscoveredJob(db, sampleJob, profile);
    // Try to process same job again
    const secondTry = await processDiscoveredJob(db, sampleJob, profile);
    assert.equal(secondTry, null);

    const queued = getQueuedJobs(db);
    assert.equal(queued.length, 1);
  });
});
