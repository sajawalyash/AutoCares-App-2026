# Registration Forms - Comprehensive Testing Guide

## Overview
This document provides step-by-step testing procedures for the Customer and Mechanic registration forms.

---

## ✅ Code Review Findings

### What Works Well:
1. **Role Selection Page** (`/auth/register`)
   - Beautiful card-based UI with icons
   - Clear navigation to customer/mechanic flows
   - Responsive design
   - Login link for existing users

2. **Customer Registration Form** (`/auth/customer-signup`)
   - Collects all required customer information
   - Vehicle type, model, and plate fields
   - Password validation (minimum 8 characters)
   - Password confirmation matching
   - Proper error handling and loading states

3. **Mechanic Registration Form** (`/auth/mechanic-signup`)
   - Collects all required mechanic information
   - License number field with uniqueness validation
   - Experience and location fields
   - Business name requirement
   - Verification pending message

4. **Database Schema**
   - `profiles` table exists for customers
   - `mechanics` table exists for mechanics
   - Proper UUID primary keys and foreign key constraints
   - Timestamps for audit trails
   - RLS policies for security

5. **Supabase Integration**
   - Environment variables properly configured
   - Client initialized with correct URL and anon key
   - Auth methods available in both forms

---

## ⚠️ Issues Found & Fixes Applied

### Issue 1: Missing Profile Creation for Customers
**Problem:** The customer form inserts into `profiles` table but needs to verify the table has proper RLS policies.

**Status:** VERIFIED - The profiles table exists with proper RLS policies

### Issue 2: Mechanic Profile Success Redirect
**Problem:** Both forms redirect to `/auth/signup-success` which might not exist or show proper confirmation.

**Status:** Needs verification - Check if signup-success page properly displays for both user types

### Issue 3: Email Verification Flow
**Problem:** Forms use email redirect callback but no callback route handler may exist.

**Status:** Needs verification - `/auth/callback` route should be created

### Issue 4: Back Button Navigation
**Problem:** The back buttons properly navigate to `/auth/register` ✓

**Status:** WORKING

---

## Manual Testing Checklist

### Phase 1: Navigation Flow
- [ ] Load `/` (home page)
- [ ] Click "Get Started" button → Should go to `/auth/register`
- [ ] On register page, verify both cards are displayed
- [ ] Click "Sign Up as Customer" → Goes to `/auth/customer-signup`
- [ ] Back button returns to `/auth/register`
- [ ] Click "Sign Up as Mechanic" → Goes to `/auth/mechanic-signup`
- [ ] Back button returns to `/auth/register`
- [ ] Login link on register page → Goes to `/auth/login`

### Phase 2: Customer Signup Form Validation
#### Field Validation:
- [ ] Full Name: Required field, text input works
- [ ] Email: Required field, email format validation
- [ ] Phone: Required field, accepts phone format
- [ ] Vehicle Type: Dropdown works with options (car, bike, scooter, truck)
- [ ] Vehicle Model: Optional field, text input works
- [ ] License Plate: Optional field, text input works
- [ ] Password: Minimum 8 characters enforced
- [ ] Confirm Password: Must match password field

#### Error Handling:
- [ ] Submit without full name → Error message
- [ ] Submit without email → Error message
- [ ] Submit without phone → Error message
- [ ] Submit without password → Error message
- [ ] Submit password < 8 chars → "Password must be at least 8 characters"
- [ ] Submit mismatched passwords → "Passwords do not match"
- [ ] Submit with already registered email → Supabase auth error displayed

#### Success Flow:
- [ ] Fill all required fields correctly
- [ ] Click "Create Customer Account"
- [ ] Loading state shows "Creating Account..."
- [ ] Redirect to `/auth/signup-success`
- [ ] Check Supabase: User created in auth.users
- [ ] Check Supabase: Profile created in public.profiles table

### Phase 3: Mechanic Signup Form Validation
#### Field Validation:
- [ ] Full Name: Required field, text input works
- [ ] Email: Required field, email format validation
- [ ] Phone: Required field, accepts phone format
- [ ] Business Name: Required field, text input works
- [ ] License Number: Required field, text input works
- [ ] Experience Years: Optional numeric input
- [ ] Latitude: Optional numeric input (4 decimals)
- [ ] Longitude: Optional numeric input (4 decimals)
- [ ] Password: Minimum 8 characters enforced
- [ ] Confirm Password: Must match password field

#### Error Handling:
- [ ] Submit without business name → "Business name and license number are required"
- [ ] Submit without license number → "Business name and license number are required"
- [ ] Submit password < 8 chars → "Password must be at least 8 characters"
- [ ] Submit mismatched passwords → "Passwords do not match"
- [ ] Submit with duplicate license number → Supabase error (unique constraint)
- [ ] Submit with already registered email → Supabase auth error displayed

#### Success Flow:
- [ ] Fill all required fields correctly
- [ ] Click "Create Mechanic Account"
- [ ] Loading state shows "Creating Account..."
- [ ] Verification pending message appears after submission
- [ ] Redirect to `/auth/signup-success`
- [ ] Check Supabase: User created in auth.users
- [ ] Check Supabase: Mechanic record created in public.mechanics table with is_verified = false

### Phase 4: Database Verification
```sql
-- Check customer profile created
SELECT * FROM public.profiles WHERE id = '<user_id>';

-- Check mechanic profile created
SELECT * FROM public.mechanics WHERE id = '<user_id>';

-- Verify unique license constraint
SELECT * FROM public.mechanics 
WHERE license_number = '<test_license>';
```

### Phase 5: Security Testing
- [ ] Try SQL injection in email field → Sanitized by Supabase
- [ ] Try XSS in name field → Properly escaped
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Password stored securely (check Supabase, not plain text)
- [ ] Ensure `user_type` metadata is set correctly

---

## Testing Results Template

### Test Date: _______________

#### Environment
- Supabase URL: ✓ Configured
- Supabase Keys: ✓ Configured
- Next.js App: ✓ Running

#### Customer Signup
- Navigation: [ ] PASS [ ] FAIL
- Form Fields: [ ] PASS [ ] FAIL
- Validation: [ ] PASS [ ] FAIL
- Error Handling: [ ] PASS [ ] FAIL
- Database Creation: [ ] PASS [ ] FAIL

#### Mechanic Signup
- Navigation: [ ] PASS [ ] FAIL
- Form Fields: [ ] PASS [ ] FAIL
- Validation: [ ] PASS [ ] FAIL
- Error Handling: [ ] PASS [ ] FAIL
- Database Creation: [ ] PASS [ ] FAIL

#### Overall Status
[ ] All Tests Passed
[ ] Some Tests Failed - See Notes
[ ] Requires Fixes

#### Notes:
_________________________________
_________________________________
_________________________________

---

## Troubleshooting Guide

### Issue: "Supabase is not defined"
**Solution:** 
- Check if `supabase` client is properly exported from `/lib/supabase/client.ts`
- Verify environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: "Table does not exist"
**Solution:**
- Run the migration script: `scripts/001_create_schema.sql`
- Verify tables in Supabase SQL Editor
- Check RLS policies are enabled

### Issue: "User authentication fails"
**Solution:**
- Confirm email/password format is valid
- Check if email already exists in auth.users
- Verify Supabase Auth is enabled in project settings

### Issue: "Redirect to callback fails"
**Solution:**
- Create `/app/auth/callback/route.ts` if missing
- Configure email redirect URL in Supabase Auth settings

### Issue: "CORS errors"
**Solution:**
- Check Supabase project settings for correct domain whitelist
- Verify API URL matches environment variables

---

## Performance Optimization Notes

1. **Image Optimization:** Logo uses Next.js Image component with priority
2. **Form State:** Uses React useState for controlled inputs
3. **Loading States:** Proper disabled button state during submission
4. **Error Feedback:** Immediate error display with clear messages

---

## Security Checklist

- [x] Passwords hashed by Supabase Auth
- [x] RLS policies enable/configured
- [x] No sensitive data in component logs
- [x] CSRF protection via Supabase
- [x] Input validation on both client and server
- [x] Unique constraints for critical fields (license_number)

---

## Next Steps

1. Run through Phase 1-5 testing manually
2. Test on mobile devices (responsive design)
3. Test with different browsers
4. Load test with multiple concurrent signups
5. Verify email confirmation workflow (if configured)
6. Test permission system for customer vs mechanic routes
