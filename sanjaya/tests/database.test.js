const assert = require('assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');

process.env.DB_PATH = path.join(__dirname, '../smriti/database.test.db');

const {
  runMigrations,
  saveDailyScore,
  getDailyScores,
  saveActionItems,
  getActionItems,
  toggleActionItem,
  saveEntities,
  getEntities,
  indexTranscriptFTS,
  searchTranscriptsFTS
} = require('../src/database');

test('Database Migrations and Queries', (t, done) => {
  const dbPath = process.env.DB_PATH;
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
      raw_vault_path: "smriti/vault/2026-07-25-raw.json",
      key_memories: [
        { time: "10:30 AM", title: "Discussion with team", description: "Aligned on launch timing." }
      ]
    };

    saveDailyScore('2026-07-25', mockScore, (err2) => {
      assert.strictEqual(err2, null);

      getDailyScores((err3, rows) => {
        assert.strictEqual(err3, null);
        assert.strictEqual(rows.length, 1);
        assert.strictEqual(rows[0].date, '2026-07-25');
        assert.strictEqual(rows[0].cognitive_distortion, 8.5);

        // Test Action Items
        const mockItems = [
          { time: '11:00 AM', task: 'Follow up on design spec', category: 'todo', context: 'Architecture review', assignee: 'Self' }
        ];
        saveActionItems('2026-07-25', mockItems, (err4) => {
          assert.strictEqual(err4, null);

          getActionItems('all', (err5, items) => {
            assert.strictEqual(err5, null);
            assert.strictEqual(items.length, 1);
            assert.strictEqual(items[0].task, 'Follow up on design spec');
            assert.strictEqual(items[0].status, 'pending');

            toggleActionItem(items[0].id, (err6, updated) => {
              assert.strictEqual(err6, null);
              assert.strictEqual(updated.status, 'completed');

              // Test FTS search
              indexTranscriptFTS('2026-07-25', '11:00 AM', 'User', 'We need SQLite FTS5 for quick searching', (err7) => {
                assert.strictEqual(err7, null);

                searchTranscriptsFTS('SQLite', (err8, searchResults) => {
                  assert.strictEqual(err8, null);
                  assert.ok(searchResults.length >= 1);
                  assert.strictEqual(searchResults[0].speaker, 'User');
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
