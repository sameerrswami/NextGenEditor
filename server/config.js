const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── App Configuration ───────────────────────────────────────────────────────
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || '5005');

// ─── Database Configuration ──────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nextgeneditor';

// ─── JWT Configuration ───────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// Enforce JWT_SECRET in production
if (!process.env.JWT_SECRET && NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production mode.');
}

// ─── SMTP Configuration for Email OTP ────────────────────────────────────────
// For Gmail: Use App Password (not your regular password)
// Generate at: https://myaccount.google.com/apppasswords
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10); // 465 SSL — used by Gmail service preset
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nextgeneditor.com';

module.exports = {
  NODE_ENV,
  PORT,
  MONGO_URI,
  JWT_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
};
