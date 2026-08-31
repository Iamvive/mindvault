import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateResumeHtml } from '../../src/pdf/resume-renderer.js';
import { loadMasterProfile } from '../../src/core/profile.js';

describe('Resume Studio Engine & HTML Compiler', () => {
  it('should generate ATS HTML containing candidate details, skills, and experience', () => {
    const profile = loadMasterProfile('data/master_profile.json');
    const html = generateResumeHtml(profile, 'src/pdf/templates');

    assert.ok(html.includes(profile.personal.name));
    assert.ok(html.includes('Staff Backend Engineer') || html.includes('Experience'));
    assert.ok(html.includes('skill-category'));
  });
});
