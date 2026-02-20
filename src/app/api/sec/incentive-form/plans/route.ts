import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sec/incentive-form/plans?deviceId=xxx
 * Get all plans for a specific device
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId parameter is required' },
        { status: 400 }
      );
    }

    // Verify device exists
    const device = await prisma.samsungSKU.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    /**
     * Plan types excluded from the Reliance Digital 2026 campaign.
     * These plans earn ₹0 incentive and should not be shown to SECs.
     */
    const EXCLUDED_PLAN_TYPES = [
      'SCREEN_PROTECT_1_YR',
      'SCREEN_PROTECT_2_YR',
      'EXTENDED_WARRANTY_1_YR',
    ] as PlanType[];


    // Get all eligible plans for this device (excludes campaign-ineligible types)
    const plans = await prisma.plan.findMany({
      where: {
        samsungSKUId: deviceId,
        planType: { notIn: EXCLUDED_PLAN_TYPES },
      },
      orderBy: {
        price: 'asc',
      },
      select: {
        id: true,
        planType: true,
        price: true,
      },
    });

    // Format plan labels for display
    const formattedPlans = plans.map((plan) => {
      let label: string = plan.planType;
      // Format plan type for display
      if (label.includes('_')) {
        label = label.replace(/_/g, ' ');
      }
      // Capitalize first letter of each word
      label = label
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        id: plan.id,
        planType: plan.planType,
        price: plan.price,
        label,
      };
    });

    return NextResponse.json({
      plans: formattedPlans,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

