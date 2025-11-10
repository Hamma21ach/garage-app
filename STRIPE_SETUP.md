# Stripe Subscription Setup Guide

This guide will help you configure Stripe subscriptions for GaragePro.

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up for a free account
2. Complete the account setup process

## Step 2: Get Your API Keys

### For Development (Test Mode):

1. In the Stripe Dashboard, click on **Developers** in the left sidebar
2. Click on **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
4. Copy these keys

### Update .env file:

```env
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

## Step 3: Create Products and Prices

1. In the Stripe Dashboard, go to **Products** > **+ Add product**

### Monthly Plan:

- **Name**: GaragePro Premium Monthly
- **Description**: Monthly subscription for premium garage features
- **Pricing**:
  - **Price**: $29
  - **Billing period**: Monthly
  - **Recurring**: Yes
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

### Yearly Plan:

- **Name**: GaragePro Premium Yearly
- **Description**: Yearly subscription for premium garage features (save 20%)
- **Pricing**:
  - **Price**: $279
  - **Billing period**: Yearly
  - **Recurring**: Yes
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

### Update .env file:

```env
# Add these price IDs
STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID
```

## Step 4: Set Up Webhooks

Stripe uses webhooks to notify your app about subscription events.

### For Local Development:

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. The CLI will display a **webhook signing secret** (starts with `whsec_`)
5. Add to .env:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

### For Production:

1. Go to **Developers** > **Webhooks** > **Add endpoint**
2. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
3. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** and add to .env:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
   ```

## Step 5: Configure Customer Portal

The customer portal allows users to manage their subscriptions.

1. Go to **Settings** > **Billing** > **Customer portal**
2. Configure:
   - ✅ **Allow customers to update their payment methods**
   - ✅ **Allow customers to update subscriptions** (upgrade/downgrade)
   - ✅ **Allow customers to cancel subscriptions**
   - Choose **Cancel immediately** or **Cancel at period end**
3. Click **Save**

## Step 6: Test the Integration

### Test with Stripe Test Cards:

Use these test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

**Expiry**: Any future date (e.g., 12/25)
**CVC**: Any 3 digits (e.g., 123)
**ZIP**: Any valid ZIP code

### Testing Flow:

1. Sign in as an owner
2. Go to Owner Dashboard
3. Click "Upgrade to Premium" on a garage
4. Select Monthly or Yearly plan
5. Enter test card details
6. Complete payment
7. Verify:
   - Redirected back to dashboard
   - Garage shows "Premium Active" badge
   - Subscription status updated in database

### Test Webhook Events:

```bash
# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Step 7: Go Live

When ready for production:

1. Activate your Stripe account (complete business verification)
2. Switch from **Test mode** to **Live mode** in the Stripe Dashboard
3. Get your **live** API keys (start with `pk_live_` and `sk_live_`)
4. Create products/prices in live mode
5. Update .env with live keys and price IDs
6. Set up production webhook endpoint
7. Update `NEXT_PUBLIC_APP_URL` to your production domain

## Environment Variables Summary

Your final `.env` file should include:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_or_live_YOUR_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_YOUR_KEY

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_ID
STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_ID

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or https://yourdomain.com
```

## Features Included

✅ **Subscription Checkout**: Users can subscribe to monthly or yearly plans
✅ **Customer Portal**: Users can manage their subscriptions, update payment methods, and cancel
✅ **Webhook Handling**: Automatic subscription status updates
✅ **Premium Features**:
  - Priority listing in search results
  - Featured badge on garage
  - Unlimited appointments
  - Advanced analytics
  - Premium support

## Troubleshooting

### Webhook not working?
- Check webhook secret is correct
- Verify endpoint is accessible
- Check Stripe Dashboard > Developers > Webhooks for delivery attempts

### Payment not processing?
- Verify API keys are correct
- Check price IDs match your Stripe products
- Review browser console for errors

### Subscription not updating?
- Check webhook events are being received
- Verify database connection
- Check server logs for errors

## Support

For more information:
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Testing: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- Stripe Webhooks: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
