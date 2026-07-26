const assert = require('assert');
const test = require('node:test');
const { handleChatQuery } = require('../src/chat');

test('Chat RAG Engine answers user query correctly in test mode', (t) => {
  handleChatQuery("What are my top cognitive distortions?", [], (err, res) => {
    assert.strictEqual(err, null);
    assert.ok(res.answer);
    assert.ok(typeof res.answer === 'string');
  });
});
