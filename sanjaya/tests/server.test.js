const path = require('path');
const fs = require('fs');

process.env.DB_PATH = path.join(__dirname, '../smriti/server.test.db');

const assert = require('assert');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/server');
const { runMigrations } = require('../src/database');

test('GET /api/scores and POST /api/trigger-sync', (t, done) => {
  // Clean db first
  if (fs.existsSync(process.env.DB_PATH)) {
    fs.unlinkSync(process.env.DB_PATH);
  }

  runMigrations(() => {
    request(app)
      .post('/api/trigger-sync')
      .expect(200)
      .end((err, res) => {
        assert.strictEqual(err, null);
        assert.strictEqual(res.body.success, true);
        assert.ok(res.body.scores.cognitive_distortion > 0);

        request(app)
          .get('/api/scores')
          .expect(200)
          .end((err2, res2) => {
            assert.strictEqual(err2, null);
            assert.ok(res2.body.length > 0);
            assert.strictEqual(res2.body[0].cognitive_distortion, res.body.scores.cognitive_distortion);
            done();
          });
      });
  });
});
