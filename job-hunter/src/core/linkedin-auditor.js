import { connectToChrome, checkCdpAvailable } from '../cdp/chrome-bridge.js';

export async function fetchLinkedInProfileData(profileUrl, browserInstance = null) {
  if (!profileUrl) throw new Error('LinkedIn Profile URL is required');

  let cleanUrl = profileUrl.trim();
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://www.linkedin.com/in/${cleanUrl.replace(/^\/+/, '')}`;
  }

  let browser = browserInstance;
  let ownsBrowser = false;

  const isCdp = await checkCdpAvailable();
  if (!browser && isCdp) {
    browser = await connectToChrome();
  }

  if (!browser) {
    // If Chrome CDP is not connected, extract username as fallback info
    const username = cleanUrl.split('/in/')[1]?.replace(/\/+$/, '') || 'User';
    return {
      profileUrl: cleanUrl,
      headline: `${username} - Software Engineer`,
      about: '',
      extractedVia: 'fallback'
    };
  }

  const page = await browser.newPage();
  try {
    await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const extracted = await page.evaluate(() => {
      // 1. Headline
      const headlineEl = document.querySelector('.text-body-medium.break-words, h2.top-card-layout__headline, .pv-top-card--list-bullet');
      const headline = headlineEl ? headlineEl.innerText.trim() : '';

      // 2. Name
      const nameEl = document.querySelector('h1.text-heading-xlarge, h1.top-card-layout__title');
      const name = nameEl ? nameEl.innerText.trim() : '';

      // 3. About Section
      // LinkedIn About is often in a section with id 'about' or data-generated-suggestion-target
      let about = '';
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        const parentCard = aboutSection.closest('section');
        if (parentCard) {
          const textEl = parentCard.querySelector('.display-flex .visually-hidden, .inline-show-more-text');
          about = textEl ? textEl.innerText.trim() : parentCard.innerText.replace(/About/i, '').trim();
        }
      }

      // Fallback About selector
      if (!about) {
        const altAbout = document.querySelector('.pv-about-section, .core-section-container[data-section="summary"]');
        if (altAbout) about = altAbout.innerText.replace(/About/i, '').trim();
      }

      return {
        name,
        headline,
        about
      };
    });

    return {
      profileUrl: cleanUrl,
      name: extracted.name || '',
      headline: extracted.headline || '',
      about: extracted.about || '',
      extractedVia: 'cdp'
    };
  } catch (err) {
    console.warn(`CDP LinkedIn extraction notice: ${err.message}`);
    return {
      profileUrl: cleanUrl,
      headline: '',
      about: '',
      extractedVia: 'error_fallback'
    };
  } finally {
    await page.close();
    if (ownsBrowser) await browser.close();
  }
}

export function auditLinkedInProfile(profileInput = {}) {
  const { headline = '', about = '', experience = '', profileUrl = '' } = profileInput;

  let score = 45; // Base score
  const strengths = [];
  const improvements = [];

  // 1. Headline Evaluation
  const hasRole = /engineer|architect|developer|lead|staff|principal|manager|cto/i.test(headline);
  const hasKeywords = /go|typescript|react|python|node|distributed|aws|cloud|kafka|sql|microservices|java|system design/i.test(headline);
  const hasDivider = /[|•\-\/]/.test(headline);

  if (hasRole && hasKeywords && hasDivider) {
    score += 20;
    strengths.push('Headline is recruiter-optimized with clear role titles, skill keywords, and separator structure.');
  } else if (hasRole) {
    score += 10;
    improvements.push({
      id: 'fix-headline',
      title: 'Weak Headline',
      description: 'Your headline is too generic. Recruiters search by Boolean skills.',
      actionLabel: 'Apply Magnetic Headline',
      replacementType: 'headline'
    });
  } else {
    improvements.push({
      id: 'fix-headline',
      title: 'Missing Target Role & Keywords in Headline',
      description: 'Add your primary role + top 3 skills + value proposition.',
      actionLabel: 'Apply Magnetic Headline',
      replacementType: 'headline'
    });
  }

  // 2. About / Summary Evaluation
  if (about && about.length > 250) {
    score += 18;
    strengths.push('About section has strong narrative depth and background detail.');
  } else if (about && about.length > 50) {
    score += 8;
    improvements.push({
      id: 'fix-about-length',
      title: 'Short About Section',
      description: 'Expand your About section into a 3-part narrative: Hook, Core Tech Stack, and Business Impact.',
      actionLabel: 'Apply Structured About Story',
      replacementType: 'about'
    });
  } else {
    improvements.push({
      id: 'fix-about-empty',
      title: 'Missing / Minimal About Section',
      description: 'A strong About section boosts recruiter inmail response rates by 3x.',
      actionLabel: 'Generate High-Converting About Story',
      replacementType: 'about'
    });
  }

  // 3. Metric & Quantifiable Impact Evaluation
  const hasMetrics = /\d+[%kKmM\$]|saved|reduced|scaled|boosted|optimized/i.test(about + ' ' + experience);
  if (hasMetrics) {
    score += 12;
    strengths.push('Demonstrates quantifiable metrics and measurable business results.');
  } else {
    improvements.push({
      id: 'fix-metrics',
      title: 'Missing Quantifiable Metrics',
      description: 'Add specific percentages, request volumes, or dollar savings to your accomplishments.',
      actionLabel: 'Inject Impact Metrics',
      replacementType: 'metrics'
    });
  }

  // 4. Recruiter Boolean Keywords
  const techMatches = (about + ' ' + headline + ' ' + experience).match(/(?:Go|TypeScript|React|Node|AWS|PostgreSQL|Docker|Kubernetes|Kafka|Python|GraphQL|Microservices|Distributed Systems)/gi) || [];
  if (techMatches.length >= 4) {
    score += 10;
    strengths.push('High density of indexed technical keywords for recruiter search filters.');
  } else {
    improvements.push({
      id: 'fix-keywords',
      title: 'Low Keyword Density',
      description: 'Add core frameworks, cloud platforms, and architecture terms to match recruiter filters.',
      actionLabel: 'Optimize Keyword Density',
      replacementType: 'keywords'
    });
  }

  score = Math.min(98, Math.max(40, score));

  const generatedHeadlines = [
    'Senior Full-Stack Engineer | React, TypeScript, Node.js, AWS | Scaled Distributed Systems to 1M+ Users',
    'Staff Backend Architect | Go, Kafka, PostgreSQL, AWS | High-Throughput & Event-Driven Systems',
    'Lead Software Engineer | Microservices, Cloud Architecture & Scalable Web Applications'
  ];

  const generatedAbout = `
🚀 **About Me:**
Results-driven Senior Software Engineer with 6+ years specializing in distributed systems, event-driven architectures, and high-performance web applications. Passionate about solving complex scaling bottlenecks and writing resilient, test-driven code.

🛠️ **Core Technical Expertise:**
• **Languages:** TypeScript, JavaScript, Go, Python, SQL
• **Frameworks & Libs:** Node.js, Express, React, Next.js, GraphQL
• **Cloud & Infrastructure:** AWS, Docker, Kubernetes, PostgreSQL, Redis, Kafka

📈 **Key Career Impact:**
• Architected payment microservices processing 45k+ req/sec with 99.99% reliability.
• Reduced database query latency by 54% through optimized PostgreSQL query execution.
• Mentored 8+ engineers and championed automated CI/CD and rigorous code review standards.

📫 Open to Staff & Lead Software Engineering opportunities (Remote / Hybrid).
`.trim();

  return {
    platform: 'linkedin',
    profileUrl: profileUrl || '',
    headline: headline || '',
    about: about || '',
    score,
    grade: score >= 85 ? 'A+' : (score >= 75 ? 'A' : (score >= 60 ? 'B' : 'C')),
    strengths,
    improvements,
    generatedHeadlines,
    generatedAbout
  };
}
