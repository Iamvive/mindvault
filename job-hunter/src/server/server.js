import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { initDatabase, getQueuedJobs, getAllJobs, getJobById, updateJobStatus } from '../db/database.js';
import { loadMasterProfile, saveMasterProfile } from '../core/profile.js';
import { processDiscoveredJob } from '../scrapers/discovery-manager.js';
import { submitApprovedJob } from '../submitters/submitter-manager.js';
import { connectToChrome, checkCdpAvailable, findOrCreateTab } from '../cdp/chrome-bridge.js';
import { promptClaudeSession, parseClaudeResponse } from '../cdp/claude-worker.js';
import { auditGitHubProfile } from '../core/github-auditor.js';
import { auditLinkedInProfile, fetchLinkedInProfileData } from '../core/linkedin-auditor.js';
import { scoreUnifiedProfile } from '../core/unified-scorer.js';
import { buildLinkedInPrompt, buildGitHubPrompt, buildResumePrompt, buildCoverLetterPrompt } from '../core/prompt-generator.js';
import { generateResumeHtml, renderResumePdf } from '../pdf/resume-renderer.js';
import { generateCoverLetterHtml, renderCoverLetterPdf } from '../pdf/cover-letter-renderer.js';
import { extractText } from 'unpdf';
import { extractJobFromUrl } from '../scrapers/url-extractor.js';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(express.json({ limit: '25mb' }));
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
    approvedManualCount: all.filter(j => j.status === 'approved_manual').length,
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
      updateJobStatus(db, jobId, 'approved_manual', {
        notes: 'Approved via Cockpit — no CDP connection detected, submit manually'
      });
      return res.json({ success: true, jobId, status: 'approved_manual', message: 'Job approved. No CDP connection detected — please submit this application manually.' });
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

  const isCdp = await checkCdpAvailable();
  let browser = null;
  if (isCdp) {
    browser = await connectToChrome();
  }

  const results = [];
  for (const id of jobIds) {
    if (browser) {
      const result = await submitApprovedJob(db, id, browser, { dryRun: req.body.dryRun || false });
      results.push({ id, status: result.status });
    } else {
      updateJobStatus(db, id, 'approved_manual', {
        notes: 'Batch approved via Cockpit — no CDP connection detected, submit manually'
      });
      results.push({ id, status: 'approved_manual' });
    }
  }

  res.json({ success: true, processed: results.length, results });
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

// API: Parse & Upload Resume File (PDF / TXT / Base64)
app.post('/api/resume/upload', async (req, res) => {
  const { filename, base64Data, rawText } = req.body;
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    let extractedText = rawText || '';

    if (base64Data) {
      try {
        const base64Clean = base64Data.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64Clean, 'base64');
        const parsed = await extractText(new Uint8Array(buffer));
        extractedText = Array.isArray(parsed.text) ? parsed.text.join('\n') : (parsed.text || '');
      } catch (pdfErr) {
        console.warn('PDF parse warning:', pdfErr.message);
      }
    }

    profile.uploadedResumeFileName = filename || 'resume.pdf';
    if (extractedText && extractedText.length > 50) {
      profile.uploadedResumeText = extractedText;
    }

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({
      success: true,
      filename: profile.uploadedResumeFileName,
      textLength: extractedText.length,
      extractedPreview: extractedText.slice(0, 300),
      profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cover Letter Upload
app.post('/api/cover-letter/upload', async (req, res) => {
  const { filename, base64Data, rawText } = req.body;
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    let extractedText = rawText || '';

    if (base64Data) {
      try {
        const base64Clean = base64Data.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64Clean, 'base64');
        const parsed = await extractText(new Uint8Array(buffer));
        extractedText = Array.isArray(parsed.text) ? parsed.text.join('\n') : (parsed.text || '');
      } catch (pdfErr) {
        console.warn('Cover letter PDF parse warning:', pdfErr.message);
      }
    }

    profile.uploadedCoverLetterFileName = filename || 'cover_letter.pdf';
    if (extractedText && extractedText.length > 20) {
      profile.masterCoverLetter = extractedText;
    }

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({
      success: true,
      filename: profile.uploadedCoverLetterFileName,
      coverLetterText: profile.masterCoverLetter,
      profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cover Letter HTML Live Preview
app.get('/api/cover-letter/preview-html', (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const company = req.query.company || '';
    const role = req.query.role || '';
    const html = generateCoverLetterHtml(profile, { company, role });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(`<h3>Preview Error: ${err.message}</h3>`);
  }
});

// API: Cover Letter PDF Download
app.get('/api/cover-letter/download-pdf', async (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const company = req.query.company || '';
    const role = req.query.role || '';
    const outPath = `data/generated_resumes/Cover_Letter_${(profile.personal?.name || 'Candidate').replace(/\s+/g, '_')}.pdf`;
    
    await renderCoverLetterPdf(profile, outPath, { company, role });
    const fullPath = path.resolve(process.cwd(), outPath);

    if (fs.existsSync(fullPath)) {
      res.download(fullPath);
    } else {
      const html = generateCoverLetterHtml(profile, { company, role });
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Instant Auto-Save of any Asset Pillar (GitHub, LinkedIn, Resume, Cover Letter)
app.post('/api/profile/save-asset', (req, res) => {
  const { assetType, data } = req.body;
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    if (!profile.personal) profile.personal = {};

    if (assetType === 'linkedin') {
      if (data.url !== undefined) profile.personal.linkedin = data.url;
      if (data.headline) profile.personal.title = data.headline;
      if (data.about) profile.summary = data.about;
    } else if (assetType === 'github') {
      if (data.username !== undefined) {
        const val = data.username.trim();
        profile.personal.github = val.startsWith('http') ? val : (val ? `https://github.com/${val}` : '');
      }
    } else if (assetType === 'resume') {
      if (data.filename) profile.uploadedResumeFileName = data.filename;
      if (data.text) profile.uploadedResumeText = data.text;
      if (data.summary) profile.summary = data.summary;
      if (data.experience) profile.masterExperience = data.experience;
      if (data.skills) profile.skills = data.skills;
    } else if (assetType === 'cover-letter') {
      if (data.coverLetterText) profile.masterCoverLetter = data.coverLetterText;
      if (data.filename) profile.uploadedCoverLetterFileName = data.filename;
    }

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({ success: true, message: `${assetType} updated and persisted!`, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Candidate Snapshot
app.post('/api/profile/snapshot', (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const { currentRole, currentCompany, totalYearsExperience, targetSeniority, location } = req.body;

    if (!profile.personal) profile.personal = {};
    if (currentRole !== undefined) profile.personal.currentRole = currentRole;
    if (currentCompany !== undefined) profile.personal.currentCompany = currentCompany;
    if (totalYearsExperience !== undefined) profile.personal.totalYearsExperience = Number(totalYearsExperience);
    if (targetSeniority !== undefined) profile.personal.targetSeniority = targetSeniority;
    if (location !== undefined) profile.personal.location = location;

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Auto-Extract Snapshot & Timeline from LinkedIn
app.post('/api/profile/extract-linkedin-snapshot', async (req, res) => {
  const { linkedinUrl } = req.body;
  try {
    const isCdp = await checkCdpAvailable();
    let browser = null;
    if (isCdp) browser = await connectToChrome();

    const data = await fetchLinkedInProfileData(linkedinUrl, browser);
    const profile = loadMasterProfile('data/master_profile.json');

    if (!profile.personal) profile.personal = {};
    if (data.currentRole) profile.personal.currentRole = data.currentRole;
    if (data.currentCompany) profile.personal.currentCompany = data.currentCompany;
    if (data.totalYearsExperience) profile.personal.totalYearsExperience = data.totalYearsExperience;
    if (data.location) profile.personal.location = data.location;
    if (data.headline) profile.personal.title = data.headline;
    if (data.about) profile.summary = data.about;
    if (linkedinUrl) profile.personal.linkedin = linkedinUrl;

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({ success: true, extracted: data, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Resume Studio - Live HTML Preview
app.get('/api/resume/preview-html', (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const html = generateResumeHtml(profile);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(`<h3>Preview Error: ${err.message}</h3>`);
  }
});

// API: Resume Studio - Download ATS PDF
app.get('/api/resume/download-pdf', async (req, res) => {
  try {
    const profile = loadMasterProfile('data/master_profile.json');
    const outPath = `data/generated_resumes/Master_Resume_${(profile.personal?.name || 'Candidate').replace(/\s+/g, '_')}.pdf`;
    await renderResumePdf(profile, outPath);

    const fullPath = path.resolve(process.cwd(), outPath);
    res.download(fullPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Apply and Persist Claude Output to the User's Profile
app.post('/api/profile/apply-claude-output', (req, res) => {
  const { rawOutput, assetType } = req.body;
  if (!rawOutput) return res.status(400).json({ error: 'Missing Claude output' });

  try {
    const profile = loadMasterProfile('data/master_profile.json');
    let parsed = null;

    try {
      parsed = parseClaudeResponse(rawOutput);
    } catch (e) {
      if (assetType === 'linkedin') {
        profile.summary = rawOutput;
      } else if (assetType === 'cover-letter') {
        profile.masterCoverLetter = rawOutput;
      }
    }

    if (parsed) {
      if (parsed.improvedCoverLetter) profile.masterCoverLetter = parsed.improvedCoverLetter;
      if (parsed.candidateName) profile.personal.name = parsed.candidateName;
      if (parsed.updatedTitle) profile.personal.title = parsed.updatedTitle;
      if (parsed.updatedAboutSection) profile.summary = parsed.updatedAboutSection;
      if (parsed.suggestedHeadlines) profile.suggestedHeadlines = parsed.suggestedHeadlines;

      if (parsed.profileReadmeMarkdown) profile.githubReadme = parsed.profileReadmeMarkdown;

      if (parsed.updatedSummary) profile.summary = parsed.updatedSummary;
      if (parsed.recommendedSkills) {
        profile.skills = { ...profile.skills, ...parsed.recommendedSkills };
      }
      if (parsed.upgradedExperience && Array.isArray(parsed.upgradedExperience)) {
        for (const upExp of parsed.upgradedExperience) {
          const match = profile.masterExperience.find(e => e.company.toLowerCase() === upExp.company.toLowerCase());
          if (match && upExp.upgradedBullets) {
            match.bullets = upExp.upgradedBullets;
          }
        }
      }
    }

    saveMasterProfile(profile, 'data/master_profile.json');
    res.json({
      success: true,
      message: 'Profile successfully updated and persisted to your live profile!',
      profile,
      parsed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Generate Claude Prompt with deep profile context
app.post('/api/prompts/generate', (req, res) => {
  const { type, payload } = req.body;
  let prompt = '';

  const master = loadMasterProfile('data/master_profile.json');
  const enrichedPayload = { ...master, ...payload };

  if (type === 'linkedin') {
    prompt = buildLinkedInPrompt(enrichedPayload);
  } else if (type === 'github') {
    prompt = buildGitHubPrompt(enrichedPayload);
  } else if (type === 'resume') {
    prompt = buildResumePrompt(enrichedPayload);
  } else if (type === 'cover-letter') {
    prompt = buildCoverLetterPrompt(enrichedPayload);
  } else {
    return res.status(400).json({ error: 'Invalid prompt type' });
  }

  res.json({ success: true, prompt });
});

// API: Send Prompt Directly to Claude in Chrome via CDP
app.post('/api/prompts/send-claude', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt text' });

  try {
    const isCdp = await checkCdpAvailable();
    if (!isCdp) {
      return res.status(400).json({
        error: 'Chrome CDP not detected on port 9222. Please copy prompt to Claude or launch Chrome with debugging.'
      });
    }

    const browser = await connectToChrome();
    const claudePage = await findOrCreateTab(browser, 'claude.ai', 'https://claude.ai/new');
    const response = await promptClaudeSession(claudePage, prompt);

    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Auto-fetch and extract job details from any URL
app.post('/api/jobs/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Job URL is required' });
  }

  try {
    const isCdp = await checkCdpAvailable();
    let browser = null;
    if (isCdp) {
      browser = await connectToChrome();
    }
    const data = await extractJobFromUrl(url, browser);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error extracting job URL:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to extract job details from URL' });
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

// API: Score Complete 3-Pillar Profile
app.post('/api/audit/full-profile', async (req, res) => {
  try {
    let payload = req.body;
    if (!payload.resumeData || Object.keys(payload.resumeData).length === 0) {
      try {
        payload.resumeData = loadMasterProfile('data/master_profile.json');
      } catch (e) {
        // ignore
      }
    }
    const result = await scoreUnifiedProfile(payload);
    res.json({ success: true, scorecard: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ CareerCraft Cockpit running at http://localhost:${PORT}`);
  });
}

export default app;
