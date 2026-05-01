const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');
const { generateOTP, getOTPExpiry, validateOTP, sendPhoneOTP, clearOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

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
  phone: user.phone,
  coins: user.coins,
  isPremium: user.isPremium,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
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

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, isEmailVerified: true });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: getUserData(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (traditional - email + password, now also supports phone)
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);
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
    console.error('Login error:', err);
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

    const otp = generateOTP();
    const expiry = getOTPExpiry();

    // Check if user exists (for forgot password)
    const existingUser = await User.findOne({ email });

    if (purpose === 'password-reset' && !existingUser) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    if (existingUser) {
      existingUser.emailOTP = otp;
      existingUser.emailOTPExpiry = expiry;
      await existingUser.save();
    } else {
      // For new registrations, create a temporary user record or just send OTP
      // We'll store OTP in a temporary way by creating user with just email
      const tempUser = new User({
        username: `temp_${Date.now()}`,
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        emailOTP: otp,
        emailOTPExpiry: expiry,
      });
      await tempUser.save();
    }

    const result = await sendOTPEmail(email, otp, purpose);

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (err) {
    console.error('Send email OTP error:', err);
    res.status(500).json({ error: 'Server error' });
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

    const result = validateOTP(otp, user.emailOTP, user.emailOTPExpiry);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    clearOTP(user, 'email');
    await user.save();


    res.json({ message: 'Email verified successfully', verified: true });
  } catch (err) {
    console.error('Verify email OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// OTP - PHONE
// ═══════════════════════════════════════════════════════════════════════════

// Send Phone OTP
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Basic phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      existingUser.phoneOTP = otp;
      existingUser.phoneOTPExpiry = expiry;
      await existingUser.save();
    } else {
      // Create temporary user for new registration
      const tempUser = new User({
        username: `temp_${Date.now()}`,
        phone,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        phoneOTP: otp,
        phoneOTPExpiry: expiry,
      });
      await tempUser.save();
    }

    const result = await sendPhoneOTP(phone, otp);

    res.json({ message: result.message });
  } catch (err) {
    console.error('Send phone OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Phone OTP
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = validateOTP(otp, user.phoneOTP, user.phoneOTPExpiry);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Mark phone as verified and clear OTP
    user.isPhoneVerified = true;
    clearOTP(user, 'phone');
    await user.save();


    res.json({ message: 'Phone verified successfully', verified: true });
  } catch (err) {
    console.error('Verify phone OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER WITH OTP
// ═══════════════════════════════════════════════════════════════════════════

// Register with OTP (after email or phone verification)
router.post('/register-with-otp', async (req, res) => {
  try {
    const { username, email, phone, password, otp, method } = req.body;

    if (!username || !password || !otp || !method) {
      return res.status(400).json({ error: 'Username, password, OTP, and method are required' });
    }

    if (method === 'email' && !email) {
      return res.status(400).json({ error: 'Email is required for email registration' });
    }

    if (method === 'phone' && !phone) {
      return res.status(400).json({ error: 'Phone is required for phone registration' });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    let user;

    if (method === 'email') {
      // Find user by email and verify OTP
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please request OTP first.' });
      }

      const otpResult = validateOTP(otp, user.emailOTP, user.emailOTPExpiry);
      if (!otpResult.valid) {
        return res.status(400).json({ error: otpResult.message });
      }

      // Check if email is already registered with a real account
      const existingEmail = await User.findOne({ email, username: { $not: /^temp_/ } });
      if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      user.username = username;
      user.password = await bcrypt.hash(password, 10);
      user.isEmailVerified = true;
      clearOTP(user, 'email');

    } else if (method === 'phone') {
      // Find user by phone and verify OTP
      user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please request OTP first.' });
      }

      const otpResult = validateOTP(otp, user.phoneOTP, user.phoneOTPExpiry);
      if (!otpResult.valid) {
        return res.status(400).json({ error: otpResult.message });
      }

      // Check if phone is already registered with a real account
      const existingPhone = await User.findOne({ phone, username: { $not: /^temp_/ } });
      if (existingPhone && existingPhone._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Phone already registered' });
      }

      user.username = username;
      user.password = await bcrypt.hash(password, 10);
      user.isPhoneVerified = true;
      clearOTP(user, 'phone');
    }

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: getUserData(user)
    });
  } catch (err) {
    console.error('Register with OTP error:', err);
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();

    user.emailOTP = otp;
    user.emailOTPExpiry = expiry;
    await user.save();

    const result = await sendOTPEmail(email, otp, 'password-reset');

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpResult = validateOTP(otp, user.emailOTP, user.emailOTPExpiry);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.message });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    clearOTP(user, 'email');
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
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
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
