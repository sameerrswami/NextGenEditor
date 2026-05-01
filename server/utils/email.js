const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, NODE_ENV } = require('../config');

let transporter = null;

// Initialize transporter if SMTP credentials are available
if (SMTP_USER && SMTP_PASS) {
  const isSecure = SMTP_PORT === 465;
  
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: isSecure, // true for 465, false for other ports (587 TLS)
    // Force IPv4 to avoid IPv6 connectivity issues
    family: 4,
    requireTLS: !isSecure, // Require TLS for non-SSL ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Connection timeout settings
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    // TLS configuration
    tls: {
      // Don't fail on invalid certificates for development
      rejectUnauthorized: NODE_ENV !== 'development'
    }
  });
  
  console.log(`\n📧 [EMAIL] SMTP configured: ${SMTP_HOST}:${SMTP_PORT}`);
  console.log(`    From: ${FROM_EMAIL}`);
  console.log(`    Mode: ${NODE_ENV}\n`);
} else {
  // Allow mock mode in production for debugging (set ALLOW_MOCK_IN_PROD=true)
  const allowMock = process.env.ALLOW_MOCK_IN_PROD === 'true';
  
  if (NODE_ENV === 'production' && !allowMock) {
    console.error('\n❌ [EMAIL] SMTP credentials NOT configured in production!');
    console.error('    Please set environment variables:');
    console.error('    - SMTP_HOST (e.g., smtp.gmail.com)');
    console.error('    - SMTP_PORT (e.g., 587)');
    console.error('    - SMTP_USER (your email)');
    console.error('    - SMTP_PASS (app password)');
    console.error('    - FROM_EMAIL (sender email)\n');
  } else {
    console.log('\n⚠️  [EMAIL] SMTP credentials not configured. Running in MOCK mode.');
    console.log('    OTPs will be logged to console instead of being sent via email.');
    if (NODE_ENV === 'production') {
      console.log('    (Mock mode enabled via ALLOW_MOCK_IN_PROD env var)\n');
    } else {
      console.log('\n');
    }
  }
}


/**
 * Generate email template for OTP
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose text
 * @returns {{subject: string, html: string, text: string}}
 */
const getEmailTemplate = (otp, purpose = 'verification') => {
  const subject = purpose === 'password-reset'
    ? 'Password Reset - NextGenEditor'
    : 'Email Verification - NextGenEditor';

  const purposeText = purpose === 'password-reset'
    ? 'reset your password'
    : 'verify your email address';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00f5d4; font-size: 28px; margin: 0;">NextGenEditor</h1>
        <p style="color: #64748b; margin-top: 8px;">AI-Powered Coding Platform</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0;">Your Verification Code</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Use the code below to ${purposeText}. This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div style="background: #ffffff; border: 2px dashed #00f5d4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: bold; color: #0f172a; letter-spacing: 8px;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
          If you didn't request this code, you can safely ignore this email. Your account is secure.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #94a3b8; font-size: 12px;">
          NextGenEditor &copy; ${new Date().getFullYear()}<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  `;

  const text = `Your NextGenEditor verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

  return { subject, html, text };
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of the OTP (e.g., 'verification', 'password-reset')
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendOTPEmail = async (to, otp, purpose = 'verification') => {
  const { subject, html, text } = getEmailTemplate(otp, purpose);

  // If no transporter configured, log to console (development mode)
  if (!transporter) {
    console.log('\n========================================');
    console.log('📧 MOCK EMAIL SERVICE (Development Mode)');
    console.log('========================================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP: ${otp}`);
    console.log(`Purpose: ${purpose}`);
    console.log('========================================\n');
    return {
      success: true,
      message: `OTP email logged to console (configure SMTP for real delivery)`
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NextGenEditor" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return {
      success: true,
      message: 'OTP sent successfully to your email'
    };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return {
      success: false,
      message: 'Failed to send email. Please try again later.'
    };
  }
};


/**
 * Test SMTP connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  if (!transporter) {
    console.log('⚠️  No SMTP transporter configured. Skipping verification.');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

/**
 * Verify SMTP connection on server start
 * Logs clear status message for production readiness
 */
const verifySMTPConnection = async () => {
  console.log('\n📧 [EMAIL] Verifying SMTP configuration...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('   SMTP is ready to send emails.\n');
  } else {
    console.log('   Running in MOCK mode. Emails will be logged to console.\n');
  }
  
  return isConnected;
};

module.exports = {
  sendOTPEmail,
  testConnection,
  verifySMTPConnection,
  getEmailTemplate,
};
