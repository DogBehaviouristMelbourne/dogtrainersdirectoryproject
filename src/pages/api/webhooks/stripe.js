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
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase client with service role key for database updates
const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_KEY
);

export async function POST({ request }) {
  try {
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

          if (priceId === import.meta.env.STRIPE_ANNUAL_PRICE_ID) {
            // Update for annual plan
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
              console.error('❌ Error updating trainer for annual plan:', updateError);
            } else {
              console.log('✅ Trainer updated to paid_standard (annual)');
            }
          } else if (priceId === import.meta.env.STRIPE_MONTHLY_PRICE_ID) {
            // Update for monthly plan  
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
              console.error('❌ Error updating trainer for monthly plan:', updateError);
            } else {
              console.log('✅ Trainer updated to active premium (monthly)');
            }
          } else {
            console.warn('⚠️ Unknown price ID:', priceId);
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

        // Update trainer in Supabase
        if (deletedSub.metadata && deletedSub.metadata.trainerId) {
          const trainerIdDeleted = deletedSub.metadata.trainerId;
          const planId = deletedSub.items.data[0].price.id;

          if (planId === import.meta.env.STRIPE_MONTHLY_PLAN_ID) {
            // Monthly plan ended
            const { error: updateError } = await supabase
              .from('trainers')
              .update({ premium_status: 'inactive' })
              .eq('id', trainerIdDeleted);
              
            if (updateError) {
              console.error('Error updating trainer for cancelled monthly plan:', updateError);
            } else {
              console.log('✅ Trainer premium status set to inactive');
            }
          } else if (planId === import.meta.env.STRIPE_ANNUAL_PLAN_ID) {
            // Annual plan ended
            const { error: updateError } = await supabase
              .from('trainers')
              .update({ payment_status: 'pending_standard' })
              .eq('id', trainerIdDeleted);
              
            if (updateError) {
              console.error('Error updating trainer for cancelled annual plan:', updateError);
            } else {
              console.log('✅ Trainer payment status set to pending_standard');
            }
          }
        } else {
          console.warn('⚠️ No trainerId found in subscription metadata');
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
