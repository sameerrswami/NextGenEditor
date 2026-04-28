const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const History = require('../models/History');

const router = express.Router();

// Save history entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { code, language, input, output, error, executionTime } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const history = new History({
      userId: req.userId,
      code,
      language,
      input,
      output,
      error,
      executionTime
    });

    await history.save();
    res.status(201).json(history);
  } catch (err) {
    console.error('Save history error:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

// Get history for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;

