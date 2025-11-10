# 🚀 GaragePro Quick Start Card

## 🏃‍♂️ Get Running in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Push database schema
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. Start development server
npm run dev
```

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@garage.com` | `Admin@123456` |
| 🏪 Owner | `owner@garage.com` | `Owner@123456` |
| 👤 User | `user@garage.com` | `User@123456` |

## 🌐 Routes

### Public
- `/` - Landing page (auto-redirects if logged in)
- `/garages` - Browse garages
- `/garages/[id]` - Garage details & booking
- `/auth/login` - Sign in
- `/auth/register` - Sign up

### User (Authenticated)
- `/dashboard` - My appointments

### Owner (OWNER role)
- `/owner/dashboard` - Manage garages & appointments
- `/owner/garage` - Create/edit garage
- `/owner/subscription?garageId=xxx` - Subscribe to premium

### Admin (ADMIN role)
- `/admin/dashboard` - Platform analytics & garage approval

## 💳 Stripe Test Cards

```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔐 3D Secure: 4000 0025 0000 3155

Expiry: 12/25 | CVC: 123 | ZIP: 12345
```

## 📁 Key Files

```
app/
├── page.tsx               # Landing page
├── auth/                  # Login & Register
├── garages/               # Browse & Details
├── dashboard/             # User dashboard
├── owner/
│   ├── dashboard/         # Owner dashboard
│   ├── garage/            # Garage CRUD
│   └── subscription/      # Subscribe to premium
├── admin/dashboard/       # Admin analytics
└── api/
    ├── garages/           # Garage APIs
    ├── appointments/      # Appointment APIs
    ├── uploadthing/       # Image upload
    ├── admin/             # Admin APIs
    └── stripe/            # Subscription APIs
```

## 🛠️ Common Commands

```bash
# Database
npx prisma db push           # Update database schema
npx prisma generate          # Generate Prisma client
npx prisma studio            # Open database GUI

# Development
npm run dev                  # Start dev server
npm run build                # Build for production
npm run start                # Start production server

# Stripe (after installation)
stripe login                 # Login to Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🎨 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 Authentication | ✅ | NextAuth.js with email/password |
| 👥 Role-based Access | ✅ | USER, OWNER, ADMIN roles |
| 🏪 Garage Management | ✅ | CRUD operations with images |
| 📅 Appointments | ✅ | Book, estimate, confirm, complete |
| 💰 Subscriptions | ✅ | Monthly/yearly plans with Stripe |
| 📊 Analytics | ✅ | Charts for admin dashboard |
| 📱 Responsive Design | ✅ | Mobile-first Tailwind CSS |
| 🖼️ Image Upload | ✅ | UploadThing integration |
| ✉️ Notifications | ✅ | Toast notifications |

## 📝 Environment Variables Needed

```env
# Database (Neon PostgreSQL)
DATABASE_URL='postgresql://...'

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe (See STRIPE_SETUP.md)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# UploadThing (Already configured)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your_app_id"
```

## 🚦 Getting Started Workflow

1. **Install & Setup**
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```

2. **Login as Admin**
   - Go to http://localhost:3000/auth/login
   - Email: `admin@garage.com`
   - Password: `Admin@123456`

3. **Create Garage as Owner**
   - Login as owner@garage.com
   - Go to Owner Dashboard
   - Click "Create New Garage"
   - Fill details and upload images

4. **Approve Garage as Admin**
   - Login as admin
   - Go to Admin Dashboard → Garages tab
   - Click "Approve" on pending garage

5. **Subscribe to Premium**
   - Login as owner
   - Click "Upgrade to Premium"
   - Use test card: 4242 4242 4242 4242
   - Complete payment

6. **Book Appointment as User**
   - Login as user@garage.com
   - Browse garages
   - Click garage → "Request Appointment"
   - Fill details and submit

7. **Manage Appointment as Owner**
   - Login as owner
   - Go to Owner Dashboard
   - View pending appointment
   - Provide estimate (cost + duration)
   - Click "Confirm Appointment"

## 📚 Documentation

- `STRIPE_SETUP.md` - Complete Stripe configuration guide
- `SUBSCRIPTION_COMPLETE.md` - Subscription implementation details
- `README.md` - Full project documentation

## 🐛 Troubleshooting

**Database errors?**
```bash
npx prisma db push --force-reset
npx prisma generate
```

**Prisma client errors?**
```bash
npm install @prisma/client
npx prisma generate
```

**Stripe webhook not working locally?**
```bash
# Install Stripe CLI first
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy webhook secret to .env
```

**Images not uploading?**
- Check UploadThing keys in .env
- Max file size: 4MB
- Max files: 5 images
- Supported: JPG, PNG, WebP

## ⚡ Pro Tips

- Use `npx prisma studio` to view database visually
- Check browser console for API errors
- Use React DevTools to inspect component state
- Monitor Stripe Dashboard for payment events
- Test subscriptions in Stripe Test Mode first

## 🎯 Next Steps

1. ✅ App is running
2. ⏳ Configure Stripe (follow STRIPE_SETUP.md)
3. ⏳ Test subscription flow
4. ⏳ Deploy to Vercel/production
5. ⏳ Switch Stripe to live mode

---

**Need help?** Check the full documentation in README.md
