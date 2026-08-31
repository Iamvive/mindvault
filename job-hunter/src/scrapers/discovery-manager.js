import { loadMasterProfile } from '../core/profile.js';
import { calculateAtsScore, filterRelevantBullets } from '../core/ats.js';
import { renderResumePdf } from '../pdf/resume-renderer.js';
import { saveJob, isJobApplied } from '../db/database.js';
import path from 'node:path';

export async function processDiscoveredJob(db, rawJob, masterProfile, options = {}) {
  // Check deduplication
  if (isJobApplied(db, rawJob.company, rawJob.title, rawJob.url)) {
    return null;
  }

  // 1. Calculate ATS score & extract key matching/missing terms
  const atsResult = calculateAtsScore(rawJob.jdText, masterProfile);

  // 2. Select top matched bullets for experience
  const relevantBullets = filterRelevantBullets(masterProfile.masterExperience, atsResult.matchingKeywords);

  // Build tailored experience objects
  const tailoredExperience = (masterProfile.masterExperience || []).map(exp => {
    const matched = exp.bullets.filter(b => relevantBullets.includes(b));
    return {
      ...exp,
      bullets: matched.length > 0 ? matched.slice(0, 3) : exp.bullets.slice(0, 3)
    };
  });

  const tailoredSummary = `Results-driven ${rawJob.title} with proven expertise in ${atsResult.matchingKeywords.slice(0, 4).join(', ') || 'modern software architecture'}, delivering scalable systems and measurable business value.`;

  const tailoredData = {
    ...masterProfile,
    tailoredTitle: rawJob.title,
    tailoredSummary,
    experience: tailoredExperience
  };

  // 3. Render tailored PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const safeCompany = rawJob.company.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const safeTitle = rawJob.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const pdfFilename = `${timestamp}_${safeCompany}_${safeTitle}.pdf`;
  const pdfRelPath = `data/generated_resumes/${pdfFilename}`;

  try {
    await renderResumePdf(tailoredData, pdfRelPath, options.browserInstance);
  } catch (err) {
    console.warn(`PDF generation note for ${rawJob.company}: ${err.message}`);
  }

  // 4. Save to database as queued job
  const jobToSave = {
    platform: rawJob.platform,
    platformJobId: rawJob.platformJobId,
    title: rawJob.title,
    company: rawJob.company,
    location: rawJob.location,
    url: rawJob.url,
    jdText: rawJob.jdText,
    atsScore: atsResult.score,
    matchingKeywords: atsResult.matchingKeywords,
    missingKeywords: atsResult.missingKeywords,
    tailoredSummary,
    tailoredBullets: relevantBullets.slice(0, 5),
    highlightedSkills: atsResult.matchingKeywords,
    screeningAnswers: {
      noticePeriod: '30 days',
      expectedCtc: `${masterProfile.preferences?.minSalaryInLPA || 30} LPA`,
      locationPreference: masterProfile.preferences?.locations?.join(', ') || 'Bengaluru / Remote'
    },
    pdfPath: pdfRelPath,
    status: 'queued'
  };

  return saveJob(db, jobToSave);
}

export async function runDiscoveryBatch(db, rawJobsList, masterProfile, options = {}) {
  const processed = [];
  for (const rawJob of rawJobsList) {
    const result = await processDiscoveredJob(db, rawJob, masterProfile, options);
    if (result) {
      processed.push(result);
    }
  }
  return processed;
}
