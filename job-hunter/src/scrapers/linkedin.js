export async function discoverLinkedInJobs(page, options = {}) {
  const keywords = encodeURIComponent(options.keywords || 'Software Engineer');
  const location = encodeURIComponent(options.location || 'India');
  // f_AL=true filters for Easy Apply only
  const targetUrl = options.url || `https://www.linkedin.com/jobs/search/?f_AL=true&keywords=${keywords}&location=${location}`;

  if (!page.url().includes('linkedin.com/jobs')) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  await page.waitForTimeout(2500);

  const jobCards = await page.$$eval('.job-card-container, .jobs-search-results__list-item', (cards) => {
    return cards.map((card) => {
      const titleEl = card.querySelector('.job-card-list__title, .artdeco-entity-lockup__title');
      const companyEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle');
      const locationEl = card.querySelector('.job-card-container__metadata-item');
      const linkEl = card.querySelector('a.job-card-list__title, a.job-card-container__link');

      const title = titleEl ? titleEl.innerText.trim() : '';
      const company = companyEl ? companyEl.innerText.trim() : '';
      const location = locationEl ? locationEl.innerText.trim() : '';
      const url = linkEl ? linkEl.href.split('?')[0] : '';
      const jobId = card.getAttribute('data-job-id') || (url ? url.split('/').filter(Boolean).pop() : '');

      return {
        platform: 'linkedin',
        platformJobId: jobId,
        title,
        company,
        location,
        url,
        jdText: `${title} at ${company} in ${location}. Easy Apply opportunity.`
      };
    }).filter(j => j.title && j.company);
  });

  return jobCards;
}
