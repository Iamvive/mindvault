export async function discoverInstahyreJobs(page, options = {}) {
  const targetUrl = options.url || 'https://www.instahyre.com/candidate/opportunities/';
  if (!page.url().includes('instahyre.com')) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  // Allow dynamic cards to render
  await page.waitForTimeout(2000);

  const jobCards = await page.$$eval('.opportunity-card, .candidate-opportunity-card, .job-item', (cards) => {
    return cards.map((card) => {
      const titleEl = card.querySelector('.position-title, .job-title, h3, h4');
      const companyEl = card.querySelector('.company-name, .employer-name');
      const locationEl = card.querySelector('.job-location, .location');
      const skillsEls = card.querySelectorAll('.skill-tag, .employer-skill, .badge');
      const descEl = card.querySelector('.job-description, .opportunity-summary, p');
      const linkEl = card.querySelector('a[href*="/job/"], a[href*="/opportunity/"]');

      const title = titleEl ? titleEl.innerText.trim() : '';
      const company = companyEl ? companyEl.innerText.trim() : '';
      const location = locationEl ? locationEl.innerText.trim() : '';
      const skills = Array.from(skillsEls).map(s => s.innerText.trim()).filter(Boolean);
      const jdText = descEl ? descEl.innerText.trim() : '';
      const url = linkEl ? linkEl.href : '';

      return {
        platform: 'instahyre',
        platformJobId: card.getAttribute('data-job-id') || (url ? url.split('/').filter(Boolean).pop() : ''),
        title,
        company,
        location,
        skills,
        jdText: `${title} at ${company}. Skills: ${skills.join(', ')}. Description: ${jdText}`,
        url
      };
    }).filter(j => j.title && j.company);
  });

  return jobCards;
}
