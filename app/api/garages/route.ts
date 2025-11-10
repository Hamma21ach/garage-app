import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const garageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  address: z.string().min(2, 'Address is required'),
  phone: z.string().optional(),
  specialties: z.array(z.enum(['MECHANIC', 'ELECTRIC', 'BODY_REPAIR', 'ALL_SERVICES'])),
  images: z.array(z.string()).optional(),
});

// GET all garages (public) or owner's garages
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');
    const ownerId = searchParams.get('ownerId');

    let whereClause: any = {};

    // If owner is logged in and no specific ownerId requested, show their garages
    if (session?.user?.role === 'OWNER') {
      // If ownerId is specified, use it; otherwise use session user id
      whereClause.ownerId = ownerId || session.user.id;
    } 
    // For public or non-owner users
    else if (session?.user?.role === 'ADMIN') {
      // Admins see all garages
      if (ownerId) whereClause.ownerId = ownerId;
    } else {
      // For public, only show approved and active subscription garages
      whereClause.isApproved = true;
      whereClause.subscriptionActive = true;
    }

    // Filter by specialty
    if (specialty && specialty !== 'ALL_SERVICES') {
      whereClause.specialties = {
        has: specialty,
      };
    }

    const garages = await prisma.garage.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(garages);
  } catch (error) {
    console.error('Error fetching garages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch garages' },
      { status: 500 }
    );
  }
}

// CREATE new garage
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = garageSchema.parse(body);

    const garage = await prisma.garage.create({
      data: {
        name: validatedData.name,
        location: validatedData.address, // Use address as location
        address: validatedData.address,
        phone: validatedData.phone,
        specialties: validatedData.specialties,
        description: validatedData.description,
        photos: validatedData.images || [],
        ownerId: session.user.id,
      },
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

    return NextResponse.json(garage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating garage:', error);
    return NextResponse.json(
      { error: 'Failed to create garage' },
      { status: 500 }
    );
  }
}
