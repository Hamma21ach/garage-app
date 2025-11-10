import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { garageId, plan } = await req.json();

    if (!garageId || !plan) {
      return NextResponse.json(
        { error: 'Garage ID and plan are required' },
        { status: 400 }
      );
    }

    // Verify garage belongs to user
    const garage = await prisma.garage.findFirst({
      where: {
        id: garageId,
        ownerId: session.user.id,
      },
    });

    if (!garage) {
      return NextResponse.json({ error: 'Garage not found' }, { status: 404 });
    }

    const priceId =
      plan === 'monthly'
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }

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
      success_url: `${process.env.NEXTAUTH_URL}/owner/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/owner/dashboard?canceled=true`,
      metadata: {
        garageId: garage.id,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
