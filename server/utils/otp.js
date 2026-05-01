const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (10 minutes from now)
 * @returns {Date}
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Validate an OTP against stored value and expiry
 * @param {string} inputOTP - OTP entered by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiry - OTP expiry date
 * @returns {object} { valid: boolean, message: string }
 */
const validateOTP = (inputOTP, storedOTP, expiry) => {
  if (!storedOTP || !expiry) {
    return { valid: false, message: 'OTP not found. Please request a new one.' };
  }

  if (new Date() > new Date(expiry)) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (inputOTP !== storedOTP) {
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
  validateOTP,
  sendPhoneOTP,
  clearOTP
};
