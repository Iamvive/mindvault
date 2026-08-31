import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTailorPrompt, parseClaudeResponse } from '../../src/cdp/claude-worker.js';
import { loadMasterProfile } from '../../src/core/profile.js';

describe('Claude Worker Parser & Prompter', () => {
  it('should format structured tailoring prompt with JD and Master Profile', () => {
    const profile = loadMasterProfile('data/master_profile.json');
    const jd = 'Looking for Senior Go / Distributed Systems Engineer';

    const prompt = formatTailorPrompt(jd, profile);
    assert.ok(prompt.includes('Alex Mercer'));
    assert.ok(prompt.includes('Senior Go / Distributed Systems Engineer'));
    assert.ok(prompt.includes('OUTPUT JSON SCHEMA'));
  });

  it('should parse clean JSON response from Claude', () => {
    const cleanJson = JSON.stringify({
      atsScore: 94,
      matchingKeywords: ['Go', 'Kafka'],
      missingKeywords: [],
      tailoredSummary: 'Expert Go Engineer',
      experience: [],
      skills: {},
      screeningAnswers: {}
    });

    const parsed = parseClaudeResponse(cleanJson);
    assert.equal(parsed.atsScore, 94);
    assert.equal(parsed.tailoredSummary, 'Expert Go Engineer');
  });

  it('should extract and parse JSON wrapped in markdown code blocks', () => {
    const markdownResponse = `
Here is the tailored resume data:

\`\`\`json
{
  "atsScore": 88,
  "matchingKeywords": ["Node.js", "React"],
  "missingKeywords": ["AWS"],
  "tailoredSummary": "Full-stack web developer...",
  "experience": [
    {
      "company": "FinTech Matrix",
      "role": "Senior Engineer",
      "bullets": ["Optimized React queries"]
    }
  ]
}
\`\`\`

I hope this helps!
    `;

    const parsed = parseClaudeResponse(markdownResponse);
    assert.equal(parsed.atsScore, 88);
    assert.equal(parsed.experience[0].company, 'FinTech Matrix');
  });
});
