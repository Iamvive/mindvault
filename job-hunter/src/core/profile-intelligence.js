export function analyzeProfileIntelligence(profile) {
  const experiences = profile.masterExperience || profile.experience || [];
  const skills = profile.skills || {};
  const projects = profile.projects || [];
  const summary = profile.summary || '';
  const title = profile.personal?.title || '';

  // 1. Identify Primary Tech Stack from actual experience & projects
  const techFrequency = {};
  const allBullets = [];

  for (const exp of experiences) {
    for (const tech of exp.techStack || []) {
      techFrequency[tech] = (techFrequency[tech] || 0) + 3;
    }
    for (const b of exp.bullets || []) {
      allBullets.push(b);
      // scan bullet text for tech mentions
      const matches = b.match(/\b(Go|TypeScript|JavaScript|Node\.js|React|PostgreSQL|Kafka|Docker|Kubernetes|AWS|Redis|GraphQL|Python|MongoDB)\b/gi) || [];
      for (const m of matches) {
        const canonical = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
        techFrequency[canonical] = (techFrequency[canonical] || 0) + 1;
      }
    }
  }

  for (const proj of projects) {
    for (const tech of proj.techStack || []) {
      techFrequency[tech] = (techFrequency[tech] || 0) + 2;
    }
  }

  const topTech = Object.entries(techFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 8);

  // 2. Extract Exact Quantified Metrics
  const extractedMetrics = [];
  for (const bullet of allBullets) {
    const metricMatch = bullet.match(/(?:\d+[%kKmM\$]|\b\d{2,}\b|\$\d+)/g);
    if (metricMatch) {
      extractedMetrics.push({
        bullet,
        metrics: metricMatch
      });
    }
  }

  // 3. Determine Engineering Archetype
  let archetype = 'Full-Stack Software Engineer';
  const techStr = topTech.join(' ').toLowerCase();
  if (techStr.includes('go') || techStr.includes('kafka') || techStr.includes('distributed') || techStr.includes('kubernetes')) {
    archetype = 'Lead / Staff Backend & Distributed Systems Engineer';
  } else if (techStr.includes('react') && techStr.includes('node')) {
    archetype = 'Senior Full-Stack Cloud Engineer';
  }

  // 4. Calculate Total Experience Years
  let estimatedYears = 5;
  if (experiences.length >= 3) estimatedYears = 6;
  if (experiences.length >= 5) estimatedYears = 8;

  return {
    candidateName: profile.personal?.name || 'Engineer',
    archetype,
    estimatedYears,
    topTechStack: topTech.length > 0 ? topTech : ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'AWS'],
    quantifiedMetricsCount: extractedMetrics.length,
    highlightedAchievements: extractedMetrics.slice(0, 4).map(m => m.bullet),
    companiesList: experiences.map(e => e.company).filter(Boolean),
    projectNames: projects.map(p => p.name).filter(Boolean)
  };
}
