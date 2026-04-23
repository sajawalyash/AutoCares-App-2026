# AutoCares Registration Guide

## Overview

AutoCares now features a dual registration system supporting both **Customers** and **Mechanics**. This allows both drivers needing roadside assistance and service providers to sign up and use the platform.

## Registration Flow

### 1. Initial Registration Selection
**Route:** `/auth/register`

Users start at a role selection page where they can choose between:

#### **Customer Registration**
- For drivers/riders needing roadside assistance
- Access to AI troubleshooting, mechanic discovery, service tracking
- Features:
  - Request roadside assistance
  - Get help in minutes
  - AI-powered vehicle troubleshooting
  - Track mechanics in real-time

#### **Mechanic Registration**
- For service providers and mechanics
- Access to service requests and customer management
- Features:
  - Receive service requests from customers
  - Build reputation and ratings
  - Manage availability
  - Grow income

---

## Customer Registration

**Route:** `/auth/customer-signup`

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full Name | Text | Yes | Customer's full name |
| Email | Email | Yes | Email address for account login |
| Phone Number | Tel | Yes | Contact phone number |
| Vehicle Type | Select | Yes | Car, Motorcycle/Bike, Scooter, or Truck |
| Vehicle Model | Text | No | Model and year (e.g., Toyota Camry 2020) |
| License Plate | Text | No | Vehicle license plate number |
| Password | Password | Yes | Minimum 8 characters |
| Confirm Password | Password | Yes | Must match password field |

### Data Storage

Customer data is stored in two tables:

**`auth.users`** (Supabase Auth)
- id (UUID)
- email
- password_hash
- created_at
- updated_at

**`public.profiles`**
- id (references auth.users)
- full_name
- phone
- vehicle_type
- vehicle_model
- vehicle_plate
- avatar_url
- is_admin (default: false)
- is_mechanic (default: false)
- created_at
- updated_at

### Post-Registration

1. Account created in Supabase Auth
2. Customer profile automatically created
3. User redirected to `/auth/signup-success` confirmation page
4. User can then login and access dashboard

---

## Mechanic Registration

**Route:** `/auth/mechanic-signup`

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full Name | Text | Yes | Mechanic's full name |
| Email | Email | Yes | Email address for account login |
| Phone Number | Tel | Yes | Business contact phone |
| Business Name | Text | Yes | Name of the mechanics shop/business |
| License Number | Text | Yes | Professional mechanic license number (unique) |
| Years of Experience | Number | No | Years in the field (0+) |
| Latitude | Number | No | Business location latitude |
| Longitude | Number | No | Business location longitude |
| Password | Password | Yes | Minimum 8 characters |
| Confirm Password | Password | Yes | Must match password field |

### Data Storage

Mechanic data is stored in two tables:

**`auth.users`** (Supabase Auth)
- id (UUID)
- email
- password_hash
- created_at
- updated_at

**`public.mechanics`**
- id (references auth.users)
- business_name (required)
- license_number (required, unique)
- phone (required)
- latitude (nullable)
- longitude (nullable)
- rating (default: 0)
- is_verified (default: false)
- experience_years
- avatar_url
- created_at
- updated_at

### Post-Registration

1. Account created in Supabase Auth
2. Mechanic profile automatically created (not verified)
3. User redirected to `/auth/signup-success` confirmation page
4. **Important:** Account must be verified by admin before accepting service requests
5. Admin verifies mechanic in admin dashboard
6. Once verified, mechanic can accept service requests

---

## Authentication Flow

### Login
**Route:** `/auth/login`

Both customers and mechanics use the same login interface:

```
Email → Password → Dashboard
```

The system automatically detects user type and redirects appropriately.

### Session Management

- Supabase Auth handles JWT tokens
- HTTP-only cookies store session
- Middleware validates auth on protected routes
- Auto-logout on token expiration

---

## Database RLS Policies

### Customer Profiles
```sql
-- Customers can view/update their own profile
SELECT: auth.uid() = id
UPDATE: auth.uid() = id
INSERT: auth.uid() = id
```

### Mechanic Profiles
```sql
-- Anyone can view mechanic profiles (for discovery)
SELECT: true (public)

-- Mechanics can update their own profile
UPDATE: auth.uid() = id

-- Mechanics can insert their own profile
INSERT: auth.uid() = id
```

---

## Integration with Database Schema

### profiles table
```typescript
interface Profile {
  id: string; // UUID
  full_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_mechanic: boolean;
  created_at: string;
  updated_at: string;
}
```

### mechanics table
```typescript
interface Mechanic {
  id: string; // UUID
  business_name: string;
  license_number: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  is_verified: boolean;
  experience_years?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Admin Verification Process

### Mechanic Verification Workflow

1. **New Registration**
   - Mechanic creates account → `is_verified = false`
   - Admin sees pending mechanics in dashboard

2. **Admin Review**
   - Admin checks mechanic details
   - Verifies license number (manually or via API)
   - Reviews business information

3. **Approval/Rejection**
   - Admin clicks "Verify" button
   - `is_verified` flag set to `true`
   - Mechanic receives email notification

4. **After Approval**
   - Mechanic can view service requests
   - Can accept/reject requests
   - Appears in mechanic discovery for customers

### Admin Dashboard Mechanic Verification
**Route:** `/admin`

Features:
- Pending mechanic list
- License verification
- One-click approval
- Business details review
- Rejection with feedback

---

## Navigation Updates

### Updated Routes

| Route | Purpose | Change |
|-------|---------|--------|
| `/auth/register` | Role selection | NEW - Entry point for registration |
| `/auth/customer-signup` | Customer form | NEW - Customer registration |
| `/auth/mechanic-signup` | Mechanic form | NEW - Mechanic registration |
| `/auth/login` | Login page | UPDATED - Links to `/auth/register` |
| `/auth/signup` | (Deprecated) | Old customer form - kept for compatibility |
| `/` | Landing page | UPDATED - "Get Started" → `/auth/register` |

---

## Error Handling

### Common Registration Errors

```
1. "Email already in use"
   - User already has an account
   - Action: Use login page or reset password

2. "Passwords do not match"
   - Password and confirm password fields different
   - Action: Re-enter matching passwords

3. "Password must be at least 8 characters"
   - Password too weak
   - Action: Use stronger password

4. "Business name and license number are required"
   - Mechanic form incomplete
   - Action: Fill in all required fields

5. "License number already exists"
   - Another mechanic has this license
   - Action: Verify license number
```

---

## Email Verification

### Welcome Email

After registration, user receives welcome email with:

```
- Welcome message
- Account confirmation link
- Email: [callback URL]
- Redirect: /auth/callback
```

### Mechanic-Specific Email

After registration, mechanic receives:

```
- Welcome message
- Account confirmation link
- Verification status notification
- Link to mechanic dashboard (once verified)
```

---

## Security Considerations

✅ **Implemented:**
- Email verification required
- Password hashing (bcrypt via Supabase)
- RLS policies on all tables
- Session-based auth
- HTTP-only cookies

⚠️ **Recommendations:**
1. Enable email confirmation for customers
2. Implement SMS verification for phone numbers
3. Rate limit registration endpoints
4. Add CAPTCHA to prevent bot registration
5. Verify mechanic licenses via third-party API

---

## Testing Registration

### Test Scenarios

#### Customer Registration
```
1. Navigate to /auth/register
2. Click "Driver/Customer" card
3. Fill in all fields
4. Submit form
5. Verify redirect to signup-success
6. Check profiles table in Supabase
7. Login with new credentials
```

#### Mechanic Registration
```
1. Navigate to /auth/register
2. Click "Mechanic/Service Provider" card
3. Fill in all fields
4. Submit form
5. Verify redirect to signup-success
6. Check mechanics table (is_verified = false)
7. Admin approves in /admin
8. Mechanic can now login
```

---

## Future Enhancements

🔜 **Planned Features:**

1. **Social Registration**
   - Google OAuth
   - Apple OAuth
   - Facebook OAuth

2. **Verification Automation**
   - License number API validation
   - Identity verification
   - Email domain verification

3. **Profile Completion**
   - Photo upload
   - Certification display
   - Insurance verification

4. **Two-Factor Authentication**
   - SMS OTP
   - Authenticator app
   - Email verification codes

5. **Profile Enrichment**
   - Service specialties (for mechanics)
   - Availability calendar
   - Service coverage area
   - Pricing information

---

## Support & Troubleshooting

### Supabase Console

View registration data:
1. Go to Supabase Dashboard
2. Select project
3. Navigate to "SQL Editor"
4. Query tables:
   - `SELECT * FROM auth.users`
   - `SELECT * FROM public.profiles`
   - `SELECT * FROM public.mechanics`

### Common Issues

**Issue:** User can't login after registration
- **Solution:** Check email verification status in Supabase Auth

**Issue:** Mechanic can't accept requests
- **Solution:** Verify `is_verified = true` in mechanics table

**Issue:** Profile not created
- **Solution:** Check RLS policies and database permissions

---

## Summary

The new registration system provides:

✅ Separate flows for customers and mechanics
✅ Automatic profile creation
✅ Mechanic verification workflow
✅ Secure password handling
✅ Email verification
✅ Role-based access control
✅ Scalable architecture

Users can now easily register and start using AutoCares!
