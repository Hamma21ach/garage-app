# UploadThing Setup Guide

UploadThing is now configured for handling image uploads in GaragePro!

## Quick Setup Steps

### 1. Get Your API Keys
1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign in with GitHub
3. Create a new app
4. Copy your `Secret Key` and `App ID`

### 2. Add to Environment Variables
Add these to your `.env` file:

```env
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxxx"
```

### 3. That's It! 🎉

UploadThing is already integrated into your garage image upload form.

## Features Configured

✅ **Max File Size**: 4MB per image
✅ **Max Files**: 5 images per garage
✅ **File Types**: Images only (jpg, png, webp, etc.)
✅ **Authentication**: Protected - only logged-in owners can upload
✅ **Auto Cleanup**: UploadThing handles storage and CDN

## How It Works

1. **Owner clicks "Upload Image"** on garage form
2. **Image is uploaded to UploadThing's CDN**
3. **URL is automatically saved** to the garage record
4. **Images are displayed** on garage cards and detail pages

## Free Tier Limits

- ✅ 2GB storage
- ✅ 1GB bandwidth/month
- ✅ Perfect for development and testing!

## Upgrade to Pro (Optional)

If you need more:
- 100GB storage
- 100GB bandwidth/month
- Custom domains
- Priority support

Visit [uploadthing.com/pricing](https://uploadthing.com/pricing)

## Testing Without API Keys

The app will show an error if you try to upload without configuring UploadThing.
To test the app without images, you can:
1. Skip image upload when creating garages
2. Or add the UploadThing keys (takes 2 minutes!)

## Files Modified

- ✅ `/app/api/uploadthing/core.ts` - Upload configuration
- ✅ `/app/api/uploadthing/route.ts` - API route handler
- ✅ `/lib/uploadthing.ts` - React helpers
- ✅ `/app/owner/garage/page.tsx` - Garage form with upload
