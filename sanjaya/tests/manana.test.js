const assert = require('assert');
const test = require('node:test');
const { analyzeTranscript } = require('../src/manana');

test('Manana Engine parses transcript correctly', (t, done) => {
  const mockRaw = {
    timestamp: "2026-07-25",
    conversations: [{ speaker: "User", text: "Let's validate first." }]
  };

  analyzeTranscript(mockRaw, (err, scores) => {
    assert.strictEqual(err, null);
    assert.ok(scores.cognitive_distortion > 0);
    assert.ok(scores.conversational_connection > 0);
    assert.ok(scores.active_listening > 0);
    assert.ok(scores.speech_clarity > 0);
    assert.ok(scores.summary !== undefined);
    assert.ok(scores.kaizen_target !== undefined);
    done();
  });
});
