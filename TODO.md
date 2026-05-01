# OTP + Email Authentication Refactor - TODO

## Progress Tracking

- [x] 1. Update `server/models/User.js` - Add `isTempUser` and `lastOTPRequest` fields
- [x] 2. Update `server/utils/otp.js` - Add OTP hashing with bcrypt
- [x] 3. Update `server/utils/email.js` - Fix error logging, add SMTP verification, reusable template
- [x] 4. Update `server/routes/auth.js` - Rate limiting, fix duplicate temp users, clean logic
- [x] 5. Update `server/index.js` - Call `verifySMTPConnection()` on startup
- [x] 6. Update `server/config.js` - Minor cleanup/comments
- [x] 7. Create `.env` template file
