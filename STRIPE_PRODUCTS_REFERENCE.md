# 🏷️ STRIPE PRODUCTS & PRICE IDs CONFIGURED

## 📦 **Products Overview**

Based on the project configuration, here are all the Stripe products and their corresponding price IDs:

---

## 🔑 **Environment Variables (Price IDs)**

```bash
# Monthly Premium Plan
STRIPE_MONTHLY_PRICE_ID=price_1RX0QxDEY1RddZfIoRdn84vS
STRIPE_MONTHLY_PLAN_ID=price_1RX0QxDEY1RddZfIoRdn84vS

# Annual Standard Plan  
STRIPE_ANNUAL_PRICE_ID=price_1RX0T2DEY1RddZfIATD9orLs
STRIPE_ANNUAL_PLAN_ID=price_1RX0T2DEY1RddZfIATD9orLs
```

---

## 💰 **Product Details**

### **1. Monthly Premium Plan**
- **Price ID:** `price_1RX0QxDEY1RddZfIoRdn84vS`
- **Billing:** Monthly subscription
- **Amount:** $49/month
- **Features:** 
  - 🔝 Top placement in search results
  - ⭐ Featured badge
  - 🎯 Premium card styling
  - 🔄 Cancel anytime

### **2. Annual Standard Plan**
- **Price ID:** `price_1RX0T2DEY1RddZfIATD9orLs`
- **Billing:** Annual subscription
- **Amount:** $79/year
- **Features:**
  - 📝 Standard listing features
  - 💰 Annual billing discount
  - 🎯 Priority support
  - 📊 Performance analytics

### **3. Complete Package (Combo)**
- **Price ID:** `price_1RX0T2DEY1RddZfIATD9orLs` (same as Annual)
- **Billing:** Annual + Monthly combination
- **Amount:** $128/year + monthly
- **Features:**
  - 📝 Annual Standard listing
  - ⭐ Monthly Premium upgrade
  - 🚀 Maximum visibility
  - ✨ All premium features

---

## 📍 **Where These IDs Are Used**

### **Frontend Pages:**
1. **`/src/pages/trainers.astro`** (Main premium section)
   - Monthly Premium: `price_1RX0QxDEY1RddZfIoRdn84vS`
   - Annual Standard: `price_1RX0T2DEY1RddZfIATD9orLs`
   - Complete Package: `price_1RX0T2DEY1RddZfIATD9orLs`

2. **`/src/pages/premium.astro`** (Standalone premium page)
   - Monthly Premium: `price_1RX0QxDEY1RddZfIoRdn84vS`
   - Annual Standard: `price_1RX0T2DEY1RddZfIATD9orLs`
   - Complete Package: `price_1RX0T2DEY1RddZfIATD9orLs`

3. **`/src/pages/dashboard.astro`** (Trainer dashboard)
   - Standard Plan: `price_1RX0T2DEY1RddZfIATD9orLs`
   - Premium Upgrade: `price_1RX0QxDEY1RddZfIoRdn84vS`

### **Backend API:**
1. **`/src/pages/api/create-checkout-session.js`**
   - Accepts any `priceId` from the frontend
   - Creates Stripe checkout sessions for subscriptions
   - Handles both monthly and annual billing

2. **`/src/pages/api/webhooks/stripe.js`**
   - Processes webhook events for successful payments
   - Updates trainer subscription status in Supabase

---

## 🔧 **Technical Implementation**

### **Subscription Mode:**
```javascript
mode: 'subscription' // All products are recurring subscriptions
```

### **Metadata Tracking:**
```javascript
metadata: {
  trainerId: trainerId,  // Links payment to specific trainer
  priceId: priceId      // Tracks which plan was purchased
}
```

### **Success/Cancel URLs:**
```javascript
success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`
cancel_url: `${origin}/dashboard`
```

---

## 🎯 **Product Strategy**

### **Pricing Tiers:**
1. **Entry Level:** Annual Standard ($79/year) - Basic listing with discount
2. **Premium Level:** Monthly Premium ($49/month) - Enhanced visibility, flexible billing  
3. **Complete Package:** Combination for maximum exposure

### **Value Proposition:**
- **Annual Standard:** Cost-effective for committed trainers
- **Monthly Premium:** Higher visibility with flexibility
- **Complete Package:** Best of both worlds for serious business growth

---

## 🚨 **Important Notes**

### **Duplicate Price ID Usage:**
- The "Complete Package" uses the same price ID as "Annual Standard" 
- This may need to be updated if you want separate billing for the combo plan
- Currently, combo plan customers would only be charged for the annual portion

### **Missing Price IDs:**
- No separate price ID for the "Complete Package" billing
- Consider creating a dedicated combo plan in Stripe if needed

### **Environment Variables Status:**
- All price IDs are configured in `.env.local`
- Ready for Vercel deployment (need to add to Vercel environment variables)
- Currently using LIVE Stripe keys (production ready)

---

## 📋 **Next Steps**

### **If Creating New Products:**
1. Create products in Stripe Dashboard
2. Get new price IDs
3. Update environment variables
4. Update price IDs in frontend code

### **For Current Setup:**
All products are ready to use with existing configuration. Just ensure environment variables are set in Vercel for live deployment.
