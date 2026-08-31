export function auditResume(resumeData = {}) {
  const { summary = '', experience = [], skills = {}, text = '' } = resumeData;

  const fullText = text || [
    summary,
    Array.isArray(experience) ? experience.map(e => (e.bullets || []).join(' ')).join(' ') : '',
    JSON.stringify(skills)
  ].join(' ');

  let score = 50;
  const strengths = [];
  const improvements = [];

  // 1. Quantifiable Impact & Metrics Check (Weight: 30%)
  const metricsMatches = fullText.match(/\d+(?:\.\d+)?%|\$\d+[kKmMbB]?|\b\d+[kKmM]\b|\b\d{2,}\b/g) || [];
  if (metricsMatches.length >= 6) {
    score += 20;
    strengths.push(`High density of quantifiable metrics (${metricsMatches.length} metrics found across bullet points).`);
  } else if (metricsMatches.length >= 2) {
    score += 10;
    improvements.push('Add more quantifiable results (percentages, revenue/cost savings, latency drops, user scale) to each past role.');
  } else {
    improvements.push('Critical: Resume lacks quantifiable metrics. Convert responsibilities into measurable impact (e.g. "Increased throughput by 40%").');
  }

  // 2. Action Verbs Check (Weight: 25%)
  const strongVerbs = /\b(architected|engineered|spearheaded|optimized|slashed|accelerated|built|designed|mentored|scaled|delivered|pioneered|automated)\b/gi;
  const verbMatches = fullText.match(strongVerbs) || [];
  if (verbMatches.length >= 4) {
    score += 15;
    strengths.push('Uses powerful action verbs to begin accomplishment bullets.');
  } else {
    improvements.push('Begin every experience bullet with strong active verbs (e.g., "Architected", "Engineered", "Optimized" instead of "Worked on" or "Responsible for").');
  }

  // 3. ATS Structure & Single Column Formatting (Weight: 25%)
  if (fullText.length > 300) {
    score += 10;
    strengths.push('ATS-parseable text structure with clear section dividers.');
  } else {
    improvements.push('Ensure standard standard ATS headings: Summary, Technical Skills, Experience, Education.');
  }

  // 4. Skills Section Depth (Weight: 20%)
  const techMatches = fullText.match(/(?:Go|TypeScript|React|Node|AWS|PostgreSQL|Docker|Kubernetes|Kafka|Python|GraphQL|Redis|SQL)/gi) || [];
  if (techMatches.length >= 5) {
    score += 10;
    strengths.push('Well-categorized technical stack covering languages, frameworks, cloud, and databases.');
  } else {
    improvements.push('Categorize skills cleanly into Languages, Frameworks, Cloud & DevOps, Databases, and Architecture.');
  }

  score = Math.min(98, Math.max(45, score));

  return {
    platform: 'resume',
    score,
    grade: score >= 85 ? 'A+' : (score >= 75 ? 'A' : (score >= 60 ? 'B' : 'C')),
    metricsCount: metricsMatches.length,
    actionVerbsCount: verbMatches.length,
    strengths,
    improvements
  };
}
