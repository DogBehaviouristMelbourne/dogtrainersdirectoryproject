#!/bin/bash

# Test script for Stripe webhook with Supabase integration
# This script will trigger a test checkout.session.completed event

echo "🧪 Testing Stripe Webhook with Supabase Integration"
echo "=================================================="
echo ""

# Check if stripe CLI is available
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Please install it first:"
    echo "   https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "📋 Before running this test:"
echo "1. Make sure your dev server is running (npm run dev)"
echo "2. Make sure stripe listen is running:"
echo "   stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo ""

read -p "Press Enter when ready to trigger the test event..."

echo ""
echo "🚀 Triggering checkout.session.completed event..."
echo "This will simulate a successful payment and should update Supabase..."
echo ""

# Trigger the event
stripe trigger checkout.session.completed

echo ""
echo "✅ Event triggered! Check your terminal running 'npm run dev' for webhook logs."
echo "🔍 You should see logs showing:"
echo "   - Event received and verified"
echo "   - Trainer data fetched from Supabase"
echo "   - Database update results"
echo ""
echo "💡 To verify the update worked, check your Supabase table editor."
