#!/bin/bash

# Phase 3.2: Stripe CLI Testing Script
# Tests the webhook handler with Standard and Premium cancellation events

echo "🧪 Phase 3.2: Stripe CLI Testing for Two-Tier Subscription Logic"
echo "=================================================================="

# Check if Stripe CLI is available
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Please install: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Load environment variables
if [ -f ".env.local" ]; then
    source .env.local
fi

# Environment variables for testing
STANDARD_PRICE_ID="${STRIPE_ANNUAL_PRICE_ID}"
PREMIUM_PRICE_ID="${STRIPE_MONTHLY_PRICE_ID}"
TEST_TRAINER_ID="test-trainer-123"

# Validate required environment variables
if [ -z "$STANDARD_PRICE_ID" ] || [ -z "$PREMIUM_PRICE_ID" ]; then
    echo "❌ Required environment variables not found. Please check .env.local file."
    echo "   Missing: STRIPE_ANNUAL_PRICE_ID or STRIPE_MONTHLY_PRICE_ID"
    echo ""
    echo "Expected environment variables:"
    echo "   STRIPE_ANNUAL_PRICE_ID=${STRIPE_ANNUAL_PRICE_ID:-'NOT SET'}"
    echo "   STRIPE_MONTHLY_PRICE_ID=${STRIPE_MONTHLY_PRICE_ID:-'NOT SET'}"
    exit 1
fi

# Verify Stripe CLI is in test mode
echo "🔐 Verifying Stripe CLI test mode..."
STRIPE_ACCOUNT_ID=$(stripe config --list | grep account_id | cut -d'=' -f2 | tr -d ' ')
if [ -z "$STRIPE_ACCOUNT_ID" ]; then
    echo "⚠️  Warning: Please ensure you're logged into Stripe CLI in TEST mode:"
    echo "   stripe login"
    echo ""
fi

echo "🔧 Test Configuration:"
echo "   Standard Price ID: $STANDARD_PRICE_ID"
echo "   Premium Price ID: $PREMIUM_PRICE_ID"
echo "   Test Trainer ID: $TEST_TRAINER_ID"
echo ""

echo "🗃️  Database Setup Required:"
echo "   Before testing, ensure test trainer exists in Supabase."
echo "   Run this SQL in Supabase SQL Editor:"
echo ""
echo "   INSERT INTO trainers ("
echo "       id, name, suburb, email, description,"
echo "       payment_status, premium_status,"
echo "       categories, status"
echo "   ) VALUES ("
echo "       '$TEST_TRAINER_ID',"
echo "       'Test Dog Trainer',"
echo "       'Melbourne CBD',"
echo "       'test@example.com',"
echo "       'Test trainer for webhook testing',"
echo "       'paid_standard',"
echo "       'active',"
echo "       ARRAY['puppy-training'],"
echo "       'approved'"
echo "   ) ON CONFLICT (id) DO UPDATE SET"
echo "       payment_status = 'paid_standard',"
echo "       premium_status = 'active';"
echo ""

echo "⚠️  IMPORTANT: Make sure you have the following running:"
echo "   1. Development server: npm run dev (port 4321)"
echo "   2. Webhook forwarding: stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo ""

read -p "Press ENTER when ready to start testing..."

echo ""
echo "🧪 TEST 1: Standard Subscription Cancellation"
echo "============================================="
echo "Expected: Both payment_status AND premium_status should be updated"
echo ""

echo "Triggering Standard cancellation event..."
stripe trigger customer.subscription.deleted \
  --add "items.data[0].price.id=$STANDARD_PRICE_ID" \
  --add "metadata.trainerId=$TEST_TRAINER_ID"

echo ""
echo "✅ Standard cancellation event sent!"
echo "Check your VS Code terminal for webhook logs."
echo "Expected logs:"
echo "   🚨 STANDARD CANCELLATION DETECTED"
echo "   → Trainer ID: $TEST_TRAINER_ID"
echo "   → Cancelled Price ID: $STANDARD_PRICE_ID"
echo "   ✅ SUCCESS: Standard cancelled → Both payment_status AND premium_status updated"
echo ""
echo "📊 Verify in Supabase (SQL Editor):"
echo "   SELECT payment_status, premium_status FROM trainers WHERE id='$TEST_TRAINER_ID';"
echo "   Expected: payment_status='pending_standard', premium_status='inactive'"
echo ""

read -p "Verify logs and Supabase updates, then press ENTER for next test..."

echo ""
echo "🧪 TEST 2: Premium Subscription Cancellation"
echo "============================================="
echo "Expected: Only premium_status should be updated (payment_status unchanged)"
echo ""

echo "Triggering Premium cancellation event..."
stripe trigger customer.subscription.deleted \
  --add "items.data[0].price.id=$PREMIUM_PRICE_ID" \
  --add "metadata.trainerId=$TEST_TRAINER_ID"

echo ""
echo "✅ Premium cancellation event sent!"
echo "Check your VS Code terminal for webhook logs."
echo "Expected logs:"
echo "   🔄 PREMIUM CANCELLATION DETECTED"
echo "   → Trainer ID: $TEST_TRAINER_ID"
echo "   → Cancelled Price ID: $PREMIUM_PRICE_ID"
echo "   ✅ SUCCESS: Premium cancelled → Only premium_status updated"
echo ""
echo "📊 Verify in Supabase (SQL Editor):"
echo "   SELECT payment_status, premium_status FROM trainers WHERE id='$TEST_TRAINER_ID';"
echo "   Expected: payment_status='paid_standard' (unchanged), premium_status='inactive'"
echo ""

read -p "Verify logs and Supabase updates, then press ENTER for next test..."

echo ""
echo "🧪 TEST 3: Unknown Price ID (Error Handling)"
echo "============================================="
echo "Expected: Warning message, no database updates"
echo ""

echo "Triggering unknown price ID event..."
stripe trigger customer.subscription.deleted \
  --add "items.data[0].price.id=price_UNKNOWN_INVALID_ID" \
  --add "metadata.trainerId=$TEST_TRAINER_ID"

echo ""
echo "✅ Unknown price ID event sent!"
echo "Check your VS Code terminal for webhook logs."
echo "Expected logs:"
echo "   ⚠️ UNKNOWN PRICE ID in subscription cancellation"
echo "   → Received priceId: price_UNKNOWN_INVALID_ID"
echo "   → No database updates performed"
echo ""

read -p "Verify logs show proper error handling, then press ENTER to complete..."

echo ""
echo "🎉 Phase 3.2 Testing Complete!"
echo "==============================="
echo ""
echo "📋 Verify the following in Supabase Table Editor:"
echo "   1. Test 1: trainer record shows payment_status='pending_standard', premium_status='inactive'"
echo "   2. Test 2: trainer record shows only premium_status='inactive' (payment_status unchanged)"
echo "   3. Test 3: trainer record unchanged from Test 2"
echo ""
echo "📊 All tests passed? Mark Phase 3.2 as ✅ COMPLETE"
echo ""
echo "▶️  Next: Ready for production deployment and live testing!"
