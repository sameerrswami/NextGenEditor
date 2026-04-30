const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get global leaderboard - top 50 users by coins
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('username coins isPremium avatar bio followers')
      .sort({ coins: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      coins: u.coins,
      isPremium: u.isPremium,
      avatar: u.avatar,
      bio: u.bio,
      followers: u.followers.length,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
