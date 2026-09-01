import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractKeywords, calculateAtsScore, filterRelevantBullets } from '../../src/core/ats.js';
import { loadMasterProfile } from '../../src/core/profile.js';
import path from 'node:path';

describe('ATS Scoring and Profile Engine', () => {
  it('should load and validate master profile', () => {
    const profilePath = path.resolve(process.cwd(), 'data/master_profile.json');
    const profile = loadMasterProfile(profilePath);

    assert.ok(profile.personal.name);
    assert.ok(profile.masterExperience.length > 0);
    assert.ok(profile.skills.languages.length > 0);
  });

  it('should extract tech keywords from job description text', () => {
    const jd = `
      We are looking for a Senior Backend Engineer proficient in Go, PostgreSQL,
      Kafka, and Docker. Experience with Kubernetes, distributed systems, and AWS is required.
      Nice to have: Redis and GraphQL.
    `;

    const keywords = extractKeywords(jd);
    assert.ok(keywords.includes('go'));
    assert.ok(keywords.includes('postgresql'));
    assert.ok(keywords.includes('kafka'));
    assert.ok(keywords.includes('docker'));
    assert.ok(keywords.includes('kubernetes'));
    assert.ok(keywords.includes('distributed systems') || keywords.includes('aws'));
  });

  it('should calculate realistic ATS score comparing JD against candidate profile', () => {
    const profilePath = path.resolve(process.cwd(), 'tests/fixtures/test-profile.json');
    const profile = loadMasterProfile(profilePath);

    const jdMatching = `
      We need a Staff Software Engineer with Go, TypeScript, PostgreSQL, Kafka, and AWS experience.
      Architecting high throughput distributed systems and mentoring teams is essential.
    `;

    const result = calculateAtsScore(jdMatching, profile);
    assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
    assert.ok(result.matchingKeywords.length > 0);
    assert.ok(Array.isArray(result.missingKeywords));
  });

  it('should filter and rank relevant bullet points based on JD keywords', () => {
    const profilePath = path.resolve(process.cwd(), 'tests/fixtures/test-profile.json');
    const profile = loadMasterProfile(profilePath);

    const targetKeywords = ['kafka', 'go', 'postgresql', 'distributed systems'];
    const bullets = filterRelevantBullets(profile.masterExperience, targetKeywords);

    assert.ok(bullets.length > 0);
    // The top bullet should be the Kafka/Go transaction processing pipeline
    assert.ok(bullets[0].toLowerCase().includes('kafka') || bullets[0].toLowerCase().includes('postgresql'));
  });
});
