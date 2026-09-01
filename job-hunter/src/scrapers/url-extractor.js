import { connectToChrome, checkCdpAvailable } from '../cdp/chrome-bridge.js';

/**
 * Classifies a job URL to determine the platform / source domain.
 */
export function classifyJobPlatform(url) {
  if (!url || typeof url !== 'string') return 'custom';
  const lower = url.toLowerCase();
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('greenhouse.io')) return 'greenhouse';
  if (lower.includes('lever.co')) return 'lever';
  if (lower.includes('ashbyhq.com')) return 'ashby';
  if (lower.includes('instahyre.com')) return 'instahyre';
  if (lower.includes('naukri.com')) return 'naukri';
  if (lower.includes('cutshort.io')) return 'cutshort';
  if (lower.includes('wellfound.com') || lower.includes('angel.co')) return 'wellfound';
  if (lower.includes('workday.com') || lower.includes('myworkdayjobs.com')) return 'workday';
  return 'custom';
}

/**
 * Strips HTML tags, excess whitespace, and common noise.
 */
export function sanitizeJdText(rawText) {
  if (!rawText) return '';
  let text = rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Collapse multiple spaces and blank lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.join('\n\n');
}

/**
 * Extracts job posting details from a URL using Chrome CDP or HTTP fallback.
 */
export async function extractJobFromUrl(targetUrl, browserInstance = null) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('Valid Job URL is required');
  }

  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const platform = classifyJobPlatform(cleanUrl);
  let browser = browserInstance;

  const isCdp = await checkCdpAvailable();
  if (!browser && isCdp) {
    try {
      browser = await connectToChrome();
    } catch (e) {
      console.warn('Could not connect to Chrome CDP, will use HTTP fallback:', e.message);
    }
  }

  if (browser) {
    const page = await browser.newPage();
    try {
      await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      // Brief wait for SPA hydration
      await page.waitForTimeout(2000);

      // Attempt to click expansion buttons on LinkedIn / general pages
      if (platform === 'linkedin') {
        try {
          await page.evaluate(() => {
            const btns = document.querySelectorAll(
              '.show-more-less-html__button, button[data-tracking-control-name="public_jobs_show-more-html-btn"], .jobs-description__footer-button, .inline-show-more-text__button, [aria-label*="Show more"]'
            );
            btns.forEach(b => b.click());
          });
          await page.waitForTimeout(500);
        } catch (_) {}
      }

      // Execute in-page extraction
      const extracted = await page.evaluate((detectedPlatform) => {
        const getCleanText = (el) => el ? el.innerText.trim() : '';

        let title = '';
        let company = '';
        let location = '';
        let experience = '';
        let salary = '';
        let jdText = '';

        // 1. JSON-LD Check
        try {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          for (const s of scripts) {
            try {
              const data = JSON.parse(s.innerText);
              const jobData = Array.isArray(data) ? data.find(item => item['@type'] === 'JobPosting') :
                (data['@type'] === 'JobPosting' ? data : (data['@graph'] ? data['@graph'].find(item => item['@type'] === 'JobPosting') : null));

              if (jobData) {
                if (!title && jobData.title) title = jobData.title;
                if (!company && jobData.hiringOrganization && jobData.hiringOrganization.name) company = jobData.hiringOrganization.name;
                if (!location && jobData.jobLocation) {
                  if (typeof jobData.jobLocation === 'string') location = jobData.jobLocation;
                  else if (jobData.jobLocation.address) {
                    const addr = jobData.jobLocation.address;
                    location = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(', ');
                  }
                }
                if (!salary && jobData.baseSalary) {
                  if (typeof jobData.baseSalary === 'string') salary = jobData.baseSalary;
                  else if (jobData.baseSalary.value) {
                    const val = jobData.baseSalary.value;
                    salary = `${val.minValue || ''} - ${val.maxValue || val.value || ''} ${jobData.baseSalary.currency || ''}`.trim();
                  }
                }
                if (!jdText && jobData.description) jdText = jobData.description;
              }
            } catch (_) {}
          }
        } catch (_) {}

        // 2. Platform Specific Selectors
        if (detectedPlatform === 'linkedin') {
          title = title || getCleanText(document.querySelector('.top-card-layout__title, .job-details-jobs-unified-top-card__job-title, h1.topcard__title, h1'));
          company = company || getCleanText(document.querySelector('.top-card-layout__first-subline a, .job-details-jobs-unified-top-card__company-name, a.topcard__org-name-link, .topcard__flavor:first-child'));
          location = location || getCleanText(document.querySelector('.top-card-layout__first-subline .topcard__flavor--bullet, .job-details-jobs-unified-top-card__bullet, .topcard__flavor-row .topcard__flavor--bullet'));
          jdText = jdText || getCleanText(document.querySelector('.show-more-less-html__markup, #job-details, .jobs-description__content, .description__text'));
        } else if (detectedPlatform === 'greenhouse') {
          title = title || getCleanText(document.querySelector('.app-title, #header h1, h1'));
          company = company || getCleanText(document.querySelector('.company-name, #header .company-name'));
          location = location || getCleanText(document.querySelector('.location, #header .location'));
          jdText = jdText || getCleanText(document.querySelector('#content, #app-body, .content-intro'));
        } else if (detectedPlatform === 'lever') {
          title = title || getCleanText(document.querySelector('.posting-headline h2, h2, h1'));
          company = company || getCleanText(document.querySelector('.main-header-logo img')) || document.title.split('-')[0]?.trim();
          location = location || getCleanText(document.querySelector('.posting-categories .location, .sort-by-time.posting-category'));
          jdText = jdText || getCleanText(document.querySelector('.section-wrapper, .content'));
        } else if (detectedPlatform === 'ashby') {
          title = title || getCleanText(document.querySelector('h1, [data-qa="job-title"]'));
          company = company || document.title.split('at')[1]?.trim() || '';
          location = location || getCleanText(document.querySelector('[data-qa="job-location"], .location'));
          jdText = jdText || getCleanText(document.querySelector('[data-qa="job-description"], ._jobDescription_'));
        } else if (detectedPlatform === 'instahyre') {
          title = title || getCleanText(document.querySelector('.job-details h1, h1'));
          company = company || getCleanText(document.querySelector('.company-name, .job-details h2'));
          location = location || getCleanText(document.querySelector('.locations span, .job-locations'));
          experience = experience || getCleanText(document.querySelector('.experience, .work-experience'));
          jdText = jdText || getCleanText(document.querySelector('.job-description, .description-content'));
        } else if (detectedPlatform === 'naukri') {
          title = title || getCleanText(document.querySelector('.styles_jcp__header h1, h1.styles_jd-header-title__rZwM1, h1'));
          company = company || getCleanText(document.querySelector('.styles_jcp__header .styles_jd-header-comp-name__MvqAI, a.comp-name, .comp-info-detail'));
          location = location || getCleanText(document.querySelector('.styles_jcp__header .styles_jcp__loc, .loc-container, .location'));
          experience = experience || getCleanText(document.querySelector('.styles_jcp__header .styles_jcp__exp, .exp-container'));
          salary = salary || getCleanText(document.querySelector('.styles_jcp__header .styles_jcp__sal, .salary-container'));
          jdText = jdText || getCleanText(document.querySelector('.styles_job-desc-container, .job-desc-section'));
        }

        // 3. Universal Fallback if still empty
        if (!title) {
          const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
          title = ogTitle || document.title.split(/[-|–•]/)[0]?.trim() || '';
        }
        if (!company) {
          const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
          company = ogSite || '';
          if (!company && document.title.includes(' at ')) {
            company = document.title.split(' at ')[1]?.split(/[-|–•]/)[0]?.trim() || '';
          }
        }
        if (!jdText) {
          const article = document.querySelector('article, main, [role="main"], .job-description, #job-description, .description');
          jdText = article ? getCleanText(article) : getCleanText(document.body);
        }

        return {
          title,
          company,
          location,
          experience,
          salary,
          jdText
        };
      }, platform);

      return {
        url: cleanUrl,
        platform,
        title: extracted.title || 'Software Engineer',
        company: extracted.company || 'Company',
        location: extracted.location || 'Remote',
        experience: extracted.experience || '',
        salary: extracted.salary || '',
        jdText: sanitizeJdText(extracted.jdText)
      };
    } finally {
      await page.close();
    }
  }

  // Fallback: Direct HTTP Fetch
  return await extractJobViaHttp(cleanUrl, platform);
}

/**
 * Fallback lightweight HTTP extractor when Chrome CDP is not available.
 */
async function extractJobViaHttp(url, platform) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (HTTP ${response.status})`);
  }

  const html = await response.text();

  let title = '';
  let company = '';
  let location = '';
  let jdText = '';

  // Extract JSON-LD
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  for (const match of jsonLdMatches) {
    try {
      const jsonContent = match.replace(/<\/?script[^>]*>/gi, '').trim();
      const parsed = JSON.parse(jsonContent);
      const jobData = Array.isArray(parsed) ? parsed.find(i => i['@type'] === 'JobPosting') :
        (parsed['@type'] === 'JobPosting' ? parsed : null);

      if (jobData) {
        if (jobData.title) title = jobData.title;
        if (jobData.hiringOrganization && jobData.hiringOrganization.name) company = jobData.hiringOrganization.name;
        if (jobData.description) jdText = jobData.description;
        if (jobData.jobLocation) {
          if (typeof jobData.jobLocation === 'string') location = jobData.jobLocation;
          else if (jobData.jobLocation.address?.addressLocality) location = jobData.jobLocation.address.addressLocality;
        }
      }
    } catch (_) {}
  }

  // OpenGraph fallbacks
  if (!title) {
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i);
    if (ogTitle) title = ogTitle[1].split(/[-|–•]/)[0]?.trim();
  }

  if (!company) {
    const ogSite = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i);
    if (ogSite) company = ogSite[1].trim();
  }

  if (!jdText) {
    jdText = sanitizeJdText(html);
  } else {
    jdText = sanitizeJdText(jdText);
  }

  return {
    url,
    platform,
    title: title || 'Software Engineer',
    company: company || 'Company',
    location: location || 'Remote',
    experience: '',
    salary: '',
    jdText
  };
}
