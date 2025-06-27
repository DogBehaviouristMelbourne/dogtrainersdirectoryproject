#!/bin/bash

echo "🚀 Starting Dog Trainers Directory with Stripe Integration"
echo "========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️ Warning: .env.local file not found"
    echo "Please create .env.local with your Stripe and Supabase configuration"
    echo ""
else
    echo "✅ Environment configuration found"
fi

echo "🎯 Ready to start! Here's what you can test:"
echo ""
echo "1. 🏠 Homepage: http://localhost:4321/"
echo "2. 💳 Premium Plans: http://localhost:4321/premium?trainerId=demo-trainer-123"
echo "3. 📊 Dashboard: http://localhost:4321/dashboard?trainerId=demo-trainer-123"
echo "4. 👨‍💼 Admin Panel: http://localhost:4321/admin?key=dogtrainer2025admin"
echo ""

echo "🧪 For testing Stripe webhooks (in a separate terminal):"
echo "stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo ""

echo "🎮 Test with Stripe test card: 4242 4242 4242 4242"
echo ""

echo "Starting development server..."
echo "=============================="

# Start the development server
npm run dev
