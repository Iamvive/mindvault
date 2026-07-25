const assert = require('assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const { runMigrations, saveDailyScore, getDailyScores } = require('../src/database');

test('Database Migrations and Queries', (t, done) => {
  // Ensure the tests directory or other parent dirs exist
  const dbPath = path.join(__dirname, '../smriti/sanjaya.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  runMigrations((err) => {
    assert.strictEqual(err, null);

    const mockScore = {
      cognitive_distortion: 8.5,
      conversational_connection: 7.2,
      active_listening: 9.0,
      speech_clarity: 6.8,
      summary: "Had a productive discussion on project scope.",
      kaizen_target: "Listen more carefully during reviews.",
      raw_vault_path: "smriti/vault/2026-07-25-raw.json"
    };

    saveDailyScore('2026-07-25', mockScore, (err2) => {
      assert.strictEqual(err2, null);

      getDailyScores((err3, rows) => {
        assert.strictEqual(err3, null);
        assert.strictEqual(rows.length, 1);
        assert.strictEqual(rows[0].date, '2026-07-25');
        assert.strictEqual(rows[0].cognitive_distortion, 8.5);
        assert.strictEqual(rows[0].conversational_connection, 7.2);
        assert.strictEqual(rows[0].active_listening, 9.0);
        assert.strictEqual(rows[0].speech_clarity, 6.8);
        assert.strictEqual(rows[0].summary, "Had a productive discussion on project scope.");
        assert.strictEqual(rows[0].kaizen_target, "Listen more carefully during reviews.");
        assert.strictEqual(rows[0].raw_vault_path, "smriti/vault/2026-07-25-raw.json");
        done();
      });
    });
  });
});
