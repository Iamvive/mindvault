import { Database } from './database.js';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Testing GitHub Database Extension...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'mindvault.db');
const db = new DatabaseSync(dbPath);

// Create test resource via Database.createResource
const testUrl = `https://github.com/test/repo_${Date.now()}`;
const resourceId = Number(Database.createResource({
  url: testUrl,
  title: 'Test Repo',
  platform: 'GitHub'
}));

// Test saveGitHubDetails
Database.saveGitHubDetails(resourceId, {
  repo_owner: 'test',
  repo_name: 'repo',
  stars: 120,
  forks: 15,
  primary_language: 'JavaScript',
  use_cases: JSON.stringify(['Use case 1', 'Use case 2']),
  quickstart_playbook: JSON.stringify({ prerequisites: 'Node.js', commands: ['npm start'], one_liner: 'docker run test' }),
  tech_stack_summary: 'Node.js app'
});

const details = Database.getGitHubDetails(resourceId);
if (!details || details.repo_owner !== 'test') {
  throw new Error('FAILED: saveGitHubDetails / getGitHubDetails');
}

// Test togglePin
Database.togglePin(resourceId, 1);
const pinnedRes = db.prepare('SELECT is_pinned FROM resources WHERE id = ?').get(resourceId);
if (pinnedRes.is_pinned !== 1) {
  throw new Error('FAILED: togglePin');
}
Database.togglePin(resourceId, 0);

// Set older last_interacted_at AFTER togglePin for pruning test
const fifteenDaysAgo = new Date(Date.now() - 15 * 86400 * 1000).toISOString();
db.prepare(`UPDATE resources SET last_interacted_at = ?, created_at = ? WHERE id = ?`).run(
  fifteenDaysAgo,
  fifteenDaysAgo,
  resourceId
);

// Test pruneInactiveGitHubRepos
const prunedCount = Database.pruneInactiveGitHubRepos(14);
if (prunedCount < 1) {
  throw new Error('FAILED: pruneInactiveGitHubRepos did not prune 15-day old repo');
}

console.log('✅ DB Schema & Helper tests passed successfully!');
