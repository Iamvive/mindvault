const test = require('node:test');
const assert = require('assert');
const supertest = require('supertest');
const { runMigrations } = require('../src/database');
const app = require('../src/server');

test('Second Brain REST Endpoints', (t, done) => {
  runMigrations((err) => {
    assert.strictEqual(err, null);

    supertest(app).get('/api/action-items')
      .expect(200)
      .end((err1, res1) => {
        assert.strictEqual(err1, null);
        assert.ok(Array.isArray(res1.body));

        supertest(app).get('/api/entities')
          .expect(200)
          .end((err2, res2) => {
            assert.strictEqual(err2, null);
            assert.ok(Array.isArray(res2.body));

            supertest(app).get('/api/search?q=test')
              .expect(200)
              .end((err3, res3) => {
                assert.strictEqual(err3, null);
                assert.ok(Array.isArray(res3.body));

                supertest(app).get('/api/digest')
                  .expect(200)
                  .end((err4, res4) => {
                    assert.strictEqual(err4, null);
                    assert.ok(res4.body.research_tip !== undefined);
                    assert.ok(Array.isArray(res4.body.key_takeaways));
                    done();
                  });
              });
          });
      });
  });
});
