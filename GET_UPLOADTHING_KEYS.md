# 🚀 Get Your UploadThing API Keys (2 Minutes!)

## Step-by-Step Guide

### 1️⃣ Visit UploadThing
Go to: **https://uploadthing.com**

### 2️⃣ Sign In
- Click "Sign In" (top right)
- Choose "Continue with GitHub"
- Authorize the app

### 3️⃣ Create Your App
- Click "Create a new app" or "New App"
- Give it a name: **"GaragePro"**
- Click "Create"

### 4️⃣ Get Your Keys
You'll see two important values:
- **App ID**: Looks like `abc123xyz`
- **Secret Key**: Looks like `sk_live_xxxxxxxxxxxxx`

### 5️⃣ Add to .env File
Open your `.env` file and add:

```env
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxx"
UPLOADTHING_APP_ID="abc123xyz"
```

Replace with your actual keys!

### 6️⃣ Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 7️⃣ Test It! 🎉
1. Login as an owner
2. Go to "Add New Garage"
3. Click "Upload Images"
4. Select an image
5. Watch it upload to UploadThing!

---

## ✅ Done!

Now your images are:
- Automatically uploaded to UploadThing's CDN
- Optimized and cached globally
- Delivered super fast to users
- Free for up to 2GB storage!

## Need Help?
- UploadThing Docs: https://docs.uploadthing.com
- Dashboard: https://uploadthing.com/dashboard
