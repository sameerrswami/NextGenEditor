const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');
const { generateOTP, getOTPExpiry, hashOTP, validateOTP, clearOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Constants ───────────────────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between OTP requests

// ─── Helper: Validate email domain ───────────────────────────────────────────
// Reject reserved/invalid domains per RFC 2606 and RFC 7505
const INVALID_EMAIL_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test.com',
  'test.org',
  'test.net',
  'localhost',
  'localhost.localdomain',
  'invalid',
  'mailinator.com',
  'tempmail.com',
  'throwaway.com',
];

const validateEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { valid: false, message: 'Invalid email format' };
  if (INVALID_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, message: 'Email domain does not accept mail. Please use a valid email address.' };
  }
  return { valid: true };
};

// ─── Helper: Check OTP rate limit ────────────────────────────────────────────
const checkOTPRateLimit = (lastOTPRequest) => {
  if (!lastOTPRequest) return { allowed: true };
  
  const timeSinceLastRequest = Date.now() - new Date(lastOTPRequest).getTime();
  if (timeSinceLastRequest < OTP_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((OTP_COOLDOWN_MS - timeSinceLastRequest) / 1000);
    return { 
      allowed: false, 
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.` 
    };
  }
  return { allowed: true };
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

// ═══════════════════════════════════════════════════════════════════════════
// EXISTING ENDPOINTS (Backward Compatible)
// ═══════════════════════════════════════════════════════════════════════════

// Register (traditional - email + password)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      isEmailVerified: true,
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

// Login (email + password only)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email, isTempUser: false });
    if (!user) {
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

// ═══════════════════════════════════════════════════════════════════════════
// OTP - EMAIL
// ═══════════════════════════════════════════════════════════════════════════

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    // Check if user exists (for forgot password)
    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.error('Database query error:', dbError.message);
      return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
    }

    if (purpose === 'password-reset') {
      // For password reset, only allow real (non-temp) users
      if (!user || user.isTempUser) {
        return res.status(404).json({ error: 'No account found with this email' });
      }
    } else if (purpose === 'verification') {
      // For registration, block if a real account already exists with this email
      if (user && !user.isTempUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
    }

    // Rate limiting check
    if (user) {
      const rateLimitCheck = checkOTPRateLimit(user.lastOTPRequest);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ error: rateLimitCheck.message });
      }
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();
    const hashedOTP = await hashOTP(otp);

    if (user) {
      // Update existing user's OTP
      user.emailOTP = hashedOTP;
      user.emailOTPExpiry = expiry;
      user.lastOTPRequest = new Date();
      // Reset verification so the new OTP must be verified
      if (user.isTempUser) user.isEmailVerified = false;
      try {
        await user.save();
      } catch (saveError) {
        console.error('User save error:', saveError.message);
        return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
      }
    } else {
      // Create a new temporary user for registration flow
      const tempPass = Math.random().toString(36).slice(-8) + '1234';
      const hashedPassword = await bcrypt.hash(tempPass, 10);
      
      user = new User({
        username: `temp_${Date.now()}`,
        email,
        password: hashedPassword,
        emailOTP: hashedOTP,
        emailOTPExpiry: expiry,
        lastOTPRequest: new Date(),
        isTempUser: true,
      });
      try {
        await user.save();
      } catch (saveError) {
        console.error('User save error:', saveError.message);
        return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
      }
    }

    const result = await sendOTPEmail(email, otp, purpose);

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (err) {
    console.error('❌ Send email OTP error:', err.message);
    // Return a safe error message without exposing internal details
    res.status(500).json({ error: 'Unable to send OTP. Please try again.' });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await validateOTP(otp, user.emailOTP, user.emailOTPExpiry);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    clearOTP(user, 'email');
    await user.save();

    res.json({ message: 'Email verified successfully', verified: true });
  } catch (err) {
    console.error('❌ Verify email OTP error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER WITH OTP (Email only)
// ═══════════════════════════════════════════════════════════════════════════

// Register with OTP (after email verification)
router.post('/register-with-otp', async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !password || !otp || !email) {
      return res.status(400).json({ error: 'Username, password, OTP, and email are required' });
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    // Check if username is taken by a real user
    const existingUsername = await User.findOne({ username, isTempUser: false });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Find user by email — must be a temp user awaiting registration
    let user = await User.findOne({ email, isTempUser: true });
    if (!user) {
      // Check if a real account already exists
      const realUser = await User.findOne({ email, isTempUser: false });
      if (realUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }
      return res.status(404).json({ error: 'Session expired. Please request a new OTP.' });
    }

    // Validate OTP if email not yet verified
    if (!user.isEmailVerified) {
      const otpResult = await validateOTP(otp, user.emailOTP, user.emailOTPExpiry);
      if (!otpResult.valid) {
        return res.status(400).json({ error: otpResult.message });
      }
      user.isEmailVerified = true;
    }

    // Convert temp user to real user
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    user.isEmailVerified = true;
    user.isTempUser = false;
    clearOTP(user, 'email');
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: getUserData(user)
    });
  } catch (err) {
    console.error('❌ Register with OTP error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════

// Request password reset (send OTP to email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    // Only send reset OTP to real (non-temp) users
    const user = await User.findOne({ email, isTempUser: false });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Rate limiting check
    const rateLimitCheck = checkOTPRateLimit(user.lastOTPRequest);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ error: rateLimitCheck.message });
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();
    const hashedOTP = await hashOTP(otp);

    user.emailOTP = hashedOTP;
    user.emailOTPExpiry = expiry;
    user.lastOTPRequest = new Date();
    await user.save();

    const result = await sendOTPEmail(email, otp, 'password-reset');

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email, isTempUser: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpResult = await validateOTP(otp, user.emailOTP, user.emailOTPExpiry);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.message });
    }

    // Update password securely
    user.password = await bcrypt.hash(newPassword, 10);
    clearOTP(user, 'email');
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('❌ Reset password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD (Authenticated)
// ═══════════════════════════════════════════════════════════════════════════

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
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
      return res.status(400).json({ error: 'Current password is incorrect' });
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
