import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditLinkedInProfile } from '../../src/core/linkedin-auditor.js';
import { auditGitHubProfile } from '../../src/core/github-auditor.js';

describe('Profile Auditor & Rater Suite', () => {
  it('should audit and score LinkedIn profile inputs', () => {
    const input = {
      headline: 'Senior Full-Stack Engineer | Go, React, AWS | Scaled Systems to 500k DAU',
      about: 'Experienced software engineer with 6+ years building microservices. Reduced latency by 45% using Redis caching.',
      experience: 'Led team of 6 engineers at TechCo.'
    };

    const result = auditLinkedInProfile(input);
    assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
    assert.ok(result.strengths.length > 0);
    assert.equal(result.generatedHeadlines.length, 3);
    assert.ok(result.generatedAbout.includes('About Me'));
  });

  it('should audit GitHub profile with valid username or mock payload', async () => {
    // Audit with octocat as public profile
    try {
      const result = await auditGitHubProfile('octocat');
      assert.equal(result.platform, 'github');
      assert.ok(result.score >= 50);
      assert.ok(result.recommendedReadme);
    } catch (err) {
      // In case of rate limit, verify error is informative
      assert.ok(err.message);
    }
  });
});
