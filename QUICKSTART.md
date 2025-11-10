# ⚡ QUICK START CHECKLIST

## Follow these steps to get your Garage Pro app running!

---

### ☑️ Step 1: Install Node Packages

Open Command Prompt (CMD) or PowerShell in your project directory.

**If using PowerShell**, run this first:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Then install packages:**
```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs stripe chart.js react-chartjs-2 zod react-hook-form @hookform/resolvers axios date-fns cloudinary
```

```bash
npm install -D prisma @types/bcryptjs ts-node
```

---

### ☑️ Step 2: Setup Environment File

1. The `.env` file is already created
2. Edit it with your credentials:

**Required fields:**

```env
# Get from Neon.tech (Free tier available)
DATABASE_URL="postgresql://..."

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"

# Get from Stripe.com
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Get from Cloudinary.com  
CLOUDINARY_CLOUD_NAME="your_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
```

**Quick Links:**
- Neon Database: https://neon.tech
- Stripe: https://dashboard.stripe.com
- Cloudinary: https://cloudinary.com

---

### ☑️ Step 3: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Add demo data (admin, owner, user accounts)
npx prisma db seed
```

**Demo Accounts Created:**
- Admin: `admin@garage.com` / `Admin@123456`
- Owner: `owner@garage.com` / `Owner@123456`
- User: `user@garage.com` / `User@123456`

---

### ☑️ Step 4: Run Development Server

```bash
npm run dev
```

**Open in browser:** http://localhost:3000

---

### ☑️ Step 5: Test the Application

1. **Visit Homepage** - Should see landing page
2. **Click "Sign In"** - Use demo accounts
3. **Test User Role**: 
   - Login as: `user@garage.com`
   - Browse garages
   - Request appointment

4. **Test Owner Role**:
   - Login as: `owner@garage.com`
   - View dashboard
   - See appointments

5. **Test Admin Role**:
   - Login as: `admin@garage.com`
   - View admin dashboard
   - Approve garages

---

### ☑️ Step 6: Create Remaining Pages (Optional)

Copy code from `PAGE_TEMPLATES.md`:

1. **Garage Detail** → `app/garages/[id]/page.tsx`
2. **User Dashboard** → `app/dashboard/page.tsx`
3. **Owner Dashboard** → `app/owner/dashboard/page.tsx`
4. **Admin Dashboard** → `app/admin/dashboard/page.tsx`

---

### ☑️ Step 7: Setup Stripe (Optional - For Subscriptions)

1. Go to Stripe Dashboard
2. Create 2 products:
   - "Monthly Garage Subscription" - $29/month
   - "Yearly Garage Subscription" - $290/year
3. Copy price IDs (start with `price_...`)
4. Add to `.env`:
   ```env
   STRIPE_MONTHLY_PRICE_ID="price_..."
   STRIPE_YEARLY_PRICE_ID="price_..."
   ```

**For Local Testing:**
```bash
# Install Stripe CLI from: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 🎯 VERIFICATION CHECKLIST

- [ ] Dependencies installed without errors
- [ ] `.env` file configured
- [ ] Database migrated successfully
- [ ] Seed data added
- [ ] Dev server running on port 3000
- [ ] Can see landing page
- [ ] Can login with demo accounts
- [ ] Garage listing works
- [ ] No console errors

---

## ❌ TROUBLESHOOTING

### Problem: "Cannot find module"
**Solution**: Run `npm install` again

### Problem: "Prisma Client not found"
**Solution**: Run `npx prisma generate`

### Problem: Database connection error
**Solution**: Check `DATABASE_URL` in `.env`

### Problem: PowerShell script errors
**Solution**: Use Command Prompt (CMD) instead

### Problem: Port 3000 already in use
**Solution**: 
```bash
# Kill process or use different port
npm run dev -- -p 3001
```

---

## 📁 FILE STRUCTURE CHECK

Make sure you have these key files:

```
✅ .env (your config)
✅ prisma/schema.prisma
✅ lib/auth.ts
✅ lib/prisma.ts
✅ middleware.ts
✅ app/api/... (14 API routes)
✅ components/ui/... (13 components)
✅ app/(root)/page.tsx
✅ app/auth/login/page.tsx
✅ app/auth/register/page.tsx
✅ app/garages/page.tsx
```

---

## 🚀 READY TO DEPLOY?

### Vercel Deployment:

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Go to vercel.com
3. Import your GitHub repo
4. Add environment variables from `.env`
5. Deploy!

---

## 📚 DOCUMENTATION REFERENCE

- **Setup Issues** → Read `INSTALL.md`
- **Command Help** → Read `COMMANDS.md`
- **Page Templates** → Read `PAGE_TEMPLATES.md`
- **Project Status** → Read `PROJECT_STATUS.md`
- **Overview** → Read `DELIVERY_SUMMARY.md`

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

✅ No errors in terminal  
✅ Landing page loads at http://localhost:3000  
✅ Can login with demo accounts  
✅ Garage listing shows sample garages  
✅ Navigation works  
✅ API routes respond correctly  

---

## 🎉 YOU'RE DONE!

Once you complete this checklist, you have a fully functional garage management platform!

**Next Steps:**
1. Customize the design
2. Add remaining pages from templates
3. Add your branding
4. Deploy to production

---

**Need Help?** Check the documentation files or create an issue.

**Estimated Setup Time**: 15-30 minutes

🚀 **Happy Coding!**
