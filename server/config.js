const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nextgeneditor';
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

if (!process.env.JWT_SECRET && NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production mode.');
}

// SMTP Configuration for OTP emails
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nextgeneditor.com';

module.exports = {
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  PORT: process.env.PORT || 5000,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
};
