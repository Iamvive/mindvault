export function auditLinkedInProfile(profileInput = {}) {
  const { headline = '', about = '', experience = '', profileUrl = '' } = profileInput;

  let score = 50; // Base score
  const strengths = [];
  const improvements = [];

  // 1. Headline Evaluation (Weight: 25%)
  const hasRole = /engineer|architect|developer|lead|staff|principal|manager|cto/i.test(headline);
  const hasKeywords = /go|typescript|react|python|node|distributed|aws|cloud|kafka|sql|microservices|java/i.test(headline);
  const hasDivider = /[|•\-\/]/.test(headline);

  if (hasRole && hasKeywords && hasDivider) {
    score += 15;
    strengths.push('Headline is recruiter-optimized with role titles, skill keywords, and clean visual separators.');
  } else if (hasRole) {
    score += 8;
    improvements.push('Improve Headline: Replace generic titles (e.g. "Software Engineer at X") with target role + top 3 skills + value proposition (e.g. "Senior Backend Engineer | Go, Kafka, AWS | Scaled Systems to 1M+ DAU").');
  } else {
    improvements.push('Headline is missing target role and technical keywords that recruiters search for.');
  }

  // 2. About / Summary Evaluation (Weight: 35%)
  if (about.length > 250) {
    score += 15;
    strengths.push('About section has thorough detail and narrative depth.');
  } else if (about.length > 50) {
    score += 8;
    improvements.push('Expand your About section into 3 paragraphs: Hook/Background, Core Technical Mastery, and Key Business Impact.');
  } else {
    improvements.push('About section is missing or too brief. Add a strong 3-part career story highlighting quantified results.');
  }

  // Check for quantifiable impact metrics ($ or % or numbers)
  const hasMetrics = /\d+[%kKmM\$]|saved|reduced|scaled|boosted/i.test(about + ' ' + experience);
  if (hasMetrics) {
    score += 12;
    strengths.push('Demonstrates quantifiable impact (metrics, percentages, performance gains).');
  } else {
    improvements.push('Add quantifiable achievements (e.g., "Reduced latency by 45%", "Managed $50k cloud budget", "Scaled from 10k to 500k users").');
  }

  // 3. Technical Keyword Density (Weight: 15%)
  const techMatches = (about + ' ' + headline + ' ' + experience).match(/(?:Go|TypeScript|React|Node|AWS|PostgreSQL|Docker|Kubernetes|Kafka|Python|GraphQL)/gi) || [];
  if (techMatches.length >= 4) {
    score += 8;
    strengths.push('High density of indexed technical keywords for recruiter search filters.');
  } else {
    improvements.push('Add indexed tech keywords across your About and Experience sections to match Boolean recruiter searches.');
  }

  score = Math.min(98, Math.max(45, score));

  // Generate 3 High-Impact Headline Alternatives
  const generatedHeadlines = [
    'Senior Full-Stack Engineer | React, TypeScript, Node.js | Scaled Distributed Systems to 1M+ Users',
    'Staff Backend Architect | Go, Kafka, PostgreSQL, AWS | High-Throughput & Event-Driven Systems',
    'Lead Software Engineer | Cloud-Native Microservices & High-Scale FinTech Architecture'
  ];

  // Generate Structured About Rewrite
  const generatedAbout = `
🚀 **About Me:**
Results-driven Senior Software Engineer with 6+ years specializing in distributed systems, event-driven architectures, and high-performance web applications. Passionate about solving complex scaling bottlenecks and writing resilient, test-driven code.

🛠️ **Core Competencies:**
- **Languages:** TypeScript, JavaScript, Go, Python, SQL
- **Frameworks & Libs:** Node.js, Express, React, Next.js, GraphQL
- **Infrastructure & Data:** AWS, Docker, Kubernetes, PostgreSQL, Redis, Kafka

📈 **Key Impact Highlights:**
• Architected payment microservices processing 45k+ req/sec with 99.99% reliability.
• Reduced database query latency by 54% through optimized execution plans.
• Mentored 8+ engineers and championed automated CI/CD and rigorous code review standards.

📫 Open to Staff & Lead Software Engineering opportunities (Remote / Bengaluru).
`.trim();

  return {
    platform: 'linkedin',
    profileUrl: profileUrl || 'https://linkedin.com',
    score,
    grade: score >= 85 ? 'A+' : (score >= 75 ? 'A' : (score >= 60 ? 'B' : 'C')),
    strengths,
    improvements,
    generatedHeadlines,
    generatedAbout
  };
}
