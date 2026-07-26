import { Database } from './database.js';

export function startAutoPruner(intervalMs = 24 * 60 * 60 * 1000) {
  console.log('⏰ [MindVault Pruner] Starting 14-day inactivity auto-pruner service...');
  
  const runPrune = () => {
    try {
      const prunedCount = Database.pruneInactiveGitHubRepos(14);
      if (prunedCount > 0) {
        console.log(`🧹 [MindVault Pruner] Successfully pruned ${prunedCount} inactive GitHub repos (>14 days uninteracted).`);
      }
    } catch (e) {
      console.error('Error running MindVault Pruner:', e.message);
    }
  };

  // Run once immediately on start
  runPrune();

  // Schedule daily run
  return setInterval(runPrune, intervalMs);
}
