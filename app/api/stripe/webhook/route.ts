import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { garageId, plan } = session.metadata as { garageId: string; plan: string };

        // Get subscription details
        const subscriptionData = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        if (garageId && subscriptionData) {
          const currentPeriodEnd = (subscriptionData as any).current_period_end;
          
          await prisma.garage.update({
            where: { id: garageId },
            data: {
              subscriptionActive: true,
              subscriptionId: subscriptionData.id,
              subscriptionPlan: plan,
              subscriptionEndsAt: currentPeriodEnd 
                ? new Date(currentPeriodEnd * 1000) 
                : null,
              stripeCustomerId: session.customer as string,
            },
          });
          console.log(`Subscription activated for garage ${garageId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const currentPeriodEnd = (subscription as any).current_period_end;

        // Find garage by subscription ID
        const garage = await prisma.garage.findFirst({
          where: { subscriptionId: subscription.id },
        });

        if (garage) {
          await prisma.garage.update({
            where: { id: garage.id },
            data: {
              subscriptionActive: subscription.status === 'active',
              subscriptionEndsAt: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
            },
          });
          console.log(`Subscription updated for garage ${garage.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find garage by subscription ID
        const garage = await prisma.garage.findFirst({
          where: { subscriptionId: subscription.id },
        });

        if (garage) {
          await prisma.garage.update({
            where: { id: garage.id },
            data: {
              subscriptionActive: false,
              subscriptionId: null,
              subscriptionPlan: null,
              subscriptionEndsAt: null,
            },
          });
          console.log(`Subscription cancelled for garage ${garage.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscription = (invoice as any).subscription;
        
        if (invoiceSubscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            invoiceSubscription as string
          );
          const currentPeriodEnd = (subscriptionData as any).current_period_end;

          const garage = await prisma.garage.findFirst({
            where: { subscriptionId: subscriptionData.id },
          });

          if (garage) {
            await prisma.garage.update({
              where: { id: garage.id },
              data: {
                subscriptionActive: true,
                subscriptionEndsAt: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
              },
            });
            console.log(`Payment succeeded for garage ${garage.id}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscription = (invoice as any).subscription;

        if (invoiceSubscription) {
          const garage = await prisma.garage.findFirst({
            where: { subscriptionId: invoiceSubscription as string },
          });

          if (garage) {
            // Optionally notify owner about failed payment
            console.log(`Payment failed for garage ${garage.id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
