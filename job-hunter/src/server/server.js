import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { initDatabase, getQueuedJobs, getAllJobs, getJobById, updateJobStatus } from '../db/database.js';
import { loadMasterProfile, saveMasterProfile } from '../core/profile.js';
import { processDiscoveredJob } from '../scrapers/discovery-manager.js';
import { submitApprovedJob } from '../submitters/submitter-manager.js';
import { connectToChrome, checkCdpAvailable } from '../cdp/chrome-bridge.js';
import { auditGitHubProfile } from '../core/github-auditor.js';
import { auditLinkedInProfile } from '../core/linkedin-auditor.js';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), 'public')));
app.use('/data/generated_resumes', express.static(path.resolve(process.cwd(), 'data/generated_resumes')));

const db = initDatabase(path.resolve(process.cwd(), 'data/jobs.db'));

// API: Check CDP connection status
app.get('/api/status', async (req, res) => {
  const cdpActive = await checkCdpAvailable();
  const queued = getQueuedJobs(db);
  const all = getAllJobs(db, 500);

  const stats = {
    cdpConnected: cdpActive,
    queuedCount: queued.length,
    appliedCount: all.filter(j => j.status === 'applied').length,
    manualReviewCount: all.filter(j => j.status === 'manual_review').length,
    totalTracked: all.length
  };

  res.json(stats);
});

// API: Get Queued or All Jobs
app.get('/api/jobs', (req, res) => {
  const status = req.query.status;
  if (status === 'queued') {
    return res.json(getQueuedJobs(db));
  }
  return res.json(getAllJobs(db));
});

// API: Approve single job
app.post('/api/jobs/:id/approve', async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  try {
    const isCdp = await checkCdpAvailable();
    let browser = null;
    if (isCdp) {
      browser = await connectToChrome();
    }

    if (!browser) {
      updateJobStatus(db, jobId, 'applied', {
        submittedAt: new Date().toISOString(),
        notes: 'Approved via Cockpit (Simulated / Local Mode)'
      });
      return res.json({ success: true, jobId, message: 'Job marked as applied' });
    }

    const result = await submitApprovedJob(db, jobId, browser, { dryRun: req.body.dryRun || false });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Dismiss job
app.post('/api/jobs/:id/dismiss', (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  updateJobStatus(db, jobId, 'dismissed');
  res.json({ success: true, jobId });
});

// API: Batch approve
app.post('/api/jobs/batch-approve', async (req, res) => {
  const { jobIds } = req.body;
  if (!Array.isArray(jobIds)) {
    return res.status(400).json({ error: 'Expected array of jobIds' });
  }

  const results = [];
  for (const id of jobIds) {
    updateJobStatus(db, id, 'applied', {
      submittedAt: new Date().toISOString(),
      notes: 'Batch approved via Cockpit'
    });
    results.push({ id, status: 'applied' });
  }

  res.json({ success: true, processed: results.length });
});

// API: Master Profile
app.get('/api/profile', (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    saveMasterProfile(req.body, 'data/master_profile.json');
    res.json({ success: true, profile: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Manually ingest / paste a JD to tailor & queue
app.post('/api/jobs/tailor-new', async (req, res) => {
  const { title, company, location, url, jdText } = req.body;
  if (!title || !company || !jdText) {
    return res.status(400).json({ error: 'Title, Company, and JD Text are required' });
  }

  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const rawJob = {
      platform: req.body.platform || 'custom',
      platformJobId: `custom_${Date.now()}`,
      title,
      company,
      location: location || 'Remote',
      url: url || `custom://${company.toLowerCase()}/${Date.now()}`,
      jdText
    };

    const saved = await processDiscoveredJob(db, rawJob, profile);
    res.json({ success: true, job: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Audit & Rate GitHub Profile
app.post('/api/audit/github', async (req, res) => {
  const { usernameOrUrl } = req.body;
  try {
    const result = await auditGitHubProfile(usernameOrUrl);
    res.json({ success: true, audit: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Audit & Rate LinkedIn Profile
app.post('/api/audit/linkedin', (req, res) => {
  try {
    const result = auditLinkedInProfile(req.body);
    res.json({ success: true, audit: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 MindHunt Cockpit running at http://localhost:${PORT}`);
  });
}

export default app;
