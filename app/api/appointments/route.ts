import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  garageId: z.string(),
  carModel: z.string().min(1, 'Car model is required'),
  carYear: z.string().min(1, 'Year is required'),
  description: z.string().min(1, 'Description is required'),
  photos: z.array(z.string()).optional(),
});

const appointmentResponseSchema = z.object({
  costEstimate: z.number().positive().optional(),
  durationDays: z.number().positive().int().optional(),
  appointmentDate: z.string().optional(),
  ownerNotes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'CANCELLED']).optional(),
});

// GET appointments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const garageId = searchParams.get('garageId');
    const userId = searchParams.get('userId');

    let whereClause: any = {};

    // Users see their own appointments
    if (session.user?.role === 'USER') {
      whereClause.userId = session.user.id;
    }
    // Owners see appointments for their garages
    else if (session.user?.role === 'OWNER') {
      if (garageId) {
        // Verify garage belongs to owner
        const garage = await prisma.garage.findFirst({
          where: {
            id: garageId,
            ownerId: session.user.id,
          },
        });

        if (!garage) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        whereClause.garageId = garageId;
      } else {
        // Get all appointments for all owner's garages
        const ownerGarages = await prisma.garage.findMany({
          where: { ownerId: session.user.id },
          select: { id: true },
        });

        whereClause.garageId = {
          in: ownerGarages.map((g: { id: string }) => g.id),
        };
      }
    }
    // Admins see all appointments
    else if (session.user?.role === 'ADMIN') {
      if (userId) whereClause.userId = userId;
      if (garageId) whereClause.garageId = garageId;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        garage: {
          select: {
            id: true,
            name: true,
            location: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// CREATE appointment
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    // Verify garage exists and is active
    const garage = await prisma.garage.findFirst({
      where: {
        id: validatedData.garageId,
        isApproved: true,
        subscriptionActive: true,
      },
    });

    if (!garage) {
      return NextResponse.json(
        { error: 'Garage not found or not available' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        garage: {
          select: {
            id: true,
            name: true,
            location: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
