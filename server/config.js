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

// ─── SendGrid Email Configuration (NO SMTP needed) ───────────────────────────
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nextgeneditor.com';

module.exports = {
  NODE_ENV,
  PORT,
  MONGO_URI,
  JWT_SECRET,
  SENDGRID_API_KEY,
  FROM_EMAIL,
};

