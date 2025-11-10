import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH - Approve/Reject garage
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isApproved } = await req.json();

    const garage = await prisma.garage.update({
      where: { id },
      data: { isApproved },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(garage);
  } catch (error) {
    console.error('Error updating garage approval:', error);
    return NextResponse.json(
      { error: 'Failed to update garage' },
      { status: 500 }
    );
  }
}
