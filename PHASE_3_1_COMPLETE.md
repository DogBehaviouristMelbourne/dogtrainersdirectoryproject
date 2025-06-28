# ✅ Phase 3.1 Complete: Updated Webhook Handler

## 🎯 **OBJECTIVE ACHIEVED**
Successfully updated the Stripe webhook handler to auto-revoke Premium on Standard cancellation, maintaining the strict two-tier subscription hierarchy.

---

## 🔧 **IMPLEMENTATION DETAILS**

### **File Modified**: `/src/pages/api/webhooks/stripe.js`

### **Changes Made**:

#### **1. Enhanced `customer.subscription.deleted` Event Handler**

**Previous Logic:**
- Standard cancellation: Only set `payment_status = 'pending_standard'`  
- Premium cancellation: Only set `premium_status = 'inactive'`

**New Logic (Two-Tier Hierarchy Enforced):**
- **Standard cancellation**: Set BOTH `payment_status = 'pending_standard'` AND `premium_status = 'inactive'`
- **Premium cancellation**: Only set `premium_status = 'inactive'` (Standard remains active)

#### **2. Specific Implementation**

```javascript
if (planId === import.meta.env.STRIPE_ANNUAL_PRICE_ID || planId === 'price_1RX0T2DEY1RddZfIATD9orLs') {
  // Standard Annual plan cancelled - REVOKE BOTH Standard AND Premium
  console.log('🚨 Standard subscription cancelled - revoking both Standard and Premium access');
  
  const { error: updateError } = await supabase
    .from('trainers')
    .update({ 
      payment_status: 'pending_standard',
      premium_status: 'inactive'
    })
    .eq('id', trainerIdDeleted);
    
} else if (planId === import.meta.env.STRIPE_MONTHLY_PRICE_ID || planId === 'price_1RX0QxDEY1RddZfIoRdn84vS') {
  // Premium Monthly plan cancelled - only revoke Premium
  console.log('🔄 Premium subscription cancelled - keeping Standard active');
  
  const { error: updateError } = await supabase
    .from('trainers')
    .update({ premium_status: 'inactive' })
    .eq('id', trainerIdDeleted);
}
```

#### **3. Enhanced Logging**
- Clear differentiation between Standard vs Premium cancellations
- Detailed status update confirmations
- Better debugging information

---

## 🎯 **BUSINESS LOGIC ENFORCEMENT**

### **Hierarchy Rules Maintained:**
1. ✅ **Premium depends on Standard**: When Standard is cancelled, Premium is automatically revoked
2. ✅ **Standard independence**: Premium can be cancelled without affecting Standard
3. ✅ **Clean state management**: Proper status transitions for both subscription types

### **Subscription Flow:**
- **Standard Active + Premium Active** → **Standard Cancelled** → **Both Inactive**
- **Standard Active + Premium Active** → **Premium Cancelled** → **Standard Active + Premium Inactive**

---

## 🔍 **TESTING PREPARATION**

### **Ready for Phase 3.2 Testing:**
- Webhook handler updated and deployed
- Logic ready to handle both cancellation scenarios
- Enhanced logging for verification during testing

### **Test Scenarios to Verify:**
1. **Standard Cancellation Test**: Verify both statuses become inactive
2. **Premium Cancellation Test**: Verify only Premium becomes inactive
3. **Database Update Test**: Confirm Supabase records are properly updated

---

## 📊 **STATUS UPDATE**

| Phase           | Task ID | Description                                                                            | Status     |
| --------------- | ------- | -------------------------------------------------------------------------------------- | ---------- |
| **1. VS Code**  | **1.1** | Enforce Standard-only check in `/api/create-checkout-session`                          | ✅ Done     |
| **2. Supabase** | **2.1** | Create `deactivate_expired_premiums()` SQL function                                    | ✅ Done     |
|                 | **2.2** | Schedule `deactivate_expired_premiums()` via pg\_cron extension (SQL: `cron.schedule`) | ✅ Done     |
| **3. Stripe**   | **3.1** | Update webhook handler to auto-revoke Premium on Standard cancellation                 | ✅ **Done** |
|                 | **3.2** | Test Standard cancellation event via Stripe CLI                                        | ❌ Not Done |

---

## ▶️ **NEXT STEP: Phase 3.2**
Ready to proceed with testing the Standard cancellation event via Stripe CLI to verify the webhook handler behavior.

**🎉 Task 3.1 Complete!**
