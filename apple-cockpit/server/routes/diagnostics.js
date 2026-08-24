const express = require('express');
const router = express.Router();
const { runHealthAudit, executeRepair } = require('../services/macDiagnostics');

router.get('/', (req, res) => {
  try {
    const audit = runHealthAudit();
    res.json({ success: true, ...audit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/repair', (req, res) => {
  try {
    const { actionId } = req.body || {};
    if (!actionId) {
      return res.status(400).json({ success: false, error: 'actionId is required' });
    }
    const result = executeRepair(actionId);
    res.json({ success: result.success, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
