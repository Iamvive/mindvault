#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCdpAvailable } from '../src/cdp/chrome-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2] || 'start';

async function main() {
  console.log(`\n🎯 MindHunt — Zero-Cost AI Job Hunting Engine`);
  console.log(`=============================================`);

  if (command === 'start') {
    const isCdp = await checkCdpAvailable();
    if (isCdp) {
      console.log(`✅ Connected to active Chrome on port 9222 (CDP)`);
    } else {
      console.log(`ℹ️  Chrome CDP not detected on port 9222.`);
      console.log(`   To enable live browser automation & Claude 0-cost prompting, run:`);
      console.log(`   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-job-hunter-profile"`);
      console.log(`   (Running in Local Cockpit mode)`);
    }

    import('../src/server/server.js');
  } else if (command === 'help' || command === '--help') {
    console.log(`\nUsage:`);
    console.log(`  job-hunter start   Launch the MindHunt Approval Cockpit`);
    console.log(`  job-hunter status  Check Chrome CDP connection and active jobs`);
    console.log(`  job-hunter help    Show this help message\n`);
  } else {
    console.log(`Unknown command "${command}". Run "job-hunter help" for available commands.`);
  }
}

main().catch(console.error);
