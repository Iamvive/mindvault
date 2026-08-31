import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

export function generateResumeHtml(tailoredData, templateDir = './src/pdf/templates') {
  const htmlPath = path.resolve(process.cwd(), templateDir, 'ats-clean.html');
  const cssPath = path.resolve(process.cwd(), templateDir, 'style.css');

  let html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  html = html.replace('{{STYLESHEET}}', css);

  const personal = tailoredData.personal || {};
  html = html.replaceAll('{{CANDIDATE_NAME}}', personal.name || 'Candidate');
  html = html.replaceAll('{{CANDIDATE_TITLE}}', tailoredData.tailoredTitle || personal.title || 'Software Engineer');
  html = html.replaceAll('{{EMAIL}}', personal.email || '');
  html = html.replaceAll('{{PHONE}}', personal.phone || '');
  html = html.replaceAll('{{LOCATION}}', personal.location || '');

  if (personal.linkedin) {
    html = html.replace('{{#LINKEDIN}}', '').replace('{{/LINKEDIN}}', '').replaceAll('{{LINKEDIN}}', personal.linkedin);
  } else {
    html = html.replace(/{{#LINKEDIN}}[\s\S]*?{{\/LINKEDIN}}/, '');
  }

  if (personal.github) {
    html = html.replace('{{#GITHUB}}', '').replace('{{/GITHUB}}', '').replaceAll('{{GITHUB}}', personal.github);
  } else {
    html = html.replace(/{{#GITHUB}}[\s\S]*?{{\/GITHUB}}/, '');
  }

  if (personal.portfolio) {
    html = html.replace('{{#PORTFOLIO}}', '').replace('{{/PORTFOLIO}}', '').replaceAll('{{PORTFOLIO}}', personal.portfolio);
  } else {
    html = html.replace(/{{#PORTFOLIO}}[\s\S]*?{{\/PORTFOLIO}}/, '');
  }

  html = html.replace('{{SUMMARY}}', tailoredData.tailoredSummary || tailoredData.summary || '');

  // Skills Rows
  let skillsHtml = '';
  const skills = tailoredData.skills || {};
  for (const [category, values] of Object.entries(skills)) {
    const formattedCat = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const valString = Array.isArray(values) ? values.join(', ') : values;
    skillsHtml += `
      <div class="skill-category">${formattedCat}:</div>
      <div class="skill-values">${valString}</div>
    `;
  }
  html = html.replace('{{SKILLS_ROWS}}', skillsHtml);

  // Experience
  let expHtml = '';
  const experiences = tailoredData.experience || tailoredData.masterExperience || [];
  for (const exp of experiences) {
    const bulletsHtml = (exp.bullets || []).map(b => `<li>${b}</li>`).join('\n');
    expHtml += `
      <div class="experience-item">
        <div class="item-header">
          <span class="item-title">${exp.role} <span class="item-company">| ${exp.company}</span></span>
          <span class="item-date">${exp.startDate || ''} – ${exp.endDate || ''}</span>
        </div>
        <ul class="bullet-list">
          ${bulletsHtml}
        </ul>
      </div>
    `;
  }
  html = html.replace('{{EXPERIENCE_ITEMS}}', expHtml);

  // Projects
  const projects = tailoredData.projects || [];
  if (projects.length > 0) {
    let projHtml = '';
    for (const proj of projects) {
      const bulletsHtml = (proj.highlights || []).map(h => `<li>${h}</li>`).join('\n');
      projHtml += `
        <div class="project-item">
          <div class="item-header">
            <span class="item-title">${proj.name} ${proj.techStack ? `<span style="font-weight:400;color:#6b7280">(${proj.techStack.join(', ')})</span>` : ''}</span>
            <span class="item-date">${proj.github ? `<a href="${proj.github}">GitHub</a>` : ''}</span>
          </div>
          <ul class="bullet-list">
            ${bulletsHtml}
          </ul>
        </div>
      `;
    }
    html = html.replace('{{#PROJECTS_SECTION}}', '').replace('{{/PROJECTS_SECTION}}', '');
    html = html.replace('{{PROJECT_ITEMS}}', projHtml);
  } else {
    html = html.replace(/{{#PROJECTS_SECTION}}[\s\S]*?{{\/PROJECTS_SECTION}}/, '');
  }

  // Education
  let eduHtml = '';
  const education = tailoredData.education || [];
  for (const edu of education) {
    eduHtml += `
      <div class="education-item">
        <div><strong>${edu.degree}</strong> – ${edu.institution}</div>
        <div class="item-date">${edu.year || ''}</div>
      </div>
    `;
  }
  html = html.replace('{{EDUCATION_ITEMS}}', eduHtml);

  return html;
}

export async function renderResumePdf(tailoredData, outputPath, browserInstance = null) {
  const htmlContent = generateResumeHtml(tailoredData);
  const resolvedOut = path.resolve(process.cwd(), outputPath);
  const outDir = path.dirname(resolvedOut);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let browser = browserInstance;
  let ownsBrowser = false;

  if (!browser) {
    // Launch Chrome using default system installation if available
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser'
    ];
    let executablePath = chromePaths.find(p => fs.existsSync(p));

    browser = await chromium.launch({
      executablePath,
      headless: true
    });
    ownsBrowser = true;
  }

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });

  await page.pdf({
    path: resolvedOut,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await page.close();
  if (ownsBrowser) {
    await browser.close();
  }

  return { html: htmlContent, pdfPath: resolvedOut };
}
