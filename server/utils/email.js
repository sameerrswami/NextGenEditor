/**
 * Optional email utilities for welcome emails or notifications
 * SendGrid optional - logs to console if not configured
 */

const sgMail = require('@sendgrid/mail');
const config = require('../config');

let sgClient = null;

if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
  sgClient = sgMail;
  console.log(`\\n📧 SendGrid configured (FROM: ${config.FROM_EMAIL})`);
} else {
  console.log('\\n⚠️ SENDGRID_API_KEY not set - emails logged to console');
}

/**
 * Send welcome email (optional - called from register if configured)
 */
const sendWelcomeEmail = async (to, username) => {
  const subject = 'Welcome to NextGenEditor!';
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #00f5d4;">Welcome to NextGenEditor, ${username}!</h1>
      <p>You're all set! Start coding with AI-powered features.</p>
      <p>NextGenEditor Team</p>
    </div>
  `;
  const text = `Welcome to NextGenEditor, ${username}!`;

  if (!sgClient) {
    console.log(`📧 [WELCOME MOCK] To: ${to} - Welcome, ${username}`);
    return { success: true, message: 'Welcome email logged (no SendGrid)' };
  }

  try {
    await sgClient.send({
      to,
      from: config.FROM_EMAIL,
      subject,
      html,
      text,
    });
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('SendGrid error:', error.message);
    return { success: false, message: 'Failed to send welcome email' };
  }
};

module.exports = {
  sendWelcomeEmail
};

