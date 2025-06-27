# 🧪 Stripe + Supabase Integration Testing Guide

## ✅ Prerequisites Checklist

Before testing, ensure you have:

- [x] Development server running (`npm run dev`)
- [x] Stripe CLI installed and authenticated
- [x] Webhook forwarding active: `stripe listen --forward-to localhost:4321/api/webhooks/stripe`
- [x] Supabase service key added to `.env.local`
- [x] Stripe price IDs configured in `.env.local`

## 🎯 What We're Testing

The enhanced webhook handler will:

1. **Receive Stripe events** (checkout.session.completed, customer.subscription.deleted)
2. **Verify webhook signatures** for security
3. **Extract trainer and price information** from event metadata
4. **Update Supabase database** with new subscription status
5. **Log detailed information** for debugging

## 🚀 Testing Steps

### Step 1: Start All Services

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Stripe webhook forwarding
stripe listen --forward-to localhost:4321/api/webhooks/stripe
```

### Step 2: Test Checkout Completion

```bash
# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

**Expected Results:**
- ✅ Webhook signature verified
- ✅ Event logged with type and data
- ✅ Trainer ID extracted from metadata
- ✅ Price ID identified and matched
- ✅ Supabase update executed
- ✅ Success confirmation logged

### Step 3: Test Subscription Cancellation

```bash
# Trigger subscription deletion
stripe trigger customer.subscription.deleted
```

**Expected Results:**
- ✅ Subscription deletion event received
- ✅ Trainer premium status updated to 'inactive'
- ✅ Database changes confirmed

### Step 4: Verify Database Changes

1. **Open Supabase Dashboard** → Table Editor → `trainers`
2. **Look for updated records** with:
   - `premium_status: 'active'` (for monthly subscriptions)
   - `payment_status: 'paid_standard'` (for annual subscriptions)
   - Updated `premium_start_date` and `premium_end_date`

## 📋 Expected Log Output

### Successful Checkout Event:
```
✅ Webhook signature verified successfully
🎉 Received event: checkout.session.completed
💳 Checkout session completed!
Session ID: cs_test_...
Customer ID: cus_...
Metadata: { trainerId: 'trainer-123', priceId: 'price_...' }
Price ID: price_1RX0QxDEY1RddZfIoRdn84vS
Trainer ID: trainer-123
Found trainer: { id: 'trainer-123', payment_status: 'pending', premium_status: 'inactive' }
✅ Trainer updated to active premium (monthly)
```

### Successful Subscription Deletion:
```
✅ Webhook signature verified successfully
🎉 Received event: customer.subscription.deleted
❌ Subscription deleted!
Subscription ID: sub_...
Metadata: { trainerId: 'trainer-123' }
✅ Trainer premium status set to inactive
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**❌ "Missing Stripe signature header"**
- **Cause**: Webhook not forwarded correctly
- **Solution**: Restart `stripe listen` command

**❌ "Webhook signature verification failed"**
- **Cause**: Wrong webhook secret in `.env.local`
- **Solution**: Copy secret from `stripe listen` output

**❌ "Error fetching trainer"**
- **Cause**: Invalid trainer ID or missing trainer record
- **Solution**: Check trainer exists in Supabase, verify ID format

**❌ "Unknown price ID"**
- **Cause**: Price ID doesn't match environment variables
- **Solution**: Update `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID` in `.env.local`

**❌ "No trainerId found in metadata"**
- **Cause**: Checkout session created without metadata
- **Solution**: Ensure checkout API includes `trainerId` in metadata

## 🔧 Manual Testing with Custom Data

### Create Checkout with Specific Trainer ID:

```bash
curl -X POST http://localhost:4321/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1RX0QxDEY1RddZfIoRdn84vS",
    "trainerId": "your-test-trainer-id"
  }'
```

### Quick Database Check:

```sql
-- Check trainer status in Supabase SQL Editor
SELECT id, premium_status, payment_status, premium_start_date, premium_end_date 
FROM trainers 
WHERE id = 'your-test-trainer-id';
```

## 🎉 Success Criteria

Your integration is working correctly when:

1. ✅ **Events are received** and signature verified
2. ✅ **Trainer records are found** in Supabase
3. ✅ **Database updates succeed** without errors
4. ✅ **Status changes are persistent** in Supabase
5. ✅ **Dates are set correctly** (start/end times)

## 📞 Next Steps After Testing

Once testing confirms everything works:

1. **Deploy to production** environment
2. **Configure live webhook** in Stripe Dashboard
3. **Monitor webhook events** in production
4. **Set up error monitoring** and alerts
5. **Test with real payments** (small amounts)

---

**🎯 Goal**: Ensure seamless automatic updates of trainer subscription status based on Stripe payment events!
