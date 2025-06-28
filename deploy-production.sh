#!/bin/bash

echo "🚀 DEPLOYING DOG TRAINERS DIRECTORY TO PRODUCTION"
echo "================================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your production environment variables"
    exit 1
fi

echo "✅ Pre-deployment checks passed"
echo ""

# Build the project first to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"
echo ""

# Start Vercel deployment
echo "🌐 Starting Vercel deployment..."
echo ""
echo "📝 Please follow these steps:"
echo "1. Login to Vercel when prompted"
echo "2. Link to existing project or create new one"
echo "3. Use default settings (Astro framework should be detected)"
echo "4. After deployment, configure environment variables in Vercel dashboard"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure environment variables in Vercel dashboard:"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - STRIPE_ANNUAL_PRICE_ID"
echo "   - STRIPE_MONTHLY_PRICE_ID"
echo "   - STRIPE_ANNUAL_PLAN_ID"
echo "   - STRIPE_MONTHLY_PLAN_ID"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_KEY"
echo ""
echo "2. Update Stripe webhook URL to: https://yourdomain.com/api/webhooks/stripe"
echo ""
echo "3. Test the deployment:"
echo "   - Visit your live site"
echo "   - Test premium subscription flow"
echo "   - Verify webhook delivery"
echo ""

echo "🔧 For environment variables setup, run:"
echo "cat .env.local"
echo ""
echo "Copy each variable to your Vercel project settings."
