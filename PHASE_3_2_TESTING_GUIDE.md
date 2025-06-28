# 🎯 Phase 3.2: Stripe CLI Testing Guide

## ✅ **AUDIT COMPLETED**
The webhook handler has been fully audited and improved according to all audit requirements:

### **Audit Requirements Met:**
- ✅ **No hardcoded price IDs**: All references use `process.env.*` environment variables
- ✅ **Standard cancellation logic**: Single query updates both `payment_status` AND `premium_status`
- ✅ **Premium cancellation logic**: Only updates `premium_status`, leaves `payment_status` untouched
- ✅ **Enhanced logging**: Clear console.log() statements in each branch with trainer ID and field updates
- ✅ **Environment validation**: Startup checks for required environment variables
- ✅ **Clear variable extraction**: Consistent `priceId` and `trainerId` extraction

---

## 🧪 **TESTING PHASE 3.2: Stripe CLI Testing**

### **Prerequisites:**
1. **Stripe CLI installed**: `stripe --version`
2. **Local server running**: `npm run dev` (port 4321)
3. **Webhook forwarding active**: `stripe listen --forward-to localhost:4321/api/webhooks/stripe`
4. **Test trainer in database**: At least one trainer record with known ID

### **Test Environment Variables:**
```bash
STRIPE_ANNUAL_PRICE_ID=price_1RX0T2DEY1RddZfIATD9orLs  # Standard
STRIPE_MONTHLY_PRICE_ID=price_1RX0QxDEY1RddZfIoRdn84vS # Premium
```

---

## 🔬 **TEST SCENARIOS**

### **Test 1: Standard Subscription Cancellation**
**Objective**: Verify that cancelling Standard revokes both Standard AND Premium

**Command:**
```bash
stripe trigger customer.subscription.deleted \
  --event-data object.items.data[0].price.id=price_1RX0T2DEY1RddZfIATD9orLs \
  --event-data object.metadata.trainerId=TEST_TRAINER_ID
```

**Expected VS Code Terminal Output:**
```
🚨 STANDARD CANCELLATION DETECTED
   → Trainer ID: TEST_TRAINER_ID
   → Cancelled Price ID: price_1RX0T2DEY1RddZfIATD9orLs
   → Action: Setting payment_status=pending_standard AND premium_status=inactive
✅ SUCCESS: Standard cancelled → Both payment_status AND premium_status updated
   → Trainer TEST_TRAINER_ID: payment_status=pending_standard, premium_status=inactive
```

**Expected Database Result (Supabase):**
- `payment_status` = `'pending_standard'`
- `premium_status` = `'inactive'`

---

### **Test 2: Premium Subscription Cancellation**
**Objective**: Verify that cancelling Premium only affects Premium, leaving Standard intact

**Command:**
```bash
stripe trigger customer.subscription.deleted \
  --event-data object.items.data[0].price.id=price_1RX0QxDEY1RddZfIoRdn84vS \
  --event-data object.metadata.trainerId=TEST_TRAINER_ID
```

**Expected VS Code Terminal Output:**
```
🔄 PREMIUM CANCELLATION DETECTED
   → Trainer ID: TEST_TRAINER_ID
   → Cancelled Price ID: price_1RX0QxDEY1RddZfIoRdn84vS
   → Action: Setting premium_status=inactive (Standard unchanged)
✅ SUCCESS: Premium cancelled → Only premium_status updated
   → Trainer TEST_TRAINER_ID: premium_status=inactive (payment_status unchanged)
```

**Expected Database Result (Supabase):**
- `payment_status` = unchanged (should remain `'paid_standard'`)
- `premium_status` = `'inactive'`

---

### **Test 3: Unknown Price ID (Error Handling)**
**Objective**: Verify proper error handling for unknown price IDs

**Command:**
```bash
stripe trigger customer.subscription.deleted \
  --event-data object.items.data[0].price.id=price_UNKNOWN_INVALID_ID \
  --event-data object.metadata.trainerId=TEST_TRAINER_ID
```

**Expected VS Code Terminal Output:**
```
⚠️ UNKNOWN PRICE ID in subscription cancellation
   → Received priceId: price_UNKNOWN_INVALID_ID
   → Expected Standard: price_1RX0T2DEY1RddZfIATD9orLs
   → Expected Premium: price_1RX0QxDEY1RddZfIoRdn84vS
   → No database updates performed
```

**Expected Database Result (Supabase):**
- No changes to trainer record

---

## 📊 **TESTING CHECKLIST**

### **Before Testing:**
- [ ] Local development server running (`npm run dev`)
- [ ] Stripe CLI webhook forwarding active
- [ ] Test trainer record exists in Supabase
- [ ] Environment variables confirmed in terminal

### **During Testing:**
- [ ] **Test 1**: Standard cancellation → Both fields updated
- [ ] **Test 2**: Premium cancellation → Only premium_status updated  
- [ ] **Test 3**: Unknown price ID → No database changes
- [ ] Console logs are clear and match expected format
- [ ] Supabase Table Editor shows correct field updates

### **After Testing:**
- [ ] All test scenarios passed
- [ ] Database state is as expected
- [ ] No errors in webhook processing
- [ ] Ready for production deployment

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

**Issue**: "No trainer found" error
**Solution**: Verify trainer ID exists in Supabase `trainers` table

**Issue**: Environment variables not found
**Solution**: Check `.env.local` file and restart dev server

**Issue**: Webhook not receiving events
**Solution**: Ensure `stripe listen` is running and forwarding to correct port

**Issue**: Supabase permission errors
**Solution**: Verify `SUPABASE_SERVICE_KEY` is set correctly

---

## ✅ **SUCCESS CRITERIA**

**Phase 3.2 Complete When:**
1. ✅ All 3 test scenarios pass with expected output
2. ✅ Database updates match expected results
3. ✅ Console logs are clear and detailed
4. ✅ No webhook processing errors
5. ✅ Two-tier hierarchy properly enforced

**Next**: Ready for production deployment and live testing

---

## 📝 **TEST RESULTS TEMPLATE**

```
### Test Results - Phase 3.2

**Test 1 - Standard Cancellation:**
- [ ] Console output matches expected format
- [ ] payment_status updated to 'pending_standard'  
- [ ] premium_status updated to 'inactive'

**Test 2 - Premium Cancellation:**
- [ ] Console output matches expected format
- [ ] payment_status unchanged
- [ ] premium_status updated to 'inactive'

**Test 3 - Error Handling:**
- [ ] Warning message displayed
- [ ] No database changes made

**Overall Result:** ✅ PASS / ❌ FAIL
**Ready for Production:** ✅ YES / ❌ NO
```
