# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe payments for ClearLaunch.

## Step 1: Get Your Stripe Keys

1. **Log in to your Stripe Dashboard**: https://dashboard.stripe.com
2. **Get your API keys**:
   - Go to **Developers** → **API keys**
   - Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Create Products and Prices in Stripe

You need to create **Price IDs** (not Product IDs) for your subscription plans.

### For Pro Plan ($29/month):
1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Name: "ClearLaunch Pro"
4. Description: "Pro plan - 3 launches, 100 AI calls/month"
5. Pricing: **Recurring** → **Monthly** → **$29.00**
6. Click **Save product**
7. **Copy the Price ID** (starts with `price_...`) - this is what you need!

### For Team Plan ($99/month):
1. Repeat the above steps
2. Name: "ClearLaunch Team"
3. Price: **$99.00/month**
4. **Copy the Price ID**

## Step 3: Set Up Webhook Endpoint

Webhooks allow Stripe to notify your app when payments succeed or fail.

### For Local Development (using Stripe CLI):

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```
3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. **Copy the webhook signing secret** (starts with `whsec_...`) - you'll see this in the terminal output

### For Production (Vercel/Deployed):

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`)

## Step 4: Add Keys to Your .env File

Create a `.env.local` file in the `clearlaunch-app` directory (or add to your existing `.env` file):

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your publishable key
STRIPE_SECRET_KEY=sk_test_... # Your secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_ID_PRO=price_... # Pro plan price ID
STRIPE_PRICE_ID_TEAM=price_... # Team plan price ID

# App URL (for redirects and OAuth)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # For local dev
# NEXT_PUBLIC_APP_URL=https://app.clearlaunch.co.uk # For production (app subdomain)
```

## Step 5: Test the Integration

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (if testing locally):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test checkout**:
   - Go to `/pricing` page
   - Click "Upgrade to Pro" or "Upgrade to Team"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Complete the checkout

4. **Verify**:
   - Check your Supabase `users` table - the `plan` column should update to "pro" or "team"
   - Check Stripe Dashboard → **Payments** - you should see the test payment

## Step 6: Go Live (Production)

When you're ready for production:

1. **Switch to Live Mode** in Stripe Dashboard (toggle in top right)
2. **Get your live keys**:
   - Copy live **Publishable key** (`pk_live_...`)
   - Copy live **Secret key** (`sk_live_...`)
3. **Update your production environment variables** (Vercel, etc.)
4. **Set up production webhook** (see Step 3)
5. **Update `NEXT_PUBLIC_APP_URL`** to your production domain

## Troubleshooting

### Webhook not working?
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that webhook endpoint URL is correct
- Verify webhook events are selected in Stripe Dashboard
- Check server logs for webhook errors

### Checkout not redirecting?
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for errors
- Verify Stripe keys are correct

### Plan not updating after payment?
- Check webhook logs in Stripe Dashboard
- Verify webhook is receiving events
- Check Supabase logs for errors
- Ensure `userId` is being passed correctly in checkout metadata

## Files Created

- `lib/stripe.ts` - Stripe configuration and helpers
- `app/api/stripe/checkout/route.ts` - Checkout session creation
- `app/api/stripe/webhook/route.ts` - Webhook handler for plan updates
- `components/CheckoutButton.tsx` - Client component for checkout
- `.env.example` - Example environment variables

## Next Steps

- Add customer portal for plan management
- Add subscription cancellation handling
- Add invoice history
- Add payment method management

