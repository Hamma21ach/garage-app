# 📝 COMMANDS TO RUN

## ⚠️ IMPORTANT: PowerShell Execution Policy

If you're using PowerShell and get execution policy errors, run this first:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

OR use Command Prompt (CMD) instead of PowerShell.

---

## 1️⃣ INSTALL ALL DEPENDENCIES

Run these commands one by one or all together:

### Production Dependencies:
```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs stripe chart.js react-chartjs-2 zod react-hook-form @hookform/resolvers axios date-fns cloudinary
```

### Dev Dependencies:
```bash
npm install -D prisma @types/bcryptjs ts-node
```

---

## 2️⃣ SETUP ENVIRONMENT

```bash
# Copy environment file
copy .env.example .env

# Then edit .env with your credentials
```

---

## 3️⃣ DATABASE SETUP

### Generate Prisma Client:
```bash
npx prisma generate
```

### Create Database Tables:
```bash
npx prisma migrate dev --name init
```

### Seed Database with Demo Data:
```bash
npx prisma db seed
```

### Open Prisma Studio (Database GUI):
```bash
npx prisma studio
```

---

## 4️⃣ RUN DEVELOPMENT SERVER

```bash
npm run dev
```

Then open: http://localhost:3000

---

## 5️⃣ STRIPE WEBHOOK (For Local Development)

In a separate terminal:

```bash
# Install Stripe CLI first from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret (whsec_...) to your .env file.

---

## 🔧 USEFUL COMMANDS

### View Database:
```bash
npx prisma studio
```

### Reset Database (WARNING: Deletes all data):
```bash
npx prisma migrate reset
```

### Push Schema Changes Without Migration:
```bash
npx prisma db push
```

### Format Prisma Schema:
```bash
npx prisma format
```

### Build for Production:
```bash
npm run build
```

### Start Production Server:
```bash
npm start
```

---

## 🧪 DEMO ACCOUNTS (After Seeding)

**Admin:**
- Email: admin@garage.com
- Password: Admin@123456

**Garage Owner:**
- Email: owner@garage.com
- Password: Owner@123456

**Regular User:**
- Email: user@garage.com
- Password: User@123456

---

## 📦 COMPLETE INSTALLATION (All-in-One)

```bash
# 1. Install dependencies
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs stripe chart.js react-chartjs-2 zod react-hook-form @hookform/resolvers axios date-fns cloudinary

# 2. Install dev dependencies
npm install -D prisma @types/bcryptjs ts-node

# 3. Setup environment (then edit .env manually)
copy .env.example .env

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed database
npx prisma db seed

# 7. Run dev server
npm run dev
```

---

## 🚀 DEPLOY TO VERCEL

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# OR connect GitHub repo via Vercel dashboard
```

---

## ❌ TROUBLESHOOTING

### If npm commands don't work in PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### If Prisma Client is not found:
```bash
npx prisma generate
```

### If database connection fails:
- Check DATABASE_URL in .env
- Ensure Neon database is running
- Verify connection string format

### Clear Next.js cache:
```bash
rmdir /s /q .next
npm run build
```

### Reset and restart:
```bash
npx prisma migrate reset
npx prisma db seed
npm run dev
```

---

## 📚 DOCUMENTATION LINKS

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- Stripe: https://stripe.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Neon: https://neon.tech/docs

---

## ✅ CHECKLIST

- [ ] Install dependencies
- [ ] Setup .env file
- [ ] Configure Neon database
- [ ] Configure Stripe
- [ ] Configure Cloudinary
- [ ] Run Prisma migrations
- [ ] Seed database
- [ ] Start dev server
- [ ] Test login with demo accounts
- [ ] Setup Stripe webhook (optional for local)

---

🎉 **You're all set! Happy coding!**
