// Plan: Build a webhook endpoint at /api/webhooks/stripe to receive Stripe events.
// Implementation:
// 1. Read raw body and Stripe signature from headers.
// 2. Use stripe.webhooks.constructEvent to verify.
// 3. For each event type (e.g., checkout.session.completed, customer.subscription.deleted),
//    simply log the event type and data to the console for now.
// Expected Results:
// - When Stripe CLI forwards an event, this endpoint logs something like:
//   "Received event: checkout.session.completed" and the event object to your terminal.

// Plan: When we receive a checkout.session.completed or customer.subscription.deleted
// event, update the corresponding trainer in Supabase.
// Implementation:
// 1. Import and initialize Supabase client with URL and service key from env.
// 2. On checkout.session.completed:
//    - Grab event.data.object.metadata.trainerId and event.data.object.items.data[0].price.id.
//    - If priceId matches the annual price, set payment_status='paid_standard' and set standard_start/end dates.
//    - If priceId matches the monthly price, set premium_status='active' and set premium_start/end dates.
// 3. On customer.subscription.deleted:
//    - Grab event.data.object.metadata.trainerId and plan id.
//    - If monthly plan ended, set premium_status='inactive'.
//    - If annual plan ended, set payment_status='pending_standard'.
// Expected Results:
// - After payments via Stripe CLI, your local server will update the `trainers` table in Supabase accordingly.

import Stripe from 'stripe';
import { supabaseService as supabase } from '../../../lib/supabaseClient.js';

/**
 * Plan: Audit and verify the Stripe webhook handler to ensure our two‐tier subscription
 *       logic is correctly enforced and robust.
 *
 * Rationale:
 *   - Prevent bugs in production by validating key code paths:
 *     • Standard cancellation must revoke Premium and mark Standard as pending.
 *     • Premium cancellation must only revoke Premium, leaving Standard intact.
 *     • No hard-coded price IDs; always use environment variables.
 *   - Ensure clear, testable console logs for each branch.
 *
 * Implementation Steps:
 *   1. Open this file in VS Code and locate the `if (event.type === 'customer.subscription.deleted')` block.
 *   2. Confirm extraction of `priceId` via 
 *        const priceId = event.data.object.items.data[0].price.id;
 *      and `trainerId` via metadata.
 *   3. Verify branch for Standard price:
 *        if (priceId === process.env.STANDARD_PRICE_ID) { … }
 *      contains a single Supabase .update() call setting both
 *        payment_status: 'pending_standard' AND premium_status: 'inactive'.
 *   4. Verify branch for Premium price:
 *        if (priceId === process.env.PREMIUM_PRICE_ID) { … }
 *      contains only premium_status: 'inactive', leaving payment_status untouched.
 *   5. Ensure console.log() calls exist in each branch, logging the event type,
 *      trainerId, and which fields were updated.
 *   6. Save this file and restart your local server.
 *   7. Use Stripe CLI (`stripe trigger customer.subscription.deleted --event-data …`)
 *      to fire both Standard and Premium cancellations, and watch VS Code's terminal:
 *        – You should see your console.log() messages.
 *        – In Supabase's Table Editor, the trainer record must reflect the correct updates.
 *
 * Expected Deliverables & Output:
 *   • Updated `stripe.js` where:
 *     – No literal price IDs remain; all references use `process.env.*`.  
 *     – Standard cancellation branch updates both fields in one query.  
 *     – Premium cancellation branch updates only `premium_status`.  
 *     – Clear console.log() statements in each branch.  
 *   • Successful test runs in terminal showing log output.  
 *   • Trainer rows in Supabase updated correctly after each test event.
 */

// Check for build-time environment
const isBuildTime = typeof window === 'undefined' && (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.STRIPE_SECRET_KEY);

if (isBuildTime) {
  console.log('⚠️ Build time detected - Stripe webhook will use fallback configuration');
}

// Initialize with fallbacks for build time
const stripe = isBuildTime 
  ? null 
  : new Stripe(import.meta.env.STRIPE_SECRET_KEY);

const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

// Environment variable validation (audit requirement)
const STANDARD_PRICE_ID = import.meta.env.STRIPE_ANNUAL_PRICE_ID;
const PREMIUM_PRICE_ID = import.meta.env.STRIPE_MONTHLY_PRICE_ID;

// Validate required environment variables on startup (runtime only)
if (!isBuildTime && (!STANDARD_PRICE_ID || !PREMIUM_PRICE_ID)) {
  const errorMsg = '🚨 CRITICAL: Missing required price ID environment variables';
  console.error(errorMsg);
  console.error(`   STRIPE_ANNUAL_PRICE_ID: ${STANDARD_PRICE_ID ? '✅ Set' : '❌ Missing'}`);
  console.error(`   STRIPE_MONTHLY_PRICE_ID: ${PREMIUM_PRICE_ID ? '✅ Set' : '❌ Missing'}`);
  console.error('⚠️ Stripe webhook will not function properly without these variables');
} else if (!isBuildTime) {
  console.log('🔧 Webhook handler initialized with price IDs:');
  console.log(`   Standard (Annual): ${STANDARD_PRICE_ID}`);
  console.log(`   Premium (Monthly): ${PREMIUM_PRICE_ID}`);
}

export async function POST(context) {
  const { request } = context;

  try {
    // Return safe response during build time
    if (isBuildTime || !stripe) {
      console.log('⚠️ Stripe webhook not available during build - returning OK');
      return new Response('Webhook not available during build', { status: 200 });
    }

    // Get the raw body as text
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return new Response('Missing signature', { status: 400 });
    }

    let event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Log the event for debugging
    console.log('🎉 Received event:', event.type);
    console.log('📦 Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Checkout session completed!');
        const session = event.data.object;
        console.log('Session ID:', session.id);
        console.log('Customer ID:', session.customer);
        console.log('Subscription ID:', session.subscription);
        console.log('Metadata:', session.metadata);

        // Update trainer in Supabase
        if (session.metadata && session.metadata.trainerId) {
          const trainerId = session.metadata.trainerId;
          
          // Get price ID from line items
          let priceId = null;
          if (session.line_items && session.line_items.data && session.line_items.data.length > 0) {
            priceId = session.line_items.data[0].price.id;
          } else if (session.amount_total && session.metadata.priceId) {
            // Fallback to metadata if line_items not available
            priceId = session.metadata.priceId;
          }

          console.log('Price ID:', priceId);
          console.log('Trainer ID:', trainerId);

          if (!priceId) {
            console.warn('⚠️ Could not determine price ID from checkout session');
            break;
          }

          // Check if the priceId matches the annual or monthly price
          const { data: trainerData, error: trainerError } = await supabase
            .from('trainers')
            .select('id, payment_status, premium_status')
            .eq('id', trainerId)
            .single();

          if (trainerError) {
            console.error('❌ Error fetching trainer:', trainerError);
            break;
          }

          console.log('Found trainer:', trainerData);

          if (priceId === STANDARD_PRICE_ID) {
            // Update for Standard Annual plan
            console.log('💳 STANDARD SUBSCRIPTION ACTIVATED');
            console.log(`   → Trainer ID: ${trainerId}`);
            console.log(`   → Price ID: ${priceId}`);
            
            const now = new Date();
            const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
            
            const { error: updateError } = await supabase
              .from('trainers')
              .update({
                payment_status: 'paid_standard',
                standard_start_date: now.toISOString(),
                standard_end_date: endDate.toISOString()
              })
              .eq('id', trainerId);
              
            if (updateError) {
              console.error('❌ Error updating trainer for Standard plan:', updateError);
            } else {
              console.log('✅ SUCCESS: Standard subscription activated');
              console.log(`   → Trainer ${trainerId}: payment_status=paid_standard`);
            }
            
          } else if (priceId === PREMIUM_PRICE_ID) {
            // Update for Premium Monthly plan
            console.log('⭐ PREMIUM SUBSCRIPTION ACTIVATED');
            console.log(`   → Trainer ID: ${trainerId}`);
            console.log(`   → Price ID: ${priceId}`);
            
            const now = new Date();
            const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
            
            const { error: updateError } = await supabase
              .from('trainers')
              .update({
                premium_status: 'active',
                premium_start_date: now.toISOString(),
                premium_end_date: endDate.toISOString()
              })
              .eq('id', trainerId);
              
            if (updateError) {
              console.error('❌ Error updating trainer for Premium plan:', updateError);
            } else {
              console.log('✅ SUCCESS: Premium subscription activated');
              console.log(`   → Trainer ${trainerId}: premium_status=active`);
            }
            
          } else {
            console.warn('⚠️ UNKNOWN PRICE ID in checkout completion');
            console.warn(`   → Received priceId: ${priceId}`);
            console.warn(`   → Expected Standard: ${STANDARD_PRICE_ID}`);
            console.warn(`   → Expected Premium: ${PREMIUM_PRICE_ID}`);
          }
        } else {
          console.warn('⚠️ No trainerId found in checkout session metadata');
        }

        break;

      case 'customer.subscription.created':
        console.log('🔄 New subscription created!');
        const subscription = event.data.object;
        console.log('Subscription ID:', subscription.id);
        console.log('Customer ID:', subscription.customer);
        console.log('Status:', subscription.status);
        break;

      case 'customer.subscription.updated':
        console.log('📝 Subscription updated!');
        const updatedSub = event.data.object;
        console.log('Subscription ID:', updatedSub.id);
        console.log('New Status:', updatedSub.status);
        break;

      case 'customer.subscription.deleted':
        console.log('❌ Subscription deleted!');
        const deletedSub = event.data.object;
        console.log('Subscription ID:', deletedSub.id);
        console.log('Customer ID:', deletedSub.customer);
        console.log('Metadata:', deletedSub.metadata);

        // Extract priceId and trainerId as per audit requirements
        if (deletedSub.metadata && deletedSub.metadata.trainerId) {
          const trainerId = deletedSub.metadata.trainerId;
          const priceId = deletedSub.items.data[0].price.id;
          
          console.log(`🔍 Processing cancellation for trainer: ${trainerId}, priceId: ${priceId}`);

          if (priceId === STANDARD_PRICE_ID) {
            // Standard cancellation: Revoke BOTH Standard AND Premium (audit requirement)
            console.log('🚨 STANDARD CANCELLATION DETECTED');
            console.log(`   → Trainer ID: ${trainerId}`);
            console.log(`   → Cancelled Price ID: ${priceId}`);
            console.log('   → Action: Setting payment_status=pending_standard AND premium_status=inactive');
            
            const { error: updateError } = await supabase
              .from('trainers')
              .update({ 
                payment_status: 'pending_standard',
                premium_status: 'inactive'
              })
              .eq('id', trainerId);
              
            if (updateError) {
              console.error('❌ ERROR updating trainer for Standard cancellation:', updateError);
            } else {
              console.log('✅ SUCCESS: Standard cancelled → Both payment_status AND premium_status updated');
              console.log(`   → Trainer ${trainerId}: payment_status=pending_standard, premium_status=inactive`);
            }
            
          } else if (priceId === PREMIUM_PRICE_ID) {
            // Premium cancellation: Only revoke Premium, keep Standard intact (audit requirement)
            console.log('🔄 PREMIUM CANCELLATION DETECTED');
            console.log(`   → Trainer ID: ${trainerId}`);
            console.log(`   → Cancelled Price ID: ${priceId}`);
            console.log('   → Action: Setting premium_status=inactive (Standard unchanged)');
            
            const { error: updateError } = await supabase
              .from('trainers')
              .update({ premium_status: 'inactive' })
              .eq('id', trainerId);
              
            if (updateError) {
              console.error('❌ ERROR updating trainer for Premium cancellation:', updateError);
            } else {
              console.log('✅ SUCCESS: Premium cancelled → Only premium_status updated');
              console.log(`   → Trainer ${trainerId}: premium_status=inactive (payment_status unchanged)`);
            }
            
          } else {
            console.warn('⚠️ UNKNOWN PRICE ID in subscription cancellation');
            console.warn(`   → Received priceId: ${priceId}`);
            console.warn(`   → Expected Standard: ${STANDARD_PRICE_ID}`);
            console.warn(`   → Expected Premium: ${PREMIUM_PRICE_ID}`);
            console.warn('   → No database updates performed');
          }
        } else {
          console.warn('⚠️ No trainerId found in subscription metadata');
          console.warn('   → Subscription metadata:', deletedSub.metadata);
        }

        break;

      case 'invoice.payment_succeeded':
        console.log('💰 Payment succeeded!');
        const invoice = event.data.object;
        console.log('Invoice ID:', invoice.id);
        console.log('Amount paid:', invoice.amount_paid);
        break;

      case 'invoice.payment_failed':
        console.log('💸 Payment failed!');
        const failedInvoice = event.data.object;
        console.log('Invoice ID:', failedInvoice.id);
        console.log('Amount due:', failedInvoice.amount_due);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    // Return success response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Webhook handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Handle non-POST requests
export async function GET() {
  return new Response('Webhook endpoint. Use POST only.', { status: 405 });
}
