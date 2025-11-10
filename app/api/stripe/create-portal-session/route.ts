import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { garageId } = await req.json();

    // Get garage to find customer ID
    const garage = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { stripeCustomerId: true },
    });

    if (!garage?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No subscription found for this garage' 
      }, { status: 400 });
    }

    // Get the base URL from the request or environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXTAUTH_URL || 
                    `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`;

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: garage.stripeCustomerId,
      return_url: `${baseUrl}/owner/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
