import { auditGitHubProfile } from './github-auditor.js';
import { auditLinkedInProfile, fetchLinkedInProfileData } from './linkedin-auditor.js';
import { auditResume } from './resume-auditor.js';

export async function scoreUnifiedProfile(payload = {}, browserInstance = null) {
  const {
    githubUsernameOrUrl = '',
    linkedinUrl = '',
    resumeData = {}
  } = payload;

  let linkedinHeadline = payload.linkedinHeadline || '';
  let linkedinAbout = payload.linkedinAbout || '';

  const results = {
    overallScore: 0,
    overallGrade: 'B',
    pillars: {},
    crossAssetInsights: []
  };

  let validPillarsCount = 0;
  let totalScoreSum = 0;

  // 1. Audit GitHub
  if (githubUsernameOrUrl) {
    try {
      const ghAudit = await auditGitHubProfile(githubUsernameOrUrl);
      results.pillars.github = ghAudit;
      totalScoreSum += ghAudit.score;
      validPillarsCount++;
    } catch (err) {
      results.pillars.github = { error: err.message, score: 50, grade: 'C' };
    }
  }

  // 2. Audit LinkedIn (Auto-fetch via URL if headline/about not pre-supplied)
  if (linkedinUrl) {
    try {
      if (!linkedinHeadline && !linkedinAbout) {
        const fetched = await fetchLinkedInProfileData(linkedinUrl, browserInstance);
        linkedinHeadline = fetched.headline || '';
        linkedinAbout = fetched.about || '';
      }

      const liAudit = auditLinkedInProfile({
        headline: linkedinHeadline,
        about: linkedinAbout,
        profileUrl: linkedinUrl
      });
      results.pillars.linkedin = liAudit;
      totalScoreSum += liAudit.score;
      validPillarsCount++;
    } catch (err) {
      results.pillars.linkedin = { error: err.message, score: 50, grade: 'C' };
    }
  } else if (linkedinHeadline || linkedinAbout) {
    const liAudit = auditLinkedInProfile({
      headline: linkedinHeadline,
      about: linkedinAbout,
      profileUrl: ''
    });
    results.pillars.linkedin = liAudit;
    totalScoreSum += liAudit.score;
    validPillarsCount++;
  }

  // 3. Audit Resume
  if (resumeData && (resumeData.text || resumeData.summary || resumeData.experience)) {
    const resumeAudit = auditResume(resumeData);
    results.pillars.resume = resumeAudit;
    totalScoreSum += resumeAudit.score;
    validPillarsCount++;
  }

  // Overall Score calculation
  if (validPillarsCount > 0) {
    results.overallScore = Math.round(totalScoreSum / validPillarsCount);
  } else {
    results.overallScore = 65;
  }

  results.overallGrade = results.overallScore >= 88 ? 'A+' :
    (results.overallScore >= 78 ? 'A' : (results.overallScore >= 65 ? 'B' : 'C'));

  // Cross-Asset Consistency Checks
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  const liText = (linkedinHeadline + ' ' + linkedinAbout).toLowerCase();

  if (resumeText.includes('kafka') && !liText.includes('kafka')) {
    results.crossAssetInsights.push('Resume features "Kafka" heavily, but your LinkedIn Headline/About is missing it for recruiter searches.');
  }

  if (results.pillars.github?.publicRepos < 3 && results.pillars.resume?.score >= 80) {
    results.crossAssetInsights.push('Strong senior experience on Resume, but public GitHub has few pinned showcase repos. Pin 2-3 architectural repositories to substantiate senior claims.');
  }

  if (results.pillars.linkedin?.score >= 80 && results.pillars.resume?.score >= 80 && results.pillars.github?.score >= 80) {
    results.crossAssetInsights.push('🌟 High 3-Pillar Synergy! Your LinkedIn, GitHub, and Resume are mutually reinforcing with consistent keywords and quantified impact.');
  }

  return results;
}
