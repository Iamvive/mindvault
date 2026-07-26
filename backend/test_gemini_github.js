import { enrichGitHubRepoMetadata } from './gemini.js';

console.log('Testing Gemini GitHub Deep Enrichment...');

const scrapedData = {
  owner: 'expressjs',
  repo: 'express',
  title: 'expressjs/express',
  description: 'Fast, unopinionated, minimalist web framework for node.',
  stars: 62000,
  forks: 14000,
  primary_language: 'JavaScript',
  readme: 'Express is a minimal and flexible Node.js web application framework...',
  manifest: '{"dependencies": {"express": "^4.18.2"}}'
};

enrichGitHubRepoMetadata('https://github.com/expressjs/express', scrapedData, 'Want to check for MindVault server').then(result => {
  if (!result || !Array.isArray(result.use_cases) || !result.quickstart_playbook) {
    throw new Error('FAILED: enrichGitHubRepoMetadata invalid structure');
  }
  console.log('✅ Gemini GitHub Enrichment test passed successfully!');
}).catch(err => {
  console.error('FAILED Gemini test:', err);
  process.exit(1);
});
