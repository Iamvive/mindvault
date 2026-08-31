import { getAllCandidateSkills } from './profile.js';

const COMMON_TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'golang', 'go', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'rust',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'node.js', 'express', 'nestjs', 'fastapi', 'django', 'flask',
  'graphql', 'rest', 'grpc', 'websocket', 'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'cassandra', 'sqlite',
  'kafka', 'rabbitmq', 'sqs', 'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'git',
  'microservices', 'distributed systems', 'event-driven', 'system design', 'tdd', 'architecture', 'serverless'
];

export function extractKeywords(text = '') {
  const clean = text.toLowerCase();
  const found = new Set();

  for (const keyword of COMMON_TECH_KEYWORDS) {
    // Regex word boundary matching
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(clean)) {
      found.add(keyword);
    }
  }

  // Also extract acronyms and technical compound nouns (e.g. AWS, CI/CD, RBAC, REST, SQL)
  const tokens = clean.split(/[\s,./;()\-]+/);
  for (const token of tokens) {
    if (token.length > 2 && COMMON_TECH_KEYWORDS.includes(token)) {
      found.add(token);
    }
  }

  return Array.from(found);
}

export function calculateAtsScore(jdText = '', profile) {
  const jdKeywords = extractKeywords(jdText);
  if (jdKeywords.length === 0) {
    return {
      score: 85,
      matchingKeywords: [],
      missingKeywords: []
    };
  }

  const candidateSkills = getAllCandidateSkills(profile);
  const matchingKeywords = [];
  const missingKeywords = [];

  for (const kw of jdKeywords) {
    const isMatch = candidateSkills.some(skill =>
      skill === kw || skill.includes(kw) || kw.includes(skill)
    );
    if (isMatch) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // Match ratio
  const ratio = matchingKeywords.length / jdKeywords.length;
  // Scaled score between 60% and 98%
  const baseScore = Math.round(60 + (ratio * 38));

  return {
    score: Math.min(98, Math.max(50, baseScore)),
    matchingKeywords,
    missingKeywords
  };
}

export function filterRelevantBullets(masterExperience = [], targetKeywords = []) {
  const scoredBullets = [];
  const lowerKeywords = targetKeywords.map(k => k.toLowerCase());

  for (const exp of masterExperience) {
    for (const bullet of exp.bullets || []) {
      const lowerBullet = bullet.toLowerCase();
      let matches = 0;
      for (const kw of lowerKeywords) {
        if (lowerBullet.includes(kw)) {
          matches += 1;
        }
      }
      scoredBullets.push({ bullet, matches, company: exp.company, role: exp.role });
    }
  }

  scoredBullets.sort((a, b) => b.matches - a.matches);
  return scoredBullets.map(item => item.bullet);
}
