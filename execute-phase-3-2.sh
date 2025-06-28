#!/bin/bash

# Phase 3.2: Complete Autonomous Execution Script
# Includes build, test setup, and webhook testing

echo "🚀 Phase 3.2: Autonomous Execution Starting..."
echo "=============================================="

# Step 1: Clean build
echo "🔨 Step 1: Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi
echo "✅ Build completed successfully"

# Step 2: Load environment variables
echo "🔧 Step 2: Loading environment variables..."
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.local not found"
    exit 1
fi

# Step 3: Validate environment variables
STANDARD_PRICE_ID="${STRIPE_ANNUAL_PRICE_ID}"
PREMIUM_PRICE_ID="${STRIPE_MONTHLY_PRICE_ID}"
TEST_TRAINER_ID="test-trainer-123"

if [ -z "$STANDARD_PRICE_ID" ] || [ -z "$PREMIUM_PRICE_ID" ]; then
    echo "❌ Required environment variables missing:"
    echo "   STRIPE_ANNUAL_PRICE_ID: ${STRIPE_ANNUAL_PRICE_ID:-'NOT SET'}"
    echo "   STRIPE_MONTHLY_PRICE_ID: ${STRIPE_MONTHLY_PRICE_ID:-'NOT SET'}"
    exit 1
fi

echo "✅ Environment validation passed"
echo "   Standard Price ID: ${STANDARD_PRICE_ID:0:25}..."
echo "   Premium Price ID: ${PREMIUM_PRICE_ID:0:25}..."

# Step 4: Check Stripe CLI
echo "🔧 Step 3: Checking Stripe CLI..."
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Installing..."
    brew install stripe/stripe-cli/stripe
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Stripe CLI"
        exit 1
    fi
fi
echo "✅ Stripe CLI ready"

# Step 5: Instructions for manual execution
echo ""
echo "🎯 Phase 3.2 Ready for Manual Execution"
echo "======================================="
echo ""
echo "Your project is built and ready. Please execute the following in separate terminals:"
echo ""
echo "Terminal 1 - Development Server:"
echo "cd /Users/supercarlito/Desktop/dogtrainersdirectoryproject"
echo "npm run dev"
echo ""
echo "Terminal 2 - Stripe Webhook Forwarding:"
echo "stripe login  # Use test mode"
echo "stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo ""
echo "Terminal 3 - Test Execution:"
echo "./test-phase-3-2.sh"
echo ""
echo "📋 Before running tests, create test trainer in Supabase:"
echo "INSERT INTO trainers ("
echo "    id, name, suburb, email, description,"
echo "    payment_status, premium_status,"
echo "    categories, status"
echo ") VALUES ("
echo "    '$TEST_TRAINER_ID',"
echo "    'Test Dog Trainer',"
echo "    'Melbourne CBD',"
echo "    'test@example.com',"
echo "    'Test trainer for webhook testing',"
echo "    'paid_standard',"
echo "    'active',"
echo "    ARRAY['puppy-training'],"
echo "    'approved'"
echo ") ON CONFLICT (id) DO UPDATE SET"
echo "    payment_status = 'paid_standard',"
echo "    premium_status = 'active';"
echo ""
echo "🎉 Phase 3.2 preparation complete!"
echo "   Execute the manual steps above to complete testing."
