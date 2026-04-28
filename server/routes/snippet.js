const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Snippet = require('../models/Snippet');
const User = require('../models/User');

const router = express.Router();

// Create snippet
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, code, language, tags = [] } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ error: 'Title, code, and language are required' });
    }

    const snippet = new Snippet({
      userId: req.userId,
      title,
      code,
      language,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean)
    });

    await snippet.save();

    // Reward user with 5 coins (non-blocking)
    User.findByIdAndUpdate(req.userId, { $inc: { coins: 5 } })
      .catch(err => console.error("[Snippet] Coin Reward Error:", err));

    res.status(201).json(snippet);
  } catch (err) {
    console.error('Create snippet error:', err);
    res.status(500).json({ error: 'Failed to save snippet' });
  }
});

// Get all snippets for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = { userId: req.userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const snippets = await Snippet.find(query).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    console.error('Get snippets error:', err);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Delete snippet
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted' });
  } catch (err) {
    console.error('Delete snippet error:', err);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

module.exports = router;

