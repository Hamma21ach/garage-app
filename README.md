# 🚗 GaragePro - Professional Garage Management Platform

A complete Next.js 15 application for connecting car owners with professional garages. Features role-based dashboards (USER/OWNER/ADMIN), Stripe subscriptions, real-time appointment management, and advanced analytics.

## ✨ Features

### For Users
- 🔍 **Browse Garages** - Search and filter by location, specialty, and ratings
- 📅 **Book Appointments** - Submit repair requests with photos and descriptions
- 💰 **Get Estimates** - Receive cost and duration estimates from garages
- 📊 **Track Progress** - Monitor appointment status (Pending → Confirmed → Done)
- 📧 **Email Notifications** - Stay updated on appointment changes

### For Garage Owners
- 🏪 **Garage Management** - Create and manage garage profiles with images
- 📋 **Appointment Dashboard** - View and respond to customer requests
- 💵 **Estimate Builder** - Provide cost and duration estimates
- ⭐ **Premium Subscriptions** - Upgrade for priority listing and featured badges
- 📈 **Analytics** - View appointment trends and customer insights
- 🎨 **Specialty Tags** - Mechanic, Electric, Body Repair, or All Services

### For Administrators
- 📊 **Analytics Dashboard** - Track platform usage with interactive charts
- 🏢 **Garage Approval** - Review and approve new garage listings
- 💳 **Subscription Management** - Monitor active subscriptions
- 👥 **User Management** - View user roles and activity
- 📈 **Revenue Insights** - Track subscription revenue and growth

## 🧩 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Components
- **Database**: Prisma ORM + Neon PostgreSQL (Serverless)
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe + @stripe/stripe-js
- **File Upload**: UploadThing (4MB max, 5 images)
- **Charts**: Recharts (LineChart, PieChart, BarChart)
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database account
- Stripe account (for subscriptions)
- UploadThing account (for image uploads)

### Installation

```bash
# Clone the repository
cd garage-app

# Install dependencies
npm install

# Setup environment variables
# Copy .env and fill in your credentials
# See STRIPE_SETUP.md for Stripe configuration

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Visit: **http://localhost:3000**

## 👥 Demo Accounts

The application includes pre-configured demo accounts for testing:

**🔴 Admin Account**:
- Email: `admin@garage.com`
- Password: `Admin@123456`
- Access: Full platform management, analytics, garage approval

**🟢 Owner Account**:
- Email: `owner@garage.com`
- Password: `Owner@123456`
- Access: Garage management, appointment handling, subscription management

**🔵 User Account**:
- Email: `user@garage.com`
- Password: `User@123456`
- Access: Browse garages, book appointments, track status

## 📁 Project Structure

```
garage-app/
├── app/
│   ├── page.tsx                      # Landing page with auto-redirect
│   ├── layout.tsx                    # Root layout with providers
│   ├── providers.tsx                 # SessionProvider wrapper
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Registration page
│   ├── garages/
│   │   ├── page.tsx                  # Browse garages
│   │   └── [id]/page.tsx             # Garage details & booking
│   ├── dashboard/page.tsx            # User dashboard (appointments)
│   ├── owner/
│   │   ├── dashboard/page.tsx        # Owner dashboard
│   │   ├── garage/page.tsx           # Create/edit garage
│   │   └── subscription/page.tsx     # Subscription management
│   ├── admin/
│   │   └── dashboard/page.tsx        # Admin dashboard with charts
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth endpoints
│       ├── garages/                  # Garage CRUD
│       ├── appointments/             # Appointment management
│       ├── uploadthing/              # Image upload
│       ├── admin/                    # Admin APIs
│       └── stripe/                   # Stripe checkout & webhooks
├── prisma/
│   └── schema.prisma                 # Database schema
├── lib/
│   ├── prisma.ts                     # Prisma client
│   └── uploadthing.ts                # UploadThing config
├── auth.ts                           # NextAuth configuration
├── STRIPE_SETUP.md                   # Stripe setup guide
└── .env                              # Environment variables
```

## 🔧 Configuration Files

### Environment Variables (.env)

```env
# Database
DATABASE_URL='your_neon_postgresql_url'

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

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your_app_id"
```

### Stripe Setup

Follow the detailed guide in **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** to configure:
1. Create Stripe account
2. Get API keys
3. Create products and pricing
4. Setup webhooks
5. Test with test cards

## 🎨 Design Features

- **Gradient Themes**: Beautiful purple/pink gradients for subscription pages
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm/md/lg/xl)
- **Animated Components**: Smooth transitions and hover effects
- **Loading States**: Spinners and disabled states during actions
- **Toast Notifications**: Success/error feedback with react-hot-toast
- **Modal Forms**: Estimate forms in appointment management
- **Chart Visualizations**: Recharts for admin analytics

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ Server-side authentication checks
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Stripe webhook signature verification
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)
- ✅ CSRF protection (NextAuth)

## 📊 Database Schema

**Main Models**:
- `User` - Authentication and role management
- `Garage` - Garage profiles with subscriptions
- `Appointment` - Booking requests and estimates
- `Account` & `Session` - NextAuth tables

**Key Relationships**:
- User → Garages (one-to-many)
- User → Appointments (one-to-many)
- Garage → Appointments (one-to-many)

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Important: Webhook Configuration

After deployment, update Stripe webhook URL:
- Go to Stripe Dashboard → Webhooks
- Add endpoint: `https://your-domain.com/api/stripe/webhook`
- Copy signing secret to environment variables

## � API Routes

**Public APIs**:
- `GET /api/garages` - List approved garages
- `GET /api/garages/[id]` - Garage details

**User APIs** (Auth Required):
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List user appointments

**Owner APIs** (Owner Role):
- `POST /api/garages` - Create garage
- `PUT /api/garages/[id]` - Update garage
- `PATCH /api/appointments/[id]` - Update appointment status

**Admin APIs** (Admin Role):
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/garages` - All garages
- `PATCH /api/admin/garages/[id]` - Approve/reject garage

**Stripe APIs**:
- `POST /api/stripe/create-checkout-session` - Start subscription
- `POST /api/stripe/create-portal-session` - Manage subscription
- `POST /api/stripe/webhook` - Handle Stripe events

## 🧪 Testing

### Test Stripe Subscriptions

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

### Test Webhooks Locally

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## 📞 Support & Documentation

- **Installation**: See detailed setup in comments
- **Stripe Integration**: Read STRIPE_SETUP.md
- **API Documentation**: Check API route files for JSDoc comments
- **Troubleshooting**: Review console logs and error messages

## 🎯 Future Enhancements

Potential features for future development:
- Real-time chat between users and garages
- Push notifications
- Google Maps integration
- Review and rating system
- Multiple garage photos per appointment
- Email templates with SendGrid/Resend
- SMS notifications with Twilio
- Multi-language support (i18n)

## 📄 License

MIT License - Feel free to use for personal or commercial projects

---

**Built with ❤️ using Next.js 15, Prisma, Stripe, and Recharts**
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
