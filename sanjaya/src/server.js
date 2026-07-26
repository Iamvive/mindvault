require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDailyScores, saveDailyScore } = require('./database');
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

function performSync(syncDate, callback) {
  fetchDailyTranscripts(syncDate, null, (err, transcript) => {
    if (err) {
      if (callback) callback(err);
      return;
    }

    const vaultPath = backupToVault(syncDate, transcript);

    analyzeTranscript(transcript, (err2, analysisResult) => {
      if (err2) {
        if (callback) callback(err2);
        return;
      }

      analysisResult.raw_vault_path = vaultPath;

      saveDailyScore(syncDate, analysisResult, (err3) => {
        if (callback) callback(err3, analysisResult);
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
  app.listen(PORT, () => {
    console.log(`Sanjaya Server running on port ${PORT}`);
    
    // Trigger immediate background sync on startup, then every 15 minutes
    setTimeout(runBackgroundAutoSync, 1000);
    setInterval(runBackgroundAutoSync, 15 * 60 * 1000);
  });
}

module.exports = app;
