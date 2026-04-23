# Signup System Testing Guide

## Quick Test Cases

### ✅ Test 1: Customer Signup - Happy Path
**Steps:**
1. Go to `/auth/customer-signup`
2. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: (555) 123-4567
   - Password: Test@1234
   - Confirm Password: Test@1234
   - Vehicle Type: Car
   - Vehicle Make: Toyota
   - Vehicle Model: Camry
   - Vehicle Year: 2020
3. Check "I agree to terms"
4. Click "Create Driver Account"

**Expected Result:**
- Form validates successfully
- API call succeeds
- Success message displays
- Redirects to login page after 2 seconds
- Check database: new user in auth, profile record created with user_type='customer'

---

### ✅ Test 2: Mechanic Signup - Happy Path
**Steps:**
1. Go to `/auth/mechanic-signup`
2. Fill in:
   - First Name: Jane
   - Last Name: Smith
   - Business Name: Smith Auto Repair
   - Email: jane@repair.com
   - Phone: (555) 987-6543
   - City: New York
   - State: NY
   - Years of Experience: 5
   - Password: Secure@2024
   - Confirm Password: Secure@2024
3. Check "I agree to terms"
4. Click "Create Service Provider Account"

**Expected Result:**
- Form validates successfully
- API call succeeds
- Success message displays
- Redirects to login page after 2 seconds
- Check database: new user in auth, profile record with user_type='mechanic', mechanics record created

---

### ❌ Test 3: Invalid Email
**Steps:**
1. On customer signup form
2. Enter email: "notanemail"
3. Move to next field (blur event)

**Expected Result:**
- Error message: "Invalid email address"
- Field highlighted in red
- Submit button disabled

---

### ❌ Test 4: Weak Password
**Steps:**
1. On customer signup form
2. Enter password: "test"
3. Move to next field

**Expected Result:**
- Error message: "Password must be at least 8 characters"
- Or if you enter "test1234": "Password must contain at least one uppercase letter"

---

### ❌ Test 5: Password Mismatch
**Steps:**
1. On customer signup form
2. Enter password: "Test@1234"
3. Enter confirm password: "Test@5678"
4. Try to submit

**Expected Result:**
- Error message: "Passwords do not match"
- Form doesn't submit

---

### ❌ Test 6: Missing Required Fields
**Steps:**
1. On customer signup form
2. Leave "First Name" empty
3. Click submit

**Expected Result:**
- Validation error on first name field
- Form doesn't submit
- Error message displayed

---

### ❌ Test 7: Duplicate Email
**Steps:**
1. Customer signup with email: test@example.com
2. Wait for success
3. Try customer signup again with same email

**Expected Result:**
- Server error message: "User already exists"
- Form shows error alert
- Not redirected

---

### ❌ Test 8: Invalid Phone Format
**Steps:**
1. On customer signup form
2. Enter phone: "123" (too short)
3. Move to next field

**Expected Result:**
- Error message: "Invalid phone number format"
- Field highlighted

---

### ✅ Test 9: Optional Fields
**Steps:**
1. On customer signup form
2. Fill only required fields (skip vehicle info)
3. Complete signup

**Expected Result:**
- Form accepts submission
- Profile created with null vehicle fields
- Signup succeeds

---

### ✅ Test 10: Mechanic - All Optional Fields Empty
**Steps:**
1. On mechanic signup form
2. Fill only required fields (skip city, state, experience)
3. Complete signup

**Expected Result:**
- Form accepts submission
- Mechanic record created with nulls in optional fields
- Signup succeeds

---

### ✅ Test 11: Terms Checkbox Required
**Steps:**
1. On customer signup form
2. Fill all fields correctly
3. Leave "I agree to terms" unchecked
4. Try to submit

**Expected Result:**
- Validation error: "You must agree to the terms and conditions"
- Form doesn't submit

---

### ✅ Test 12: Loading State
**Steps:**
1. On customer signup form
2. Fill form correctly
3. Click submit
4. Observe button during submission

**Expected Result:**
- Button shows loading spinner
- Button text changes to "Creating Account..."
- Button is disabled
- Form inputs are disabled
- Spinner disappears after success/error

---

### ✅ Test 13: Error Alert Display
**Steps:**
1. On customer signup form
2. Enter invalid data (e.g., weak password)
3. Attempt to submit

**Expected Result:**
- Red error alert appears at top
- Alert shows specific error message
- User can correct and try again

---

### ✅ Test 14: Cross-Link Navigation
**Steps:**
1. On customer signup page
2. Look for link "Are you a mechanic? Sign up here"
3. Click it

**Expected Result:**
- Navigate to `/auth/mechanic-signup`

**Also test:**
- From mechanic signup: "Are you a driver? Sign up here" → `/auth/customer-signup`

---

### ✅ Test 15: Mobile Responsiveness
**Steps:**
1. Open customer signup on mobile (375px width)
2. Fill form
3. Submit

**Expected Result:**
- Form is readable
- Inputs are accessible
- No horizontal scroll needed
- Two-column layouts stack to one column

---

## Database Verification Queries

### Check Customer Profile Created
```sql
SELECT * FROM profiles 
WHERE email = 'john@example.com' 
AND user_type = 'customer';
```

**Expected:** One row with all vehicle info filled in

### Check Mechanic Profile Created
```sql
SELECT * FROM profiles 
WHERE email = 'jane@repair.com' 
AND user_type = 'mechanic';
```

**Expected:** One row with mechanic user type

### Check Mechanic Record Created
```sql
SELECT * FROM mechanics 
WHERE email = 'jane@repair.com';
```

**Expected:** One row with business name and contact info

### Check User in Auth
```sql
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'john@example.com';
```

**Expected:** User exists with metadata containing first_name, last_name, user_type

---

## API Testing (Using Curl/Postman)

### Test Customer Signup API
```bash
curl -X POST http://localhost:3000/api/auth/signup-customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "(555) 123-4567",
    "vehicleType": "Car"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer account created successfully",
  "userId": "uuid-here",
  "requiresEmailVerification": true
}
```

### Test Mechanic Signup API
```bash
curl -X POST http://localhost:3000/api/auth/signup-mechanic \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mechanic@example.com",
    "password": "Test@1234",
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "(555) 987-6543",
    "businessName": "Smith Repair"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Mechanic account created successfully",
  "userId": "uuid-here",
  "requiresEmailVerification": true
}
```

### Test Invalid Data
```bash
curl -X POST http://localhost:3000/api/auth/signup-customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "weak",
    "firstName": "J"
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required fields"
}
```

---

## Validation Testing Checklist

### Email Validation
- [ ] Valid email: john@example.com ✅
- [ ] No @ sign: johnexample.com ❌
- [ ] No domain: john@ ❌
- [ ] No extension: john@example ❌

### Password Validation
- [ ] Length: "Test@1234" ✅
- [ ] Too short: "Test@12" ❌
- [ ] No uppercase: "test@1234" ❌
- [ ] No number: "Test@abcd" ❌

### Phone Validation
- [ ] Standard: "(555) 123-4567" ✅
- [ ] With +1: "+1 555 123 4567" ✅
- [ ] Dashes: "555-123-4567" ✅
- [ ] Too short: "555-123" ❌
- [ ] Non-numeric: "abc-def-ghij" ❌

### Name Validation
- [ ] Valid: "John" ✅
- [ ] Too short: "J" ❌
- [ ] Too long: "A very very very very very long name..." ❌

---

## Performance Testing

### Test Multiple Signups
1. Create 5 different customer accounts
2. Create 5 different mechanic accounts
3. Check all are in database correctly

**Expected:** All records created without errors

### Test Concurrent Requests
1. Open signup form in multiple tabs
2. Submit all at same time
3. Wait for completion

**Expected:** All complete successfully without conflicts

---

## Error Scenario Testing

### Network Error
1. Disconnect internet
2. Fill form and submit

**Expected:** 
- Error message: "An unexpected error occurred"
- No timeout waiting forever

### Server Error (500)
1. Mock server error in development
2. Submit form

**Expected:**
- Error message: "An unexpected error occurred"
- User can retry

### Duplicate Email
1. Create account with test@example.com
2. Try again with same email

**Expected:**
- Error message: "User already exists" or "Email already registered"

---

## Checklist: All Issues Fixed

- [ ] Form validation working ✅
- [ ] Data being saved to database ✅
- [ ] Multiple signup pages consolidated ✅
- [ ] Consistent form fields ✅
- [ ] Profile creation on signup ✅
- [ ] Mechanic records created ✅
- [ ] Proper error handling ✅
- [ ] Loading states working ✅
- [ ] Success messages displaying ✅
- [ ] Cross-links between signup pages ✅
- [ ] Mobile responsive ✅
- [ ] Type safety with TypeScript ✅

---

## Known Test Accounts (After Testing)

Customer:
- Email: test-customer@example.com
- Password: Test@1234
- Name: Test Customer

Mechanic:
- Email: test-mechanic@example.com
- Password: Test@1234
- Business: Test Repair Shop

---

## Notes for Developers

1. **Always check browser console** for any [v0] debug logs
2. **Check Network tab** in DevTools to see API calls
3. **Check database** to confirm records were created
4. **Test on mobile** - use DevTools device emulation
5. **Clear localStorage** between tests if needed
6. **Check email** - verify email verification flow works
7. **Check auth state** - verify user is logged in after signup

---

## Common Issues & Solutions

### Issue: Form not submitting
**Solution:** 
- Check for validation errors on each field
- Open DevTools > Network tab to see API response
- Check console for errors

### Issue: Data not in database
**Solution:**
- Verify API endpoint called successfully (Network tab)
- Check Supabase dashboard for tables
- Verify profiles table has correct columns

### Issue: Redirect not working
**Solution:**
- Check if login page exists at `/auth/login`
- Check browser console for navigation errors
- Verify router import is correct

### Issue: Email validation failing
**Solution:**
- Make sure @ and . are in email
- Example: user@domain.com ✅

### Issue: Password validation failing
**Solution:**
- Minimum 8 characters
- At least 1 uppercase (A-Z)
- At least 1 number (0-9)
- Example: Test@1234 ✅
