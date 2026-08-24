const express = require('express');
const router = express.Router();
const { getEcosystemTopology } = require('../services/bonjourScanner');
const { getSystemProfile } = require('../services/macDiagnostics');

router.get('/', (req, res) => {
  try {
    const topology = getEcosystemTopology();
    res.json({ success: true, ...topology });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/host', (req, res) => {
  try {
    const profile = getSystemProfile();
    res.json({ success: true, host: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
