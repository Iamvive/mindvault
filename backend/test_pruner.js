import { startAutoPruner } from './pruner.js';
import { Database } from './database.js';

console.log('Testing AutoPruner Service...');

const timer = startAutoPruner(3600000);
if (!timer) {
  throw new Error('FAILED: startAutoPruner did not return timer instance');
}

clearInterval(timer);
console.log('✅ AutoPruner test passed successfully!');
