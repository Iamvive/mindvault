const assert = require('assert');
const test = require('node:test');
const { analyzeTranscript } = require('../src/manana');

test('Manana Engine parses transcript correctly and returns top 3 key memories', (t, done) => {
  const mockRaw = {
    timestamp: "2026-07-25",
    conversations: [
      { time: "10:30 AM", speaker: "User", text: "We should validate first." },
      { time: "02:15 PM", speaker: "User", text: "I will call the plumber." },
      { time: "05:00 PM", speaker: "User", text: "Manager approved showcasing tomorrow." }
    ]
  };

  analyzeTranscript(mockRaw, (err, scores) => {
    assert.strictEqual(err, null);
    assert.ok(scores.cognitive_distortion > 0);
    assert.ok(scores.conversational_connection > 0);
    assert.ok(scores.active_listening > 0);
    assert.ok(scores.speech_clarity > 0);
    assert.ok(scores.summary !== undefined);
    assert.ok(scores.kaizen_target !== undefined);
    
    // Assert key memories
    assert.ok(Array.isArray(scores.key_memories));
    assert.strictEqual(scores.key_memories.length, 3);
    assert.ok(scores.key_memories[0].time !== undefined);
    assert.ok(scores.key_memories[0].title !== undefined);
    assert.ok(scores.key_memories[0].description !== undefined);
    done();
  });
});
