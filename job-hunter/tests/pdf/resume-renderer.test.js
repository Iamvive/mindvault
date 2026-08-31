import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateResumeHtml, renderResumePdf } from '../../src/pdf/resume-renderer.js';
import { loadMasterProfile } from '../../src/core/profile.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Resume HTML & PDF Renderer', () => {
  it('should generate valid ATS-compliant HTML with candidate data injected', () => {
    const profile = loadMasterProfile('data/master_profile.json');
    const tailored = {
      ...profile,
      tailoredSummary: 'Tailored executive summary targeting Distributed Systems Lead role.',
      experience: profile.masterExperience
    };

    const html = generateResumeHtml(tailored);
    assert.ok(html.includes('Alex Mercer'));
    assert.ok(html.includes('Tailored executive summary targeting Distributed Systems Lead role.'));
    assert.ok(html.includes('CloudScale Technologies'));
    assert.ok(html.includes('Technical Expertise'));
  });

  it('should render PDF file using Chrome / Playwright', async () => {
    const profile = loadMasterProfile('data/master_profile.json');
    const outPdf = path.resolve(process.cwd(), 'tests/pdf/test-output.pdf');

    try {
      const result = await renderResumePdf(profile, outPdf);
      assert.ok(fs.existsSync(result.pdfPath));
      const stats = fs.statSync(result.pdfPath);
      assert.ok(stats.size > 1000, `Expected PDF size > 1KB, got ${stats.size} bytes`);
    } finally {
      if (fs.existsSync(outPdf)) {
        fs.unlinkSync(outPdf);
      }
    }
  });
});
