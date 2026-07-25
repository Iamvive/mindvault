const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDailyScores, saveDailyScore } = require('./database');
const { fetchDailyTranscripts, backupToVault } = require('./shravana');
const { analyzeTranscript } = require('./manana');

const app = express();
app.use(express.json());

// Serve Darshana dashboard static files in production
app.use(express.static(path.join(__dirname, 'darshana/dist')));

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

app.post('/api/trigger-sync', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  fetchDailyTranscripts(today, null, (err, transcript) => {
    if (err) return res.status(500).json({ error: "Failed to fetch transcript" });

    const vaultPath = backupToVault(today, transcript);

    analyzeTranscript(transcript, (err2, analysisResult) => {
      if (err2) return res.status(500).json({ error: "Analysis failed" });

      analysisResult.raw_vault_path = vaultPath;

      saveDailyScore(today, analysisResult, (err3) => {
        if (err3) return res.status(500).json({ error: "Database save failed" });
        res.json({ success: true, scores: analysisResult });
      });
    });
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Sanjaya Server running on port ${PORT}`);
  });
}

module.exports = app;
