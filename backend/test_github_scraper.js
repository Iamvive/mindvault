import { parseGitHubUrl, scrapeGitHubRepo } from './githubScraper.js';

console.log('Testing GitHub Scraper Module...');

const parsed = parseGitHubUrl('https://github.com/expressjs/express');
if (!parsed || parsed.owner !== 'expressjs' || parsed.repo !== 'express') {
  throw new Error('FAILED: parseGitHubUrl');
}

scrapeGitHubRepo('https://github.com/expressjs/express').then(data => {
  if (!data || data.owner !== 'expressjs' || !data.readme) {
    throw new Error('FAILED: scrapeGitHubRepo did not return readme');
  }
  console.log('✅ GitHub Scraper tests passed successfully!');
}).catch(err => {
  console.error('FAILED scrapeGitHubRepo:', err);
  process.exit(1);
});
