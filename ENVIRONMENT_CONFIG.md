# Environment Configuration Quick Reference

## 🔄 Switching Between Test and Live Modes

### Currently Configured: LIVE MODE ✅
Your `.env.local` is currently set up for **production/live** Stripe processing.

### To Switch to Test Mode (Development)
Replace the Stripe keys in `.env.local` with these test keys:

```bash
# Stripe Configuration - TEST MODE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STRIPE_CLI
```

### To Get Test Keys:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test keys
3. For webhook secret, run: `stripe listen --forward-to localhost:4321/api/webhooks/stripe`

### To Switch Back to Live Mode
Your current `.env.local` already has the live keys configured.

## 🧪 Testing Commands

### Test Mode Commands
```bash
# Start webhook forwarding (test mode)
stripe listen --forward-to localhost:4321/api/webhooks/stripe

# Test checkout session (test mode)
curl -X POST http://localhost:4321/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test_123","trainerId":"trainer-456"}'

# Trigger test events
stripe trigger checkout.session.completed
```

### Live Mode Commands
```bash
# Configure webhook endpoint in Stripe Dashboard
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: Select all subscription and payment events
```

## ⚠️ Important Notes

- **Never commit `.env.local`** - It's already gitignored ✅
- **Test mode**: Uses `pk_test_` and `sk_test_` keys
- **Live mode**: Uses `pk_live_` and `sk_live_` keys  
- **Webhook secrets**: Different for test (`stripe listen`) vs live (Dashboard)
- **Always test thoroughly** in test mode before going live

## 🔗 Quick Links

- **Stripe Test Dashboard**: https://dashboard.stripe.com/test
- **Stripe Live Dashboard**: https://dashboard.stripe.com
- **Admin Dashboard**: `/admin?key=dogtrainer2025admin`
- **Test Page**: `/test-stripe` (development only)
