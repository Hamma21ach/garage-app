import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const [totalUsers, totalGarages, totalAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.garage.count(),
      prisma.appointment.count(),
    ]);

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get appointments by status
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get pending garage approvals
    const pendingGarages = await prisma.garage.count({
      where: { isApproved: false },
    });

    // Get active subscriptions
    const activeSubscriptions = await prisma.garage.count({
      where: { subscriptionActive: true },
    });

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get monthly appointments data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "appointments"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `;

    return NextResponse.json({
      totalUsers,
      totalGarages,
      totalAppointments,
      usersByRole,
      appointmentsByStatus,
      pendingGarages,
      activeSubscriptions,
      recentUsers,
      monthlyAppointments,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
