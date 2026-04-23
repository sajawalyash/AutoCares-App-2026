# AutoCares - Quick Start Guide

Get AutoCares running in 5 minutes!

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
```

The project already includes all necessary dependencies:
- Next.js 16
- React 19
- Supabase
- Tailwind CSS
- Lucide React icons
- Recharts

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Get these from:**
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key from Settings → API

### 3. Set Up Supabase Database

The database schema is ready in `/scripts/001_create_schema.sql`

**Option A: Using Supabase Dashboard**
1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy & paste contents of `scripts/001_create_schema.sql`
4. Click "Run"

**Option B: Using supabase-cli**
```bash
npm install -g supabase
supabase db push scripts/001_create_schema.sql
```

### 4. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🗺️ Explore the App

### Public Pages (No Login Required)
- **Home**: [http://localhost:3000](http://localhost:3000) - Landing page
- **Sign Up**: [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up) - Register
- **Login**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login) - Login

### Protected Pages (After Login)
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) - Main hub
- **AI Chatbot**: [http://localhost:3000/troubleshoot](http://localhost:3000/troubleshoot) - Vehicle troubleshooting
- **Request Help**: [http://localhost:3000/request-assistance](http://localhost:3000/request-assistance) - Service request
- **Find Mechanics**: [http://localhost:3000/nearby-mechanics](http://localhost:3000/nearby-mechanics) - Mechanics directory
- **Track Service**: [http://localhost:3000/track-service](http://localhost:3000/track-service) - Live tracking
- **Profile**: [http://localhost:3000/profile](http://localhost:3000/profile) - User profile
- **Emergency SOS**: [http://localhost:3000/sos](http://localhost:3000/sos) - Emergency assistance

### Admin Pages
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) - Analytics & management

## 🧪 Test the App

### 1. Create a Test Account
1. Go to http://localhost:3000/auth/sign-up
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Phone: +1 (555) 123-4567
   - Vehicle Type: Car
   - Password: TestPassword123!
3. Click "Sign Up"

### 2. Verify Email (Optional)
- Check your email (or Supabase dashboard) for verification link
- Click the link to confirm

### 3. Login
1. Go to http://localhost:3000/auth/login
2. Enter your credentials
3. Click "Login"

### 4. Explore Features
- Click around the dashboard
- Try the chatbot
- Test service requests
- View mechanics list
- Check tracking page

## 📁 Project Structure

```
autocares/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # User dashboard
│   ├── troubleshoot/page.tsx # AI chatbot
│   ├── request-assistance/   # Service request
│   ├── nearby-mechanics/     # Mechanics list
│   ├── track-service/        # Service tracking
│   ├── profile/page.tsx      # User profile
│   ├── sos/page.tsx          # Emergency SOS
│   ├── admin/page.tsx        # Admin dashboard
│   ├── auth/                 # Auth pages
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Tailwind styles
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── proxy.ts          # Session proxy
│   └── utils.ts              # Utilities
├── middleware.ts             # Auth middleware
├── scripts/
│   └── 001_create_schema.sql # Database schema
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.mjs           # Next.js config
└── tailwind.config.ts        # Tailwind config
```

## 🎨 Customization

### Change Brand Colors
Edit color values in any component:
```tsx
// From
className="bg-blue-600"
// To
className="bg-purple-600"
```

### Change App Name
1. Edit `app/layout.tsx` - metadata.title
2. Edit components - Logo text
3. Run `pnpm build` to update

### Add New Pages
1. Create `app/[page-name]/page.tsx`
2. Copy component structure from existing pages
3. Add to navigation
4. Test at `http://localhost:3000/[page-name]`

## 🔧 Common Tasks

### Check Database
1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Click "Favorites" or browse tables
4. View data in real-time

### View Logs
```bash
# Terminal shows logs in development
# Look for any [v0] prefixed debug messages
```

### Clear Database
1. Go to Supabase dashboard
2. Click on table
3. Select all rows
4. Click "Delete"

Or run SQL:
```sql
DELETE FROM public.chatbot_faq;
DELETE FROM public.service_history;
DELETE FROM public.chat_messages;
DELETE FROM public.service_requests;
DELETE FROM public.mechanics;
DELETE FROM public.profiles;
```

## 📦 Build for Production

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

Deploy to Vercel:
```bash
npm install -g vercel
vercel deploy
```

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
pnpm install @supabase/supabase-js @supabase/ssr
```

### "Environment variables not loaded"
1. Check `.env.local` exists in root
2. Verify variable names are exact
3. Restart dev server: `Ctrl+C` then `pnpm dev`

### "Supabase connection error"
1. Verify SUPABASE_URL is correct
2. Verify SUPABASE_ANON_KEY is correct
3. Check internet connection
4. Try again in Supabase dashboard

### "Database table doesn't exist"
1. Run SQL from `scripts/001_create_schema.sql`
2. Check Supabase dashboard for tables
3. Verify RLS policies are enabled

### "Login not working"
1. Check .env.local variables
2. Verify email is confirmed in Supabase
3. Check browser console for errors
4. Try signing up with new email

## 📚 Learn More

Read these files for detailed info:

- **[AUTOCARES_README.md](./AUTOCARES_README.md)** - Complete documentation
- **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - Backend integration
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview

## 🚀 Next Steps

### Short Term (This Week)
1. ✅ Set up and run locally
2. Create test accounts
3. Explore all pages
4. Customize colors/fonts
5. Read full documentation

### Medium Term (This Month)
1. Integrate Google Maps API
2. Connect to real backend
3. Set up email notifications
4. Add payment processing
5. Deploy to Vercel

### Long Term (This Quarter)
1. Build mechanic mobile app
2. Add push notifications
3. Create admin management tools
4. Set up analytics
5. Launch publicly

## 💬 Questions?

Check these resources:
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs

## 🎯 Key Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Dependencies
pnpm install          # Install dependencies
pnpm add <package>    # Add new package
pnpm remove <package> # Remove package
```

## ✅ Checklist

Before deploying to production:

- [ ] Environment variables set
- [ ] Database schema created
- [ ] Email confirmation working
- [ ] Login/signup tested
- [ ] All pages load without errors
- [ ] Mobile responsive tested
- [ ] Forms validated
- [ ] Error messages display properly
- [ ] Performance tested
- [ ] Security audit completed

## 🎉 You're All Set!

AutoCares is ready to go. Start with `pnpm dev` and explore!

---

**Need help?** Check the documentation files or review the code comments.

**Ready to deploy?** See deployment instructions in AUTOCARES_README.md
