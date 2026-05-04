const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Helper: Validate email domain ───────────────────────────────────────────
const INVALID_EMAIL_DOMAINS = [
  'example.com', 'example.org', 'example.net', 'example.edu',
  'test.com', 'test.org', 'test.net', 'localhost', 'localhost.localdomain',
  'invalid', 'mailinator.com', 'tempmail.com', 'throwaway.com',
];

const validateEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { valid: false, message: 'Invalid email format' };
  if (INVALID_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, message: 'Please use a valid email address.' };
  }
  return { valid: true };
};

// ─── Helper: Generate JWT Token ─────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Helper: Return user data without sensitive fields ──────────────────────
const getUserData = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  coins: user.coins,
  isPremium: user.isPremium,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar,
  bio: user.bio,
});

// ─── REGISTER (Simple username + email + password) ──────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      isTempUser: false 
    });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: getUserData(user)
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── LOGIN (Email + password) ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.isTempUser) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: getUserData(user)
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── FORGOT PASSWORD (Simple response - use /change-password after login) ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Just confirm email exists (security: don't reveal if email registered)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found' });
    }

    res.json({ 
      message: 'If an account exists, check your email for instructions. Use login + change password.' 
    });
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CHANGE PASSWORD (Authenticated) ────────────────────────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('❌ Change password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

