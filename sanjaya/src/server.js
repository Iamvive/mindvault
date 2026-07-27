require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  runMigrations,
  getDailyScores,
  saveDailyScore,
  saveActionItems,
  getActionItems,
  toggleActionItem,
  saveEntities,
  getEntities,
  saveDailyDigest,
  getDailyDigest,
  indexTranscriptFTS,
  searchTranscriptsFTS
} = require('./database');
const { fetchDailyTranscripts, backupToVault } = require('./shravana');
const { analyzeTranscript } = require('./manana');
const { handleChatQuery } = require('./chat');

const app = express();
app.use(express.json());

// Serve Darshana dashboard static files in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/scores', (req, res) => {
  const { date } = req.query;
  getDailyScores((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (date) {
      const filtered = rows.filter(r => r.date === date);
      return res.json(filtered);
    }
    res.json(rows);
  });
});

app.get('/api/raw-transcript', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date parameter is required" });
  
  const vaultPath = path.join(__dirname, `../smriti/vault/${date}-raw.json`);
  fs.readFile(vaultPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: "Transcript not found" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse raw transcript" });
    }
  });
});

// Second Brain REST Endpoints

app.get('/api/action-items', (req, res) => {
  const { category } = req.query;
  getActionItems(category || 'all', (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(items);
  });
});

app.post('/api/action-items/:id/toggle', (req, res) => {
  const { id } = req.params;
  toggleActionItem(id, (err, updatedItem) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, item: updatedItem });
  });
});

app.get('/api/entities', (req, res) => {
  const { date } = req.query;
  getEntities(date, (err, entities) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(entities);
  });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  searchTranscriptsFTS(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/digest', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  getDailyDigest(targetDate, (err, digestRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!digestRow) {
      return res.json({
        top_conversations: [],
        key_takeaways: ["Sync Locket to extract knowledge digests."],
        weaknesses_identified: ["No weaknesses detected today."],
        growth_areas: ["Maintain active listening and clear vocal cadence."],
        research_tip: "Carl Rogers' Active Listening Scale: Mirroring a colleague's core constraint before introducing your proposal increases alignment by up to 35%."
      });
    }
    let parsedDigest = {
      date: digestRow.date,
      top_conversations: [],
      key_takeaways: [],
      weaknesses_identified: [],
      growth_areas: [],
      research_tip: digestRow.research_tip || ""
    };
    try { parsedDigest.top_conversations = JSON.parse(digestRow.top_conversations || '[]'); } catch (e) {}
    try { parsedDigest.key_takeaways = JSON.parse(digestRow.key_takeaways || '[]'); } catch (e) {}
    try { parsedDigest.weaknesses_identified = JSON.parse(digestRow.weaknesses_identified || '[]'); } catch (e) {}
    try { parsedDigest.growth_areas = JSON.parse(digestRow.growth_areas || '[]'); } catch (e) {}
    res.json(parsedDigest);
  });
});

function performSync(syncDate, callback) {
  fetchDailyTranscripts(syncDate, null, (err, transcript) => {
    if (err) {
      if (callback) callback(err);
      return;
    }

    const vaultPath = backupToVault(syncDate, transcript);

    // Index transcript lines into FTS5
    if (transcript.conversations && Array.isArray(transcript.conversations)) {
      for (const conv of transcript.conversations) {
        indexTranscriptFTS(syncDate, conv.time, conv.speaker, conv.text);
      }
    }

    analyzeTranscript(transcript, (err2, analysisResult) => {
      if (err2) {
        if (callback) callback(err2);
        return;
      }

      analysisResult.raw_vault_path = vaultPath;

      saveDailyScore(syncDate, analysisResult, (err3) => {
        saveActionItems(syncDate, analysisResult.action_items, (err4) => {
          saveEntities(syncDate, analysisResult.entities, (err5) => {
            saveDailyDigest(syncDate, analysisResult.daily_digest || {}, (err6) => {
              if (callback) callback(err3 || err4 || err5 || err6, analysisResult);
            });
          });
        });
      });
    });
  });
}

app.post('/api/trigger-sync', (req, res) => {
  const { date } = req.body || {};
  const syncDate = date || new Date().toISOString().split('T')[0];

  performSync(syncDate, (err, analysisResult) => {
    if (err) return res.status(500).json({ error: err.message || "Sync failed" });
    res.json({ success: true, scores: analysisResult });
  });
});

app.post('/api/chat', (req, res) => {
  const { message, history } = req.body || {};
  handleChatQuery(message, history, (err, response) => {
    if (err) return res.status(500).json({ error: err.message || "Chat query failed" });
    res.json(response);
  });
});

function runBackgroundAutoSync() {
  const today = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  console.log(`[Background Sync Daemon] Auto-syncing memories for ${today} and ${yesterday}...`);
  performSync(today, (err) => {
    if (err) console.error(`[Background Sync Daemon] Failed today (${today}):`, err.message || err);
    performSync(yesterday, (err2) => {
      if (err2) console.error(`[Background Sync Daemon] Failed yesterday (${yesterday}):`, err2.message || err2);
      else console.log(`[Background Sync Daemon] Background sync complete for ${today} and ${yesterday}.`);
    });
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  runMigrations((err) => {
    if (err) console.error("Migration check failed on startup:", err);
    app.listen(PORT, () => {
      console.log(`Sanjaya Server running on port ${PORT}`);
      
      // Trigger immediate background sync on startup, then every 15 minutes
      setTimeout(runBackgroundAutoSync, 1000);
      setInterval(runBackgroundAutoSync, 15 * 60 * 1000);
    });
  });
}

module.exports = app;
