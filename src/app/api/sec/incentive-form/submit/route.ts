import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

/**
 * POST /api/sec/incentive-form/submit
 * Submit a spot incentive sales report
 * 
 * Body:
 * {
 *   secPhone: string,
 *   storeId: string,
 *   deviceId: string,
 *   planId: string,
 *   imei: string,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'SEC') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { secPhone, storeId, deviceId, planId, imei } = body;

    // Validate required fields
    if (!secPhone || !storeId || !deviceId || !planId || !imei) {
      return NextResponse.json(
        { error: 'All fields are required: secPhone, storeId, deviceId, planId, imei' },
        { status: 400 }
      );
    }

    // Validate IMEI format (15 digits)
    const imeiRegex = /^\d{15}$/;
    if (!imeiRegex.test(imei)) {
      return NextResponse.json(
        { error: 'IMEI must be exactly 15 digits' },
        { status: 400 }
      );
    }

    // Verify SEC phone matches authenticated user
    if (authUser.username !== secPhone) {
      return NextResponse.json(
        { error: 'SEC phone does not match authenticated user' },
        { status: 403 }
      );
    }

    // Find SEC user by phone
    const secUser = await prisma.sEC.findUnique({
      where: { phone: secPhone },
    });

    if (!secUser) {
      return NextResponse.json(
        { error: 'SEC user not found. Please login first.' },
        { status: 404 }
      );
    }

    // Check if IMEI already exists
    const existingReport = await prisma.salesReport.findUnique({
      where: { imei },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
      );
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
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

    // Verify plan exists and get price
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Verify plan belongs to the selected device
    if (plan.samsungSKUId !== deviceId) {
      return NextResponse.json(
        { error: 'Selected plan does not belong to the selected device' },
        { status: 400 }
      );
    }

    // Check for active spot incentive campaign
    // Only give spot incentive if an active campaign exists
    let activeCampaign = null;
    try {
      const now = new Date();
      // Check for active campaign matching store, device, and plan
      // Note: If no campaigns exist, this will return null (which is fine)
      // Using optional chaining to handle cases where Prisma client hasn't been regenerated
      activeCampaign = await (prisma as any).spotIncentiveCampaign?.findFirst({
        where: {
          storeId: store.id,
          samsungSKUId: device.id,
          planId: plan.id,
          active: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }) || null;
    } catch (error: any) {
      // If campaign model doesn't exist or query fails, continue without spot incentive
      // This handles cases where campaigns haven't been set up yet or there's a schema mismatch
      // Also handles cases where Prisma client needs regeneration/restart
      console.warn('Error checking for campaign (campaigns may not be set up yet):', error?.message || error);
      activeCampaign = null;
    }

    // Calculate spot incentive only if campaign exists
    let spotincentiveEarned = 0;
    let campaignId: string | undefined = undefined;

    if (activeCampaign) {
      if (activeCampaign.incentiveType === 'FIXED') {
        spotincentiveEarned = Math.round(activeCampaign.incentiveValue);
      } else if (activeCampaign.incentiveType === 'PERCENTAGE') {
        spotincentiveEarned = Math.round(plan.price * (activeCampaign.incentiveValue / 100));
      }
      campaignId = activeCampaign.id;
    }
    // If no campaign, spotincentiveEarned remains 0

    // Get current month and year for SalesSummary
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // 1-12
    const year = currentDate.getFullYear();

    // Create or update SalesSummary for this month/year
    // First, find or create SalesSummary
    let salesSummary = await prisma.salesSummary.findFirst({
      where: {
        secId: secUser.id,
        month,
        year,
      },
    });

    if (!salesSummary) {
      // Create new SalesSummary
      // totalSamsungIncentiveEarned is optional - will be set at payment date
      salesSummary = await prisma.salesSummary.create({
        data: {
          secId: secUser.id,
          month,
          year,
          totalSpotIncentiveEarned: 0,
          // totalSamsungIncentiveEarned will be set later at payment date
        },
      });
    }

    // Create the sales report
    const salesReport = await prisma.salesReport.create({
      data: {
        secId: secUser.id,
        storeId: store.id,
        samsungSKUId: device.id,
        planId: plan.id,
        imei,
        spotincentiveEarned,
        salesSummaryId: salesSummary.id,
        spotIncentiveCampaignId: campaignId || null,
      },
      include: {
        secUser: {
          select: {
            id: true,
            phone: true,
            fullName: true,
          },
        },
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
    });

    // Update SalesSummary totals
    // Get all sales reports for this month/year to recalculate totals
    const monthReports = await prisma.salesReport.findMany({
      where: {
        salesSummaryId: salesSummary.id,
      },
    });

    // Calculate total spot incentive (only from reports with campaigns)
    const totalSpotIncentive = monthReports.reduce(
      (sum, report) => sum + report.spotincentiveEarned,
      0
    );

    // Update SalesSummary with spot incentive total
    // Note: totalSamsungIncentiveEarned is not set here - it will be decided at payment date
    await prisma.salesSummary.update({
      where: { id: salesSummary.id },
      data: {
        totalSpotIncentiveEarned: totalSpotIncentive,
        // totalSamsungIncentiveEarned will be set later when payment is processed
      },
    });

    return NextResponse.json(
      {
        success: true,
        salesReport: {
          id: salesReport.id,
          imei: salesReport.imei,
          incentiveEarned: salesReport.spotincentiveEarned,
          submittedAt: salesReport.submittedAt,
          store: salesReport.store,
          device: salesReport.samsungSKU,
          plan: salesReport.plan,
          hasCampaign: !!activeCampaign,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sec/incentive-form/submit', error);
    
    // Handle Prisma unique constraint violation (duplicate IMEI)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

