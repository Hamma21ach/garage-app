import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const garageUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.enum(['MECHANIC', 'ELECTRIC', 'BODY_REPAIR', 'ALL_SERVICES'])).optional(),
  images: z.array(z.string()).optional(),
});

// GET single garage
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const garage = await prisma.garage.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        appointments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!garage) {
      return NextResponse.json({ error: 'Garage not found' }, { status: 404 });
    }

    return NextResponse.json(garage);
  } catch (error) {
    console.error('Error fetching garage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch garage' },
      { status: 500 }
    );
  }
}

// UPDATE garage
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const garage = await prisma.garage.findUnique({
      where: { id },
    });

    if (!garage) {
      return NextResponse.json({ error: 'Garage not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    if (
      session.user?.role !== 'ADMIN' &&
      garage.ownerId !== session.user?.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = garageUpdateSchema.parse(body);

    const updateData: any = {
      name: validatedData.name,
      description: validatedData.description,
      phone: validatedData.phone,
      specialties: validatedData.specialties,
    };

    // If address is updated, update both location and address
    if (validatedData.address) {
      updateData.location = validatedData.address;
      updateData.address = validatedData.address;
    }

    // Handle images/photos
    if (validatedData.images) {
      updateData.photos = validatedData.images;
    }

    const updatedGarage = await prisma.garage.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedGarage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating garage:', error);
    return NextResponse.json(
      { error: 'Failed to update garage' },
      { status: 500 }
    );
  }
}

// DELETE garage
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const garage = await prisma.garage.findUnique({
      where: { id },
    });

    if (!garage) {
      return NextResponse.json({ error: 'Garage not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    if (
      session.user?.role !== 'ADMIN' &&
      garage.ownerId !== session.user?.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.garage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Garage deleted successfully' });
  } catch (error) {
    console.error('Error deleting garage:', error);
    return NextResponse.json(
      { error: 'Failed to delete garage' },
      { status: 500 }
    );
  }
}
