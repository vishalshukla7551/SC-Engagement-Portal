import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sec/incentive-form/reports?secPhone=xxx
 * Get all sales reports for a specific SEC user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secPhone = searchParams.get('secPhone');

    if (!secPhone) {
      return NextResponse.json(
        { error: 'secPhone is required' },
        { status: 400 }
      );
    }

    // Find SEC user by phone
    const secUser = await prisma.sEC.findUnique({
      where: { phone: secPhone },
    });

    if (!secUser) {
      return NextResponse.json(
        { error: 'SEC user not found' },
        { status: 404 }
      );
    }

    // Fetch all sales reports for this SEC user
    const reports = await prisma.spotIncentiveSalesReport.findMany({
      where: {
        secId: secUser.id,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        samsungSKU: {
          select: {
            id: true,
            Category: true,
            ModelName: true,
          },
        },
        plan: {
          select: {
            id: true,
            planType: true,
            price: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Calculate totals
    const totalIncentiveEarned = reports.reduce(
      (sum, report) => sum + report.incentiveEarned,
      0
    );
    const totalPaid = reports
      .filter((report) => report.isPaid)
      .reduce((sum, report) => sum + report.incentiveEarned, 0);
    const totalPending = totalIncentiveEarned - totalPaid;

    return NextResponse.json(
      {
        reports,
        summary: {
          totalReports: reports.length,
          totalIncentiveEarned,
          totalPaid,
          totalPending,
          paidReports: reports.filter((r) => r.isPaid).length,
          pendingReports: reports.filter((r) => !r.isPaid).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sales reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales reports' },
      { status: 500 }
    );
  }
}
