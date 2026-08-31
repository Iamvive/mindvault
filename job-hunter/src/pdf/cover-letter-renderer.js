import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

export function generateCoverLetterHtml(profile, target = {}) {
  const pers = profile.personal || {};
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const company = target.company || '[Target Company]';
  const role = target.role || pers.title || 'Senior Android Engineer';
  const letterBody = profile.masterCoverLetter || target.coverLetterText || `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${role} position at ${company}. With over 7 years of engineering scalable, high-performance mobile applications and distributed architectures, I have consistently focused on driving tangible business outcomes through rigorous engineering.\n\nCurrently at Porter, I engineered an in-house events SDK using Kotlin Multiplatform (KMP), matching Mixpanel performance while cutting infrastructure overhead. I also integrated the Truecaller SDK to achieve 99.8% faster login speeds (slashing authentication time from 10s to 0.017s) and boosted signup conversion by 57%. Furthermore, by refactoring monolithic endpoints into microservices and optimizing device stability, my team reduced daily ANR incidents by 92%.\n\nI am particularly drawn to ${company} because of your commitment to engineering excellence and scalable architecture. I would welcome the opportunity to discuss how my deep experience in Kotlin, KMP, modular SDK design, and mobile performance optimization can help accelerate ${company}'s mobile platform goals.\n\nThank you for your time and consideration.\n\nSincerely,\n${pers.name || 'Vivek Kumar'}`;

  const formattedParagraphs = letterBody.split('\n\n').map(p => `<p style="margin-bottom: 16px; line-height: 1.6; font-size: 13px; color: #2d3748;">${p.replace(/\n/g, '<br>')}</p>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #1a202c; padding: 48px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
  .name { font-size: 24px; font-weight: 800; letter-spacing: -0.8px; color: #0f172a; }
  .title { font-size: 13px; font-weight: 600; color: #e60023; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; }
  .contact { font-size: 11.5px; color: #64748b; margin-top: 8px; }
  .date-block { font-size: 12px; color: #475569; margin-bottom: 20px; font-weight: 600; }
  .recipient-block { font-size: 12.5px; color: #334155; margin-bottom: 24px; line-height: 1.4; }
  .content { font-size: 13px; color: #1e293b; }
  .signature { margin-top: 32px; font-size: 13px; font-weight: 700; color: #0f172a; }
</style>
</head>
<body>
  <div class="header">
    <div class="name">${pers.name || 'Vivek Kumar'}</div>
    <div class="title">${pers.title || 'Senior Android Engineer (SDE-2)'}</div>
    <div class="contact">${pers.email || 'vicky.chaudhary67@gmail.com'} • ${pers.phone || '+91 9058666306'} • ${pers.location || 'Bengaluru, India'} • ${pers.linkedin ? `linkedin.com/in/androdevvivek` : ''}</div>
  </div>

  <div class="date-block">${today}</div>

  <div class="recipient-block">
    <strong>Hiring Manager & Engineering Leadership</strong><br>
    ${company}<br>
    Role: <strong>${role}</strong>
  </div>

  <div class="content">
    ${formattedParagraphs}
  </div>

  <div class="signature">
    Sincerely,<br>
    <strong>${pers.name || 'Vivek Kumar'}</strong>
  </div>
</body>
</html>
  `;
}

export async function renderCoverLetterPdf(profile, outPath, target = {}) {
  const html = generateCoverLetterHtml(profile, target);
  const fullOutPath = path.resolve(process.cwd(), outPath);
  const dir = path.dirname(fullOutPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser'
  ];
  let executablePath = chromePaths.find(p => fs.existsSync(p));

  const browser = await chromium.launch({
    executablePath,
    headless: true
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: fullOutPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
  });
  await browser.close();

  return fullOutPath;
}
