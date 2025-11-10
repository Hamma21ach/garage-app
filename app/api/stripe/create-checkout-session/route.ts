import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { garageId, plan } = await req.json();

    if (!garageId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get price ID based on plan
    const priceId = plan === 'yearly' 
      ? process.env.STRIPE_YEARLY_PRICE_ID 
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ 
        error: 'Stripe not configured. Please add price IDs to environment variables.' 
      }, { status: 500 });
    }

    // Get the base URL from the request or environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXTAUTH_URL || 
                    `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        garageId,
        userId: session.user.id,
        plan,
      },
      success_url: `${baseUrl}/owner/dashboard?subscription=success&garageId=${garageId}&plan=${plan}`,
      cancel_url: `${baseUrl}/owner/subscription?garageId=${garageId}&canceled=true`,
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
