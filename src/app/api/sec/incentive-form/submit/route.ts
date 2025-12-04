import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Check if IMEI already exists
    const existingReport = await prisma.spotIncentiveSalesReport.findUnique({
      where: { imei },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
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

    // Calculate incentive (example: 10% of plan price)
    // TODO: Update this logic based on your actual incentive calculation rules
    const incentivePercentage = 0.10; // 10%
    const incentiveEarned = Math.round(plan.price * incentivePercentage);

    // Create the sales report
    const salesReport = await prisma.spotIncentiveSalesReport.create({
      data: {
        secId: secUser.id,
        storeId: store.id,
        samsungSKUId: device.id,
        planId: plan.id,
        imei,
        planPrice: plan.price,
        incentiveEarned,
        isPaid: false,
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

    return NextResponse.json(
      {
        message: 'Sales report submitted successfully',
        salesReport,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting sales report:', error);
    
    // Handle specific Prisma errors
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit sales report' },
      { status: 500 }
    );
  }
}
