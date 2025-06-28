# 🔐 VERCEL ENVIRONMENT VARIABLES SETUP

After deployment, copy your environment variables from `.env.local` to Vercel dashboard.

## Required Environment Variables:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY  
- STRIPE_WEBHOOK_SECRET
- STRIPE_ANNUAL_PRICE_ID
- STRIPE_MONTHLY_PRICE_ID
- STRIPE_ANNUAL_PLAN_ID
- STRIPE_MONTHLY_PLAN_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY

## How to Add in Vercel Dashboard:
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Copy each variable from your local `.env.local` file
4. Set environment to "Production" 
5. Click Save
6. Redeploy your project

## After Adding Environment Variables:
1. Update Stripe webhook URL to: `https://yourdomain.com/api/webhooks/stripe`
2. Test the premium subscription flow
3. Verify webhook delivery in Stripe dashboard

## Test URLs (replace yourdomain.com):
- https://yourdomain.com/premium
- https://yourdomain.com/dashboard  
- https://yourdomain.com/api/create-checkout-session (POST endpoint)

## Copy Environment Variables Command:
```bash
cat .env.local
```

Copy each line to Vercel dashboard manually for security.
