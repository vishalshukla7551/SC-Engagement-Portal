import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ase/ase-leaderboard
 * Returns ASE-level leaderboard - ranking ASEs by their stores' total performance
 * Aggregates spot incentive data from all stores assigned to each ASE
 * - month query: number (1-12, optional - defaults to current month)
 * - year query: number (optional - defaults to current year)
 * - limit query: number (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get month and year from query params
    const now = new Date();
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    const month = monthParam ? parseInt(monthParam) - 1 : now.getMonth(); // 0-indexed
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    
    // Calculate date range for the selected month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month

    // Get all ASEs with their assigned stores
    const allASEs = await prisma.aSE.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        storeIds: true,
        zse: {
          select: {
            fullName: true,
            region: true,
          }
        }
      }
    });

    if (allASEs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          ases: [],
          month: month + 1,
          year,
          totalASEs: 0,
          totalSalesReports: 0
        }
      });
    }

    // Get all spot incentive reports within the selected month
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
        plan: true,
      },
    });

    // Create a map of storeId -> sales data
    const storeDataMap = new Map<string, {
      totalSales: number;
      totalIncentive: number;
      adldUnits: number;
      comboUnits: number;
      adldRevenue: number;
      comboRevenue: number;
    }>();

    salesReports.forEach((report) => {
      const storeKey = report.storeId;
      const isADLD = report.plan.planType === 'ADLD_1_YR';
      const isCombo = report.plan.planType === 'COMBO_2_YRS';

      if (storeDataMap.has(storeKey)) {
        const existing = storeDataMap.get(storeKey)!;
        existing.totalSales += 1;
        existing.totalIncentive += report.spotincentiveEarned;
        if (isADLD) {
          existing.adldUnits += 1;
          existing.adldRevenue += report.spotincentiveEarned;
        }
        if (isCombo) {
          existing.comboUnits += 1;
          existing.comboRevenue += report.spotincentiveEarned;
        }
      } else {
        storeDataMap.set(storeKey, {
          totalSales: 1,
          totalIncentive: report.spotincentiveEarned,
          adldUnits: isADLD ? 1 : 0,
          comboUnits: isCombo ? 1 : 0,
          adldRevenue: isADLD ? report.spotincentiveEarned : 0,
          comboRevenue: isCombo ? report.spotincentiveEarned : 0,
        });
      }
    });

    // Aggregate data by ASE (sum of all their assigned stores)
    const aseDataList = allASEs.map((ase) => {
      let totalSales = 0;
      let totalIncentive = 0;
      let adldUnits = 0;
      let comboUnits = 0;
      let adldRevenue = 0;
      let comboRevenue = 0;
      let storeCount = 0;

      ase.storeIds.forEach((storeId) => {
        const storeData = storeDataMap.get(storeId);
        if (storeData) {
          totalSales += storeData.totalSales;
          totalIncentive += storeData.totalIncentive;
          adldUnits += storeData.adldUnits;
          comboUnits += storeData.comboUnits;
          adldRevenue += storeData.adldRevenue;
          comboRevenue += storeData.comboRevenue;
          storeCount++;
        }
      });

      return {
        aseId: ase.id,
        aseName: ase.fullName,
        phone: ase.phone,
        zseName: ase.zse?.fullName || null,
        region: ase.zse?.region || null,
        storeCount: ase.storeIds.length,
        activeStoreCount: storeCount,
        totalSales,
        totalIncentive,
        adldUnits,
        comboUnits,
        adldRevenue,
        comboRevenue,
      };
    });

    // Sort by total incentive (descending) and assign ranks
    const sortedASEs = aseDataList
      .sort((a, b) => b.totalIncentive - a.totalIncentive)
      .slice(0, limit)
      .map((ase, index) => ({
        rank: index + 1,
        ...ase,
        totalIncentive: ase.totalIncentive > 0 ? `₹${ase.totalIncentive.toLocaleString('en-IN')}` : '₹0',
        adldRevenue: ase.adldRevenue > 0 ? `₹${ase.adldRevenue.toLocaleString('en-IN')}` : '₹0',
        comboRevenue: ase.comboRevenue > 0 ? `₹${ase.comboRevenue.toLocaleString('en-IN')}` : '₹0',
        totalIncentiveRaw: ase.totalIncentive,
      }));

    return NextResponse.json({
      success: true,
      data: {
        ases: sortedASEs,
        month: month + 1,
        year,
        totalASEs: allASEs.length,
        totalSalesReports: salesReports.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/ase/ase-leaderboard', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
