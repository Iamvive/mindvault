export function buildLinkedInPrompt(profileData = {}) {
  const { url = '', headline = '', about = '', experience = [] } = profileData;

  return `
You are an expert Technical Recruiter and LinkedIn SEO Strategist for Top Tier Tech Companies (FAANG, Unicorn Startups, High-Growth Scale-ups).

Please review my LinkedIn Profile and provide high-converting, recruiter-optimized improvements.

---
MY CURRENT LINKEDIN PROFILE:
- Profile Link: ${url || 'https://linkedin.com'}
- Current Headline: ${headline || 'Software Engineer'}
- Current About Section:
${about || 'Experienced software engineer specializing in scalable systems.'}

---
TASK:
1. Recruiter Boolean SEO & Keyword Audit:
   - Identify missing keywords for recruiter searches (e.g. Distributed Systems, Kafka, AWS, Go, React, Microservices).
2. Generate 3 Magnetic Headlines:
   - Must use role title + core skills + quantifiable impact tag with clean visual separators.
3. Rewrite the About Section:
   - Hook/Philosophy (1 paragraph)
   - Core Technical Competencies (Categorized bullet list)
   - Quantified Career Impact Highlights (STAR format with metrics: $X, Y% latency, Z users)
   - Call to Action (Open to roles / Contact info)

Please format your response clearly with markdown and copy-paste ready blocks.
`.trim();
}

export function buildGitHubPrompt(githubData = {}) {
  const { username = '', bio = '', repos = [] } = githubData;

  return `
You are a Principal Software Architect and Open-Source Showcase Specialist.

Please audit my GitHub profile and create an aesthetic, high-impact Profile README and project showcase strategy.

---
MY GITHUB PROFILE:
- Username: ${username || 'developer'}
- Bio: ${bio || 'Full-Stack / Distributed Systems Developer'}
- Top Repositories:
${repos.map(r => `  • ${r.name}: ${r.description || 'No description'} (${r.language || 'Code'})`).join('\n') || '  • Key architectural projects'}

---
TASK:
1. Pinned Repository Strategy:
   - Recommend how to present top 3 architectural projects (problem statement, architecture diagram, tech stack, benchmarks, live demo link).
2. Generate Complete Profile README.md:
   - Clean, modern layout with tech stack badges, highlighted metrics, and clear navigation.
3. Actionable Improvements:
   - Specific suggestions for improving commit activity, documentation, and repository issue templates.

Please provide the ready-to-use README markdown in a code block.
`.trim();
}

export function buildResumePrompt(resumeData = {}) {
  const { summary = '', experience = [], skills = {}, rawText = '' } = resumeData;

  return `
You are a Senior Executive Resume Writer and ATS Optimization Specialist.

Please perform a rigorous ATS audit and high-impact rewrite of my technical resume.

---
MY CURRENT RESUME DATA:
${rawText ? rawText : `
Summary:
${summary}

Experience:
${Array.isArray(experience) ? experience.map(e => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate}):\n${(e.bullets || []).map(b => `  • ${b}`).join('\n')}`).join('\n\n') : ''}

Skills:
${JSON.stringify(skills, null, 2)}
`}

---
TASK:
1. ATS Score & Structural Audit:
   - Check for action verb strength, single-column parsing, and keyword density.
2. Bullet Point Upgrades (STAR Method):
   - Rewrite weak or passive bullet points into high-impact achievement statements with quantified metrics ($ saved, % latency reduction, throughput scale).
3. Optimized Executive Summary:
   - A 2-3 line punchy summary targeting Lead / Senior Engineering positions.
4. Categorized Skills Matrix:
   - Formatted for maximum keyword match by automated parsing systems.

Please provide the complete improved resume content in clean, copy-paste ready format.
`.trim();
}
