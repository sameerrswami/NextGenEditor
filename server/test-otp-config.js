const config = require('./config');
const { sendOTPEmail, testConnection } = require('./utils/email');
const { generateOTP } = require('./utils/otp');

console.log('=== OTP Configuration Check ===\n');

// Check SMTP config
console.log('SMTP_HOST:', config.SMTP_HOST || 'NOT SET');
console.log('SMTP_PORT:', config.SMTP_PORT || 'NOT SET');
console.log('SMTP_USER:', config.SMTP_USER ? '****' + config.SMTP_USER.slice(-10) : 'NOT SET - emails will be logged to console only!');
console.log('SMTP_PASS:', config.SMTP_PASS ? '******** (hidden)' : 'NOT SET - emails will be logged to console only!');
console.log('FROM_EMAIL:', config.FROM_EMAIL || 'NOT SET');
console.log('NODE_ENV:', config.NODE_ENV);
console.log('');

// Test email sending
async function testEmail() {
  const otp = generateOTP();
  console.log('Generated test OTP:', otp);

  // Step 1: Test SMTP connection
  console.log('\n--- Step 1: Testing SMTP connection ---');
  let connectionOk = false;
  try {
    connectionOk = await Promise.race([
      testConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000))
    ]);
  } catch (err) {
    console.log('❌ SMTP Connection Error:', err.message);
  }

  if (!connectionOk) {
    console.log('\n⚠️  SMTP connection failed or not configured.');
    console.log('   OTPs will be logged to console only (mock mode).');
  }

  // Step 2: Test email send
  console.log('\n--- Step 2: Testing email send ---');
  let result;
  try {
    result = await Promise.race([
      sendOTPEmail('test@example.com', otp, 'verification'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Send timeout (15s)')), 15000))
    ]);
    console.log('Result:', result);
  } catch (err) {
    console.log('❌ Email Send Error:', err.message);
    result = { success: false, message: err.message };
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  if (!config.SMTP_USER || !config.SMTP_PASS) {
    console.log('❌ SMTP credentials NOT configured');
    console.log('   OTPs are logged to console only (MOCK MODE)');
    console.log('   Fix: Add SMTP_USER and SMTP_PASS to server/.env');
  } else if (!connectionOk) {
    console.log('❌ SMTP credentials are set but connection failed');
    console.log('   Possible causes:');
    console.log('   - Wrong app password (use Gmail App Password, not regular password)');
    console.log('   - 2-Factor Auth not enabled on Gmail account');
    console.log('   - Less secure app access blocked');
    console.log('   - Network/firewall blocking port', config.SMTP_PORT);
  } else if (result && result.success) {
    console.log('✅ OTP email system is WORKING!');
    console.log('   Real emails are being sent via', config.SMTP_HOST);
  } else {
    console.log('❌ SMTP connected but email send failed');
    console.log('   Error:', result ? result.message : 'Unknown error');
  }
  console.log('==============================\n');
}

testEmail().catch(console.error);
