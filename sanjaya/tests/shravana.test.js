const assert = require('assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const { fetchDailyTranscripts, backupToVault } = require('../src/shravana');

test('Shravana Daemon fetches and saves raw backup safely', (t) => {
  const testDate = '2026-07-25';
  fetchDailyTranscripts(testDate, null, (err, data) => {
    assert.strictEqual(err, null);
    assert.ok(data.conversations.length > 0);

    const backupPath = backupToVault(testDate, data);
    assert.ok(fs.existsSync(backupPath));
    const savedData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    assert.strictEqual(savedData.timestamp, testDate);
  });
});
