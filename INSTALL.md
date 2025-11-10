# 🚀 INSTALLATION & SETUP GUIDE

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager  
- PostgreSQL database (Neon recommended)
- Stripe account
- Cloudinary account

## Step-by-Step Installation

### 1. Install All Dependencies

Run these commands in PowerShell (with execution policy adjusted) or CMD:

```bash
# Core dependencies
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs stripe chart.js react-chartjs-2 zod react-hook-form @hookform/resolvers axios date-fns cloudinary

# Dev dependencies
npm install -D prisma @types/bcryptjs @types/node

# Additional types
npm install -D @types/react @types/react-dom
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

#### Configure Neon PostgreSQL:

1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env`:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### Configure NextAuth:

Generate a secret key:

```bash
# On PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Or use any random string generator
```

Add to `.env`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

#### Configure Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys from Developers > API keys
3. Create products:
   - Go to Products > Add Product
   - Create "Monthly Subscription" and "Yearly Subscription"
   - Copy the price IDs
4. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."
```

#### Configure Stripe Webhooks:

For local development:

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Configure Cloudinary:

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up/Login
3. Get credentials from Dashboard
4. Add to `.env`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Open Prisma Studio to view database
npx prisma studio
```

### 4. Seed Database (Optional but Recommended)

Create seed file for demo data:

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@garage.com' },
    update: {},
    create: {
      email: 'admin@garage.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create owner user
  const ownerPassword = await bcrypt.hash('Owner@123456', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@garage.com' },
    update: {},
    create: {
      email: 'owner@garage.com',
      name: 'Garage Owner',
      password: ownerPassword,
      role: 'OWNER',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User@123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@garage.com' },
    update: {},
    create: {
      email: 'user@garage.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample garage
  const garage = await prisma.garage.upsert({
    where: { id: 'sample-garage-1' },
    update: {},
    create: {
      id: 'sample-garage-1',
      name: 'AutoFix Pro',
      location: 'New York',
      address: '123 Main Street',
      city: 'New York',
      postalCode: '10001',
      phone: '+1-555-0123',
      specialties: ['MECHANIC', 'ELECTRIC'],
      description: 'Professional auto repair services with 20+ years of experience.',
      isApproved: true,
      subscriptionActive: true,
      ownerId: owner.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log({ admin, owner, user, garage });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install ts-node:

```bash
npm install -D ts-node
```

Run seed:

```bash
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the Application

### Demo Accounts:

After seeding, use these credentials:

**Admin**:
- Email: `admin@garage.com`
- Password: `Admin@123456`

**Garage Owner**:
- Email: `owner@garage.com`
- Password: `Owner@123456`

**Regular User**:
- Email: `user@garage.com`
- Password: `User@123456`

## 🚀 Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (copy from `.env`)
4. Deploy!

### 3. Setup Production Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret
5. Add to Vercel environment variables

### 4. Update Environment Variables

In Vercel dashboard, update:

```env
NEXTAUTH_URL="https://your-domain.vercel.app"
STRIPE_WEBHOOK_SECRET="whsec_..." (production webhook secret)
```

## 🐛 Troubleshooting

### PowerShell Script Execution Error

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then run npm commands.

### Database Connection Issues

- Verify Neon database is running
- Check connection string format
- Ensure `?sslmode=require` is appended

### Prisma Client Not Found

```bash
npx prisma generate
```

### Migration Errors

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

### Stripe Webhook Not Working Locally

Ensure Stripe CLI is running:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Next.js Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## 📦 Additional Tools

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Access at: http://localhost:5555

### View Database Schema

```bash
npx prisma db pull  # Pull from existing database
npx prisma db push  # Push schema without migrations
```

## 🔄 Development Workflow

1. Make changes to code
2. If schema changed: `npx prisma migrate dev --name description`
3. If new dependencies: `npm install`
4. Test locally: `npm run dev`
5. Commit and push
6. Vercel auto-deploys preview

## 📚 Next Steps

After successful installation:

1. ✅ Test all user roles (User, Owner, Admin)
2. ✅ Create a test garage as owner
3. ✅ Make a test subscription payment
4. ✅ Request appointment as user
5. ✅ Respond to appointment as owner
6. ✅ Approve garage as admin
7. ✅ Test Stripe webhooks

## 🎯 Project Features Checklist

- ✅ User authentication with roles
- ✅ Garage CRUD operations
- ✅ Appointment system
- ✅ Stripe subscriptions
- ✅ Image uploads
- ✅ Admin approval workflow
- ✅ Responsive design
- ✅ Dashboard analytics
- ✅ Email/password validation
- ✅ Protected routes

---

**Need Help?** Create an issue or check the documentation!
