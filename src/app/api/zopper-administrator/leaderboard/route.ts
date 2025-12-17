import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/zopper-administrator/leaderboard
 * Same behavior as SEC leaderboard:
 * - Returns top stores, devices, plans for active spot incentive campaigns
 * - month query: number (1-12, optional - defaults to current month)
 * - year query: number (optional - defaults to current year)
 * - limit query: number (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get month and year from query params
    const now = new Date();
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth(); // 0-indexed
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    
    // Calculate date range for the selected month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month

    // Get all active campaigns
    const activeCampaigns = await prisma.spotIncentiveCampaign.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        storeId: true,
        samsungSKUId: true,
        planId: true,
      },
    });

    if (activeCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          stores: [],
          devices: [],
          plans: [],
          month: month + 1,
          year,
          activeCampaignsCount: 0,
        },
      });
    }

    // Get sales reports for active campaigns within the selected month
    const salesReports = await prisma.spotIncentiveReport.findMany({
      where: {
        isCompaignActive: true,
        Date_of_sale: { 
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        store: true,
        samsungSKU: true,
        plan: true,
      },
    });

    // Aggregate by store
    const storeMap = new Map<
      string,
      {
        storeId: string;
        storeName: string;
        city: string | null;
        totalSales: number;
        totalIncentive: number;
      }
    >();

    // Aggregate by device (Samsung SKU)
    const deviceMap = new Map<
      string,
      {
        deviceId: string;
        deviceName: string;
        category: string;
        totalSales: number;
        totalIncentive: number;
      }
    >();

    // Aggregate by plan
    const planMap = new Map<
      string,
      {
        planId: string;
        planType: string;
        planPrice: number;
        totalSales: number;
        totalIncentive: number;
      }
    >();

    salesReports.forEach((report) => {
      // Store aggregation
      const storeKey = report.storeId;
      if (storeMap.has(storeKey)) {
        const existing = storeMap.get(storeKey)!;
        existing.totalSales += 1;
        existing.totalIncentive += report.spotincentiveEarned;
      } else {
        storeMap.set(storeKey, {
          storeId: report.store.id,
          storeName: report.store.name,
          city: report.store.city,
          totalSales: 1,
          totalIncentive: report.spotincentiveEarned,
        });
      }

      // Device aggregation
      const deviceKey = report.samsungSKUId;
      if (deviceMap.has(deviceKey)) {
        const existing = deviceMap.get(deviceKey)!;
        existing.totalSales += 1;
        existing.totalIncentive += report.spotincentiveEarned;
      } else {
        deviceMap.set(deviceKey, {
          deviceId: report.samsungSKU.id,
          deviceName: report.samsungSKU.ModelName,
          category: report.samsungSKU.Category,
          totalSales: 1,
          totalIncentive: report.spotincentiveEarned,
        });
      }

      // Plan aggregation
      const planKey = report.planId;
      if (planMap.has(planKey)) {
        const existing = planMap.get(planKey)!;
        existing.totalSales += 1;
        existing.totalIncentive += report.spotincentiveEarned;
      } else {
        planMap.set(planKey, {
          planId: report.plan.id,
          planType: report.plan.planType,
          planPrice: report.plan.price,
          totalSales: 1,
          totalIncentive: report.spotincentiveEarned,
        });
      }
    });

    // Convert to arrays and sort by total sales (descending)
    const topStores = Array.from(storeMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit)
      .map((store, index) => ({
        rank: index + 1,
        ...store,
        totalIncentive: store.totalIncentive > 0 ? `₹${store.totalIncentive.toLocaleString('en-IN')}` : '-',
      }));

    const topDevices = Array.from(deviceMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit)
      .map((device, index) => ({
        rank: index + 1,
        ...device,
        totalIncentive: device.totalIncentive > 0 ? `₹${device.totalIncentive.toLocaleString('en-IN')}` : '-',
      }));

    const topPlans = Array.from(planMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit)
      .map((plan, index) => ({
        rank: index + 1,
        ...plan,
        planPrice: plan.planPrice > 0 ? `₹${plan.planPrice.toLocaleString('en-IN')}` : '-',
        totalIncentive: plan.totalIncentive > 0 ? `₹${plan.totalIncentive.toLocaleString('en-IN')}` : '-',
      }));

    return NextResponse.json({
      success: true,
      data: {
        stores: topStores,
        devices: topDevices,
        plans: topPlans,
        month: month + 1,
        year,
        activeCampaignsCount: activeCampaigns.length,
        totalSalesReports: salesReports.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/zopper-administrator/leaderboard', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
