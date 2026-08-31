import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreUnifiedProfile } from '../../src/core/unified-scorer.js';
import { loadMasterProfile } from '../../src/core/profile.js';

describe('Unified 3-Pillar Profile Scorer', () => {
  it('should score GitHub, LinkedIn, and Resume and calculate overall readiness score', async () => {
    const profile = loadMasterProfile('data/master_profile.json');

    const payload = {
      githubUsernameOrUrl: 'octocat',
      linkedinUrl: 'https://linkedin.com/in/alex-mercer',
      linkedinHeadline: 'Staff Backend Architect | Go, Kafka, PostgreSQL, AWS | High-Throughput Systems',
      linkedinAbout: 'Senior engineer with 6+ years in distributed systems. Reduced latency by 54% and scaled to 1M users.',
      resumeData: profile
    };

    const scorecard = await scoreUnifiedProfile(payload);
    assert.ok(scorecard.overallScore >= 70, `Expected score >= 70, got ${scorecard.overallScore}`);
    assert.ok(scorecard.pillars.linkedin);
    assert.ok(scorecard.pillars.resume);
    assert.ok(scorecard.pillars.github);
    assert.ok(Array.isArray(scorecard.crossAssetInsights));
  });
});
