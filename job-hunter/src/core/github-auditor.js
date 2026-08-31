export async function auditGitHubProfile(usernameOrUrl) {
  if (!usernameOrUrl) {
    throw new Error('Please provide a GitHub username or URL');
  }

  const cleanUser = usernameOrUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '').split('/')[0];
  if (!cleanUser) {
    throw new Error('Invalid GitHub username or URL');
  }

  let userProfile = null;
  let repos = [];

  try {
    const userRes = await fetch(`https://api.github.com/users/${cleanUser}`, {
      headers: { 'User-Agent': 'MindHunt-Profile-Auditor' }
    });
    if (userRes.ok) {
      userProfile = await userRes.json();
    } else {
      throw new Error(`GitHub user "${cleanUser}" not found (HTTP ${userRes.status})`);
    }

    const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=10`, {
      headers: { 'User-Agent': 'MindHunt-Profile-Auditor' }
    });
    if (reposRes.ok) {
      repos = await reposRes.json();
    }
  } catch (err) {
    throw new Error(`Failed to fetch GitHub profile: ${err.message}`);
  }

  // 1. Scoring Factors
  let score = 40; // Base score
  const strengths = [];
  const improvements = [];

  // Bio & Profile Polish
  if (userProfile.bio && userProfile.bio.length > 20) {
    score += 15;
    strengths.push('Bio has clear focus and summary.');
  } else {
    improvements.push('Add a focused 1-2 sentence Bio highlighting your primary tech stack and seniority level.');
  }

  if (userProfile.blog || userProfile.twitter_username) {
    score += 5;
    strengths.push('Profile links to portfolio or social contact.');
  } else {
    improvements.push('Add your personal portfolio or LinkedIn URL in your GitHub profile website field.');
  }

  // Repositories Polish
  if (repos.length >= 3) {
    score += 10;
    strengths.push(`Has ${repos.length}+ active public repositories.`);
  } else {
    improvements.push('Publish at least 3 high-quality public repositories demonstrating core architectural patterns.');
  }

  // Repos with descriptions and topics
  const reposWithDesc = repos.filter(r => r.description && r.description.length > 10);
  if (reposWithDesc.length >= 3) {
    score += 15;
    strengths.push('Top repositories have clear descriptions.');
  } else {
    improvements.push('Add clear, keyword-rich repository descriptions to all your pinned and top repositories.');
  }

  // Repos with homepage / live demos
  const reposWithDemo = repos.filter(r => r.homepage && r.homepage.startsWith('http'));
  if (reposWithDemo.length >= 1) {
    score += 15;
    strengths.push('Repositories include live demo / deployment links.');
  } else {
    improvements.push('Add live demo URLs or architectural diagrams to your top 2 showcase projects.');
  }

  score = Math.min(98, Math.max(45, score));

  // Generate Suggested Profile README Template
  const recommendedReadme = `
# Hi there, I'm ${userProfile.name || cleanUser} 👋

**${userProfile.bio || 'Full-Stack / Distributed Systems Engineer'}**

📍 ${userProfile.location || 'Remote'} | 🌐 [Portfolio](${userProfile.blog || 'https://yourwebsite.dev'}) | 💼 [LinkedIn](https://linkedin.com)

---

### 🚀 Featured Architectural Projects
${repos.slice(0, 3).map(r => `- **[${r.name}](${r.html_url})**: ${r.description || 'Modern high-performance project'} ${r.homepage ? `([Live Demo](${r.homepage}))` : ''}`).join('\n')}

---

### 🛠️ Core Tech Stack
- **Languages:** TypeScript, JavaScript, Go, Python, SQL
- **Frameworks & Libs:** Node.js, React, Express, Next.js
- **Cloud & Databases:** AWS, Docker, PostgreSQL, Redis, Kafka
`.trim();

  return {
    platform: 'github',
    username: cleanUser,
    avatarUrl: userProfile.avatar_url,
    name: userProfile.name || cleanUser,
    publicRepos: userProfile.public_repos,
    followers: userProfile.followers,
    score,
    grade: score >= 85 ? 'A+' : (score >= 75 ? 'A' : (score >= 60 ? 'B' : 'C')),
    strengths,
    improvements,
    recommendedReadme
  };
}
