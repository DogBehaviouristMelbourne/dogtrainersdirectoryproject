#!/bin/bash

echo "🧪 Simple Test Script"
echo "Current directory: $(pwd)"
echo "Checking environment variables..."

# Load environment variables
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Loaded .env.local"
else
    echo "❌ .env.local not found"
fi

echo "STRIPE_ANNUAL_PRICE_ID: ${STRIPE_ANNUAL_PRICE_ID}"
echo "STRIPE_MONTHLY_PRICE_ID: ${STRIPE_MONTHLY_PRICE_ID}"

# Check if Stripe CLI is available
if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI found"
    stripe --version
else
    echo "❌ Stripe CLI not found"
fi

echo "Test complete."
