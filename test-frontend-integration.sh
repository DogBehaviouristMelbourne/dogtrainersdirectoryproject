#!/bin/bash

# Frontend Integration Test Script
# This script helps test all the integrated features

echo "🎯 Frontend Integration Test Suite"
echo "=================================="
echo ""

# Check if dev server is running
echo "📡 Checking if development server is running..."
if curl -s http://localhost:4321 > /dev/null; then
    echo "✅ Development server is running at http://localhost:4321"
else
    echo "❌ Development server not found. Please run 'npm run dev' first"
    echo ""
    echo "To start the server:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "🧪 Test URLs Ready:"
echo "===================="
echo ""

echo "📱 Header & Navigation Test:"
echo "   http://localhost:4321/"
echo "   → Test burger menu on mobile"
echo "   → Test responsive design"
echo "   → Test navigation links"
echo ""

echo "💳 Premium Plans Test:"
echo "   http://localhost:4321/premium?trainerId=demo-trainer-123"
echo "   → Test Stripe integration"
echo "   → Test plan selection"
echo "   → Test checkout flow"
echo ""

echo "📊 Dashboard Test:"
echo "   http://localhost:4321/dashboard?trainerId=demo-trainer-123"
echo "   → Test status display"
echo "   → Test purchase buttons"
echo "   → Test subscription management"
echo ""

echo "👨‍💼 Admin Panel Test:"
echo "   http://localhost:4321/admin?key=dogtrainer2025admin"
echo "   → Test premium management"
echo "   → Test trainer toggles"
echo "   → Test slot usage display"
echo ""

echo "🔍 Trainers List Test:"
echo "   http://localhost:4321/trainers"
echo "   → Test premium sorting"
echo "   → Test search and filters"
echo "   → Test responsive design"
echo ""

echo "⚙️ Test API Endpoint:"
echo "   POST http://localhost:4321/api/create-checkout-session"
echo "   → Test with curl or Postman"
echo ""

echo "🎨 Design Consistency Checklist:"
echo "================================"
echo "□ Header navigation works on desktop and mobile"
echo "□ Burger menu opens/closes smoothly"
echo "□ All buttons have consistent styling"
echo "□ Dark mode toggle works properly"
echo "□ Loading states are professional"
echo "□ Error messages are user-friendly"
echo "□ Success messages display correctly"
echo "□ Forms are responsive and accessible"
echo "□ Cards and layouts are uniform"
echo "□ Colors and typography are consistent"
echo ""

echo "🔧 Manual Testing Steps:"
echo "========================"
echo ""
echo "1. Header & Mobile Menu:"
echo "   • Resize browser to mobile width"
echo "   • Click burger menu button"
echo "   • Verify menu slides in from right"
echo "   • Test all navigation links"
echo "   • Verify menu closes when clicking links"
echo "   • Test Escape key to close menu"
echo ""

echo "2. Premium Checkout Flow:"
echo "   • Visit /premium page"
echo "   • Click a plan button"
echo "   • Enter trainer ID when prompted"
echo "   • Verify Stripe checkout opens"
echo "   • Test with Stripe test card: 4242 4242 4242 4242"
echo ""

echo "3. Dashboard Functionality:"
echo "   • Visit /dashboard with trainerId parameter"
echo "   • Verify trainer info loads"
echo "   • Check subscription status display"
echo "   • Test purchase/upgrade buttons"
echo "   • Verify button states match subscription status"
echo ""

echo "4. Responsive Design:"
echo "   • Test on mobile (320px width)"
echo "   • Test on tablet (768px width)"
echo "   • Test on desktop (1200px+ width)"
echo "   • Verify all elements scale properly"
echo "   • Check touch targets are adequate"
echo ""

echo "5. Stripe Integration:"
echo "   • Start webhook forwarding: stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo "   • Create checkout session via API"
echo "   • Complete test payment"
echo "   • Verify webhook receives events"
echo "   • Check database updates in Supabase"
echo ""

echo "🎉 Ready to Test!"
echo "================="
echo ""
echo "Open your browser and start testing the URLs above."
echo "All features should work seamlessly with consistent design."
echo ""
echo "For Stripe testing, use test card: 4242 4242 4242 4242"
echo "For webhook testing, run: stripe listen --forward-to localhost:4321/api/webhooks/stripe"
echo ""

# Optional: Open browser to main test URLs
if command -v open &> /dev/null; then
    echo "Opening test URLs in browser..."
    open http://localhost:4321/
    sleep 2
    open http://localhost:4321/premium?trainerId=demo-trainer-123
    sleep 2
    open http://localhost:4321/dashboard?trainerId=demo-trainer-123
fi
