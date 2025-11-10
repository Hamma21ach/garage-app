import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // Calculate subscription end date
    const now = new Date();
    const endsAt = new Date(now);
    if (plan === 'yearly') {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    // Update garage subscription
    await prisma.garage.update({
      where: { id: garageId },
      data: {
        subscriptionActive: true,
        subscriptionPlan: plan,
        subscriptionEndsAt: endsAt,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription activated successfully' 
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
