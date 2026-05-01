# TODO - OTP 500 Error Fixes

## Task Details
Fix the 500 error on `/api/auth/send-phone-otp` and `/api/auth/send-email-otp` endpoints.

## Identified Issues
1. **Password validation issue**: When creating temp users with `Math.random().toString(36)`, the password might be less than 6 characters causing Mongoose validation failure
2. **Missing proper error handling**: Need better error handling in auth routes for database operations
3. **Regex filtering issue**: Using `$not: /^temp_/` in MongoDB queries doesn't work correctly

## Plan

### Step 1: Fix User Model
- Make `password` field not required (since temp users might not have passwords initially)
- Add optional validation with a pre-check for temp users

### Step 2: Fix Auth Routes (auth.js)
- Add try-catch with better error logging
- Fix regex filters to use proper MongoDB regex syntax  
- Ensure passwords are always at least 6 characters

### Step 3: Test Fixes
- Verify the fixes work by testing the API endpoints

## Status
- [x] Analyzed the issue
- [x] Fix User model password validation
- [x] Fix auth routes error handling and regex
- [ ] Test the fixes
