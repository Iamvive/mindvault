import { analyzeProfileIntelligence } from './profile-intelligence.js';

export function buildLinkedInPrompt(profileData = {}) {
  const intel = analyzeProfileIntelligence(profileData);
  const { url = '', headline = '', about = '' } = profileData;

  return `
You are a Principal Tech Executive Recruiter specialized in placing ${intel.archetype} candidates at Tier-1 companies (Stripe, Uber, Netflix, Coinbase, Razorpay, High-Growth Scale-ups).

Here is the deep architectural profile of the candidate:
- Candidate Name: ${intel.candidateName}
- Career Archetype: ${intel.archetype} (~${intel.estimatedYears}+ Years Experience)
- Proven Core Tech Stack: ${intel.topTechStack.join(', ')}
- Past Companies: ${intel.companiesList.join(', ') || 'High-Growth Tech Startups'}
- Real Proven Quantified Impact Highlights:
${intel.highlightedAchievements.map(a => `  • "${a}"`).join('\n')}

---
CANDIDATE'S CURRENT LINKEDIN SECTION:
- Profile Link: ${url || profileData.personal?.linkedin || 'https://linkedin.com'}
- Current Headline: "${headline || profileData.personal?.title || intel.archetype}"
- Current About Summary:
"${about || profileData.summary || 'Senior engineer with proven experience.'}"

---
TASK:
Analyze this candidate's specific background and generate high-impact, keyword-dense optimizations tailored to their real skills (${intel.topTechStack.slice(0, 4).join(', ')}).

OUTPUT FORMAT:
Provide your response strictly as valid JSON wrapped in \`\`\`json \`\`\` block so our platform can automatically apply the updates to the user's live profile:

\`\`\`json
{
  "updatedTitle": "Senior / Staff Role | Top Skills | High Impact Value Proposition",
  "suggestedHeadlines": [
    "${intel.archetype} | ${intel.topTechStack.slice(0, 3).join(', ')} | Scaled Systems to 1M+ Users",
    "Staff Engineer | ${intel.topTechStack.slice(0, 4).join(', ')} | High-Throughput Distributed Architecture",
    "Lead Technical Architect | Distributed Systems & Event-Driven Microservices"
  ],
  "updatedAboutSection": "Complete narrative-driven About story highlighting real metrics (${intel.highlightedAchievements[0] || 'high performance'}) with clean formatting.",
  "recommendedSkillsToAdd": ["${intel.topTechStack[0]}", "${intel.topTechStack[1]}", "System Design", "Distributed Systems", "Performance Tuning"],
  "recruiterSeoAudit": "2-3 sentences explaining exact keyword strategy for recruiter search algorithms."
}
\`\`\`
`.trim();
}

export function buildGitHubPrompt(githubData = {}) {
  const intel = analyzeProfileIntelligence(githubData);
  const username = githubData.username || githubData.personal?.github?.split('/').pop() || 'developer';

  return `
You are a Principal Staff Architect and Open-Source Technical Brand Strategist.

Analyze this candidate's real engineering background and create an architectural showcase strategy:
- Candidate Name: ${intel.candidateName}
- Technical Archetype: ${intel.archetype}
- Core Languages & Tech: ${intel.topTechStack.join(', ')}
- Featured Project Names: ${intel.projectNames.join(', ') || 'Distributed Queue, Realtime Analytics'}
- Key Benchmark Highlights: ${intel.highlightedAchievements[0] || 'Sub-millisecond latency, fault-tolerant consensus'}

---
GITHUB USERNAME: ${username}

---
TASK:
Generate an aesthetic, production-grade GitHub Profile README.md that proves senior engineering caliber.

OUTPUT FORMAT:
Provide your response strictly as valid JSON wrapped in \`\`\`json \`\`\` block so our platform can update the profile:

\`\`\`json
{
  "recommendedPinnedRepos": [
    {
      "name": "${intel.projectNames[0] || 'Core-Engine'}",
      "headline": "Ultra-low latency distributed system in ${intel.topTechStack[0] || 'Go'}",
      "keyHighlights": ["Sub-millisecond P95 latency", "Raft consensus protocol"]
    }
  ],
  "profileReadmeMarkdown": "# Production-grade markdown README with badges, tech stack icons, architecture highlights, and live demo links.",
  "actionableRepoTips": [
    "Add architecture diagrams to top 2 repo READMEs",
    "Include Dockerfile and 1-line quickstart command"
  ]
}
\`\`\`
`.trim();
}

export function buildResumePrompt(resumeData = {}) {
  const intel = analyzeProfileIntelligence(resumeData);

  return `
You are a Lead ATS Technical Resume Strategist for Senior & Staff Software Engineering roles.

Review and upgrade this candidate's real resume data:
- Candidate: ${intel.candidateName}
- Target Level: ${intel.archetype} (${intel.estimatedYears}+ Years Experience)
- Primary Tech Core: ${intel.topTechStack.join(', ')}
- Real Past Accomplishments:
${intel.highlightedAchievements.map(a => `  • "${a}"`).join('\n')}

---
FULL RESUME CONTENT:
${resumeData.rawText || JSON.stringify(resumeData, null, 2)}

---
TASK:
1. Rewrite any passive or weak experience bullet points into STAR-format (Situation, Task, Action, Metric Result).
2. Upgrade the Executive Summary to position the candidate firmly as a top-tier ${intel.archetype}.
3. Reorganize the Technical Skills Matrix for 95%+ ATS keyword parseability.

OUTPUT FORMAT:
Provide your response strictly as valid JSON wrapped in \`\`\`json \`\`\` block:

\`\`\`json
{
  "updatedSummary": "High-impact summary tailored to candidate's real seniority and core tech stack (${intel.topTechStack.slice(0, 3).join(', ')}).",
  "upgradedExperience": [
    {
      "company": "${intel.companiesList[0] || 'CloudScale Technologies'}",
      "role": "Staff Software Engineer",
      "upgradedBullets": [
        "Architected distributed transaction pipeline handling 45k req/sec with 99.99% uptime.",
        "Optimized PostgreSQL query execution plans, reducing P99 latency by 54%."
      ]
    }
  ],
  "recommendedSkills": {
    "languages": ["${intel.topTechStack.filter(t => ['Go', 'TypeScript', 'JavaScript', 'Python', 'SQL'].includes(t)).join('", "')}"],
    "frameworks": ["Node.js", "Express", "React", "Next.js"],
    "cloudAndDevops": ["AWS", "Docker", "Kubernetes", "CI/CD"],
    "databases": ["PostgreSQL", "Redis", "Kafka"]
  },
  "atsScoreProjection": 94
}
\`\`\`
`.trim();
}

export function buildCoverLetterPrompt(payload = {}) {
  const intel = analyzeProfileIntelligence(payload);
  const targetCompany = payload.targetCompany || 'Target Tech Scale-up / Enterprise';
  const targetRole = payload.targetRole || payload.personal?.title || 'Senior Android Engineer';
  const currentLetter = payload.currentCoverLetter || payload.masterCoverLetter || '';
  const jdText = payload.jdText || '';

  return `
You are a Principal Executive Recruiter and Career Strategist.
Your goal is to write or polish an exceptional, human-sounding Cover Letter for this senior tech candidate.

CANDIDATE BACKGROUND:
- Name: ${intel.candidateName}
- Current Seniority: ${intel.archetype} (${intel.estimatedYears} Years Experience)
- Proven Tech Stack: ${intel.topTechStack.join(', ')}
- Past Key Employers: ${intel.companiesList.join(', ')}
- Real Proven Quantified Accomplishments:
${intel.highlightedAchievements.slice(0, 5).map(m => `  • "${m}"`).join('\n')}

TARGET APPLICATION:
- Target Company: ${targetCompany}
- Target Role: ${targetRole}
${jdText ? `- Job Description Snippet:\n"""\n${jdText.slice(0, 1000)}\n"""` : ''}
${currentLetter ? `- Candidate's Current Draft:\n"""\n${currentLetter}\n"""` : ''}

GUIDELINES:
1. Tone must sound authentic, confident, and human — avoid generic AI clichés like "I was thrilled to see", "I am the ideal candidate", or "testament to my skills".
2. Hook the reader in paragraph 1 with deep alignment with the company's engineering mission.
3. In paragraph 2 and 3, explicitly weave in 2-3 of the candidate's real metrics.
4. Keep length to 3-4 concise, impactful paragraphs.

OUTPUT FORMAT:
Provide your response strictly as valid JSON wrapped in \`\`\`json \`\`\` block:

\`\`\`json
{
  "improvedCoverLetter": "Dear Hiring Team,\\n\\n[Paragraph 1: Compelling hook and why this company]\\n\\n[Paragraph 2: Deep technical accomplishments with real metrics]\\n\\n[Paragraph 3: Architecture leadership, team mentorship, and strategic value]\\n\\n[Paragraph 4: Call to action and closing]\\n\\nSincerely,\\n${intel.candidateName}",
  "keyStrengthsHighlighted": ["${intel.topTechStack.slice(0, 3).join('", "')}"],
  "recruiterImpactScore": 95
}
\`\`\`
`.trim();
}
