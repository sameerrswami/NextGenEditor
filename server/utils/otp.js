const crypto = require('crypto');
const bcrypt = require('bcryptjs');


/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  // Generate cryptographically secure random number
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  // Map to 100000-999999 range
  return (num % 900000 + 100000).toString();
};

/**
 * Get OTP expiry time (10 minutes from now)
 * @returns {Date}
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Compare input OTP with stored hash
 * @param {string} inputOTP - OTP entered by user
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>}
 */
const compareOTP = async (inputOTP, hashedOTP) => {
  if (!inputOTP || !hashedOTP) return false;
  return bcrypt.compare(inputOTP, hashedOTP);
};

/**
 * Validate an OTP against stored hash and expiry

 * @param {string} inputOTP - OTP entered by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiry - OTP expiry date
 * @returns {object} { valid: boolean, message: string }
 */
const validateOTP = async (inputOTP, storedHash, expiry) => {
  if (!storedHash || !expiry) {
    return { valid: false, message: 'OTP not found. Please request a new one.' };
  }

  if (new Date() > new Date(expiry)) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  const isMatch = await compareOTP(inputOTP, storedHash);
  if (!isMatch) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};


/**
 * Mock Phone SMS Service - logs OTP to console for demo purposes
 * In production, replace this with Twilio or similar service
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendPhoneOTP = async (phone, otp) => {
  // Mock implementation - logs to console
  console.log('\n========================================');
  console.log('📱 MOCK PHONE SMS SERVICE');
  console.log('========================================');
  console.log(`To: ${phone}`);
  console.log(`Message: Your NextGenEditor verification code is: ${otp}`);
  console.log(`Expires in: 10 minutes`);
  console.log('========================================\n');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    message: `OTP sent to ${phone} (logged to console for demo)`
  };
};

/**
 * Clear OTP fields from user object
 * @param {Object} user - Mongoose user document
 * @param {string} type - 'email' or 'phone'
 */
const clearOTP = (user, type) => {
  if (type === 'email') {
    user.emailOTP = null;
    user.emailOTPExpiry = null;
  } else if (type === 'phone') {
    user.phoneOTP = null;
    user.phoneOTPExpiry = null;
  }
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  hashOTP,
  compareOTP,
  validateOTP,
  sendPhoneOTP,
  clearOTP
};
