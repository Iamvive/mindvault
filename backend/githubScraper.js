/**
 * Parses GitHub URL to extract owner and repo name
 */
export function parseGitHubUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('github.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch (e) {
    return null;
  }
}

/**
 * Scrapes metadata, README, and manifest files for a GitHub repository
 */
export async function scrapeGitHubRepo(url) {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo } = parsed;
  let repoData = {};
  let readme = '';
  let manifest = '';

  // 1. Fetch Repository Info from GitHub REST API
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'MindVault-Bot' }
    });
    if (apiRes.ok) {
      repoData = await apiRes.json();
    }
  } catch (err) {
    console.warn(`GitHub API request failed for ${owner}/${repo}:`, err.message);
  }

  // 2. Fetch README.md from raw content
  const branches = [repoData.default_branch || 'main', 'master'];
  for (const branch of branches) {
    try {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
      if (readmeRes.ok) {
        readme = await readmeRes.text();
        break;
      }
    } catch (e) {}
  }

  // Truncate README to 4,000 characters for token efficiency
  if (readme.length > 4000) {
    readme = readme.slice(0, 4000) + '\n...(truncated for analysis)...';
  }

  // 3. Attempt to fetch package manifest (package.json or requirements.txt)
  for (const branch of branches) {
    try {
      const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`);
      if (pkgRes.ok) {
        manifest = await pkgRes.text();
        break;
      }
    } catch (e) {}
  }

  return {
    owner,
    repo,
    title: `${owner}/${repo}`,
    description: repoData.description || '',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    primary_language: repoData.language || 'JavaScript',
    readme: readme || repoData.description || 'No README content found.',
    manifest: manifest ? manifest.slice(0, 1000) : ''
  };
}
