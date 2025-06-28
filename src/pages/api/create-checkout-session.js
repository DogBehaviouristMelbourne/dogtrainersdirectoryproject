/**
 * POST  /api/create-checkout-session
 * ----------------------------------
 * Body   : { priceId, trainerId, planName }
 * Return : { sessionId }  – Stripe Checkout
 */

import Stripe from 'stripe';
import { supabaseService } from '../../lib/supabaseClient.js';

// Safe environment variable extraction with fallbacks
const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY || '';
const STRIPE_ANNUAL_PRICE_ID = import.meta.env.STRIPE_ANNUAL_PRICE_ID || '';
const STRIPE_MONTHLY_PRICE_ID = import.meta.env.STRIPE_MONTHLY_PRICE_ID || '';

// Check for build-time environment
const isBuildTime = typeof window === 'undefined' && (
  !import.meta.env.PUBLIC_SUPABASE_URL || 
  !STRIPE_SECRET_KEY ||
  STRIPE_SECRET_KEY === '' ||
  STRIPE_SECRET_KEY.startsWith('placeholder')
);

// Initialize Stripe with fallback for build time
let stripe = null;
if (!isBuildTime && STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.length > 10) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
    console.log('✅ Stripe client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe client:', error.message);
  }
} else {
  console.log('⚠️ Build time or missing Stripe key - using fallback configuration');
}

const supabase = supabaseService;

/* ──────────────────────────────────────────────────────────────────────────── */
export async function POST({ request }) {
  try {
    // Check if we're in build mode
    if (isBuildTime || !stripe) {
      console.log('⚠️ Stripe not available during build - returning safe fallback');
      return json({
        success: false,
        error: 'Stripe service not available during build',
        sessionId: null
      });
    }

    const { priceId, trainerId, planName = 'unknown' } = await request.json();

    if (!priceId || !trainerId)
      return json({ error: 'Missing priceId or trainerId' }, 400);

    console.log(`➜ Create checkout for trainer ${trainerId} | plan ${planName} | price ${priceId}`);

    /* ── Premium hierarchy check – must have Standard active ─────────────── */
    if (planName === 'premium') {
      const eligible = await hasActiveStandard(trainerId);
      if (!eligible)
        return json(
          { error: 'Premium requires an active Standard subscription.' },
          403,
        );
    }

    const origin  = request.headers.get('origin') || 'http://localhost:4321';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { trainerId, priceId, planName },
      success_url: `${origin}/trainers?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url : `${origin}/trainers?cancelled=true`,
      allow_promotion_codes   : true,
      billing_address_collection: 'required',
      customer_email: trainerId.includes('@') ? trainerId : undefined,
    });

    console.log(`✅ Stripe session ${session.id} created`);
    return json({ sessionId: session.id }, 200);

  } catch (err) {
    console.error('💥 create-checkout-session error:', err);
    return json({ error: 'Failed to create checkout session', details: err.message }, 500);
  }
}

/* ──────────────────────────────────────────────────────────────────────────── */
export async function GET() {
  return json({ error: 'Method not allowed. Use POST.' }, 405);
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
async function hasActiveStandard(trainerId) {
  // Return true during build to prevent failures
  if (isBuildTime || !supabase) {
    console.log('⚠️ Build time - skipping database check for trainer hierarchy');
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('trainers')
      .select('payment_status')
      .eq(trainerId.includes('@') ? 'email' : 'id', trainerId)
      .single();

    if (error) {
      console.error('Supabase lookup failed:', error);
      return false;
    }
    const ok = data?.payment_status === 'paid_standard';
    if (!ok) console.log(`Trainer ${trainerId} → no active Standard`);
    return ok;
  } catch (error) {
    console.error('Error checking trainer standard status:', error);
    return false;
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
