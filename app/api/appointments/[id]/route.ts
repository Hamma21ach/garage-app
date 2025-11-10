import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const appointmentResponseSchema = z.object({
  costEstimate: z.number().positive().optional(),
  durationDays: z.number().positive().int().optional(),
  appointmentDate: z.string().optional(),
  ownerNotes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'CANCELLED']).optional(),
});

// GET single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
            ownerId: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = appointment.garage.ownerId === session.user?.id;
    const isUser = appointment.userId === session.user?.id;
    const isAdmin = session.user?.role === 'ADMIN';

    if (!isOwner && !isUser && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// UPDATE appointment (owner response or status update)
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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        garage: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = appointment.garage.ownerId === session.user?.id;
    const isAdmin = session.user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = appointmentResponseSchema.parse(body);

    const updateData: any = { ...validatedData };

    // Convert appointmentDate string to Date if provided
    if (validatedData.appointmentDate) {
      updateData.appointmentDate = new Date(validatedData.appointmentDate);
    }

    // Set confirmedAt when status changes to CONFIRMED
    if (validatedData.status === 'CONFIRMED' && appointment.status !== 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    }

    // Set completedAt when status changes to DONE
    if (validatedData.status === 'DONE' && appointment.status !== 'DONE') {
      updateData.completedAt = new Date();
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE appointment
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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        garage: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions - user can cancel their own, owner/admin can delete any
    const isOwner = appointment.garage.ownerId === session.user?.id;
    const isUser = appointment.userId === session.user?.id;
    const isAdmin = session.user?.role === 'ADMIN';

    if (!isOwner && !isUser && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
