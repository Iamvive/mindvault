const express = require('express');
const router = express.Router();
const { executeRepair } = require('../services/macDiagnostics');

router.post('/:action', (req, res) => {
  try {
    const { action } = req.params;
    const result = executeRepair(action);
    res.json({ success: result.success, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
