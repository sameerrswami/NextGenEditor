# TODO - Fix OTP Email Issue in Production

## Problem Identified
The 500 error occurs because SMTP credentials are not configured in production (Render.com). On localhost it works because either SMTP is configured or it runs in mock mode.

## Action Items

### Option 1: Configure SMTP in Render Dashboard (Recommended)
Set these environment variables in your Render.com dashboard:
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587
- `SMTP_USER` = your-email@gmail.com
- `SMTP_PASS` = [Gmail App Password](https://myaccount.google.com/apppasswords)
- `FROM_EMAIL` = your-email@gmail.com

### Option 2: Add fallback mock mode in production code
Modify `server/utils/email.js` to allow mock mode in production for debugging

### Option 3: Add better error handling
Improve error messages to diagnose SMTP configuration issues

## Implementation Notes
1. Current code in `server/utils/email.js` lines 10-28 checks if SMTP credentials exist
2. If not configured, transporter remains null
3. When transporter is null, email sending returns error (500) in production
