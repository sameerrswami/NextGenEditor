const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile by username
router.get('/profile/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Increment profile views
    user.profileViews += 1;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const me = await User.findById(req.userId);

    if (!userToFollow) return res.status(404).json({ error: 'User not found' });
    if (userToFollow.id === me.id) return res.status(400).json({ error: 'Cannot follow yourself' });

    const isFollowing = me.following.includes(userToFollow.id);

    if (isFollowing) {
      // Unfollow
      me.following = me.following.filter(id => id.toString() !== userToFollow.id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== me.id.toString());
    } else {
      // Follow
      me.following.push(userToFollow.id);
      userToFollow.followers.push(me.id);
    }

    await me.save();
    await userToFollow.save();

    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Buy Premium
router.post('/premium/buy', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.isPremium) return res.status(400).json({ error: 'Already premium' });
    if (user.coins < 10000) return res.status(400).json({ error: 'Insufficient coins. You need 10,000 coins.' });

    user.coins -= 10000;
    user.isPremium = true;
    await user.save();

    res.json({ success: true, message: 'Welcome to Premium!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already taken' });
      user.email = email;
    }

    user.bio = bio !== undefined ? bio : user.bio;
    if (avatar) {
      user.avatar = avatar;
      console.log(`[User] Avatar updated for ${user.username} (${avatar.length} bytes)`);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
