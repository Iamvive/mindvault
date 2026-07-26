const path = require('path');
const fs = require('fs');

process.env.DB_PATH = path.join(__dirname, '../smriti/server-detail.test.db');

const assert = require('assert');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/server');
const { runMigrations } = require('../src/database');

test('Server Date Filter and Raw Transcript Endpoint', (t, done) => {
  // Clean db first
  if (fs.existsSync(process.env.DB_PATH)) {
    fs.unlinkSync(process.env.DB_PATH);
  }

  runMigrations(() => {
    // Ingest today's scores
    request(app)
      .post('/api/trigger-sync')
      .expect(200)
      .end((err, res) => {
        assert.strictEqual(err, null);
        assert.strictEqual(res.body.success, true);
        
        const today = new Date().toISOString().split('T')[0];

        // 1. Test GET /api/scores?date=today
        request(app)
          .get(`/api/scores?date=${today}`)
          .expect(200)
          .end((err2, res2) => {
            assert.strictEqual(err2, null);
            assert.strictEqual(res2.body.length, 1);
            assert.strictEqual(res2.body[0].date, today);

            // 2. Test GET /api/raw-transcript?date=today
            request(app)
              .get(`/api/raw-transcript?date=${today}`)
              .expect(200)
              .end((err3, res3) => {
                assert.strictEqual(err3, null);
                assert.strictEqual(res3.body.timestamp, today);
                assert.ok(Array.isArray(res3.body.conversations));
                done();
              });
          });
      });
  });
});
