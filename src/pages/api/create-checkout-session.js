// Plan: Expose an API endpoint that takes { priceId, trainerId } in the POST body
// and returns a Stripe Checkout session ID.
// Implementation:
// 1. Read priceId and trainerId from the JSON body.
// 2. Call stripe.checkout.sessions.create with:
//    - mode: 'subscription'
//    - line_items: [{ price: priceId, quantity: 1 }]
//    - metadata: { trainerId }
//    - success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`
//    - cancel_url: `${origin}/dashboard`
// Expected Results:
// - POSTing to this endpoint returns { sessionId } to redirect the trainer to Stripe checkout.

import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export async function POST({ request }) {
  try {
    const { priceId, trainerId } = await request.json();
    
    if (!priceId || !trainerId) {
      return new Response(
        JSON.stringify({ error: 'Missing priceId or trainerId' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:4321';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        trainerId: trainerId,
        priceId: priceId,
      },
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle non-POST requests
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST.' }), 
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
