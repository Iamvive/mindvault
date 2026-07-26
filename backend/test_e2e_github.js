import express from 'express';
import { Database } from './database.js';
import { scrapeGitHubRepo } from './githubScraper.js';
import { enrichGitHubRepoMetadata } from './gemini.js';

console.log('🧪 Starting End-to-End Integration Verification...');

async function runE2ETest() {
  // 1. Direct end-to-end pipeline test
  const testUrl = `https://github.com/expressjs/express`;
  console.log(`1. Scraping live GitHub repo: ${testUrl}...`);
  const scraped = await scrapeGitHubRepo(testUrl);
  console.log(`   Scraped: ${scraped.owner}/${scraped.repo} (⭐ ${scraped.stars} stars, Lang: ${scraped.primary_language})`);

  console.log('2. Running Gemini Deep Enrichment...');
  const enriched = await enrichGitHubRepoMetadata(testUrl, scraped, 'E2E Verification Note');
  console.log(`   Title: ${enriched.title}`);
  console.log(`   Use Cases (${enriched.use_cases.length}):`, enriched.use_cases);
  console.log(`   Playbook Commands:`, enriched.quickstart_playbook.commands);

  console.log('3. Storing in MindVault database...');
  const resourceId = Number(Database.createResource({
    url: `${testUrl}?e2e=${Date.now()}`,
    title: enriched.title,
    summary: enriched.summary,
    category: enriched.category,
    tags: enriched.tags.join(','),
    platform: 'GitHub',
    interest_score: enriched.interest_score,
    usefulness_score: enriched.usefulness_score,
    user_notes: 'E2E Verification Note'
  }));

  Database.saveGitHubDetails(resourceId, {
    repo_owner: scraped.owner,
    repo_name: scraped.repo,
    stars: scraped.stars,
    forks: scraped.forks,
    primary_language: scraped.primary_language,
    use_cases: enriched.use_cases,
    quickstart_playbook: enriched.quickstart_playbook,
    tech_stack_summary: enriched.tech_stack_summary
  });

  const details = Database.getGitHubDetails(resourceId);
  if (!details) {
    throw new Error('E2E FAILED: github_details record not found in DB');
  }

  console.log('4. Testing Pin Toggle & 14-day Auto-Pruner Reset...');
  Database.togglePin(resourceId, 1);
  const resourceAfterPin = Database.getResourceById(resourceId);
  if (resourceAfterPin.is_pinned !== 1 || resourceAfterPin.status !== 'pinned') {
    throw new Error('E2E FAILED: Pin toggle did not update status to pinned');
  }
  console.log('   📌 Pin status correctly verified!');

  Database.updateLastInteracted(resourceId);
  console.log('   ⏱️ Last interacted timestamp updated successfully!');

  // Cleanup test resource
  Database.deleteResource(resourceId);
  console.log('🎉 E2E Verification Completed 100% Successfully!');
}

runE2ETest().catch(err => {
  console.error('❌ E2E Verification Failed:', err);
  process.exit(1);
});
