import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sec/incentive-form/plans?deviceId=xxx
 * Returns list of plans for a specific device (Samsung SKU)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    // Fetch plans for the specific device
    const plans = await prisma.plan.findMany({
      where: {
        samsungSKUId: deviceId,
      },
      select: {
        id: true,
        planType: true,
        price: true,
      },
      orderBy: {
        planType: 'asc',
      },
    });

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'No plans found for this device' },
        { status: 404 }
      );
    }

    // Map plan types to display labels
    const plansWithLabels = plans.map((plan) => ({
      id: plan.id,
      planType: plan.planType,
      label: getPlanTypeLabel(plan.planType),
      price: plan.price,
    }));

    return NextResponse.json({ plans: plansWithLabels }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// Helper function to convert PlanType enum to display label
function getPlanTypeLabel(planType: string): string {
  const labels: Record<string, string> = {
    SCREEN_PROTECT_1_YR: 'Screen Protect 1 Year',
    ADLD_1_YR: 'ADLD 1 Year',
    COMBO_2_YRS: 'Combo 2 Years',
    EXTENDED_WARRANTY_1_YR: 'Extended Warranty 1 Year',
    TEST_PLAN: 'Test Plan',
  };
  return labels[planType] || planType;
}
