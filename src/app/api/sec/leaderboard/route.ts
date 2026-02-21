import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

const RELIANCE_STORE_PREFIX = 'Reliance Digital';
const RELIANCE_CAMPAIGN_START = new Date('2026-02-19T00:00:00+05:30');
const UAT_SEC_PHONES = (process.env.UAT_SEC_PHONES || '').split(',').filter(Boolean);

/**
 * GET /api/sec/leaderboard
 * Reliance Digital campaign leaderboard — stores ranked by total incentive earned.
 * Only accessible by SECs from Reliance Digital stores.
 */
export async function GET(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch all Reliance campaign reports (campaign = RELIANCE_DIGITAL_2026)
    const reports: any[] = await prisma.spotIncentiveReport.findMany({
      where: {
        Date_of_sale: { gte: RELIANCE_CAMPAIGN_START },
        store: {
          name: { startsWith: RELIANCE_STORE_PREFIX },
        },
        // Exclude UAT SEC users
        secUser: {
          phone: {
            notIn: UAT_SEC_PHONES
          }
        }
      },
      include: {
        store: {
          select: { id: true, name: true, city: true },
        },
        plan: {
          select: { id: true, planType: true, price: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by store
    const storeMap = new Map<string, {
      storeId: string;
      storeName: string;
      city: string | null;
      totalSales: number;
      totalIncentive: number;
      adldUnits: number;
      comboUnits: number;
    }>();

    reports.forEach((report: any) => {
      const isADLD = report.plan.planType === 'ADLD_1_YR';
      const isCombo = report.plan.planType === 'COMBO_2_YRS';
      const key = report.storeId;

      if (storeMap.has(key)) {
        const s = storeMap.get(key)!;
        s.totalSales += 1;
        s.totalIncentive += report.spotincentiveEarned || 0;
        if (isADLD) s.adldUnits += 1;
        if (isCombo) s.comboUnits += 1;
      } else {
        storeMap.set(key, {
          storeId: report.store.id,
          storeName: report.store.name,
          city: report.store.city,
          totalSales: 1,
          totalIncentive: report.spotincentiveEarned || 0,
          adldUnits: isADLD ? 1 : 0,
          comboUnits: isCombo ? 1 : 0,
        });
      }
    });

    const topStores = Array.from(storeMap.values())
      .sort((a, b) => b.totalIncentive - a.totalIncentive)
      .slice(0, limit)
      .map((store, index) => ({
        rank: index + 1,
        storeId: store.storeId,
        storeName: store.storeName,
        city: store.city,
        totalSales: store.totalSales,
        totalIncentive: store.totalIncentive > 0
          ? `₹${store.totalIncentive.toLocaleString('en-IN')}`
          : '₹0',
        adldUnits: store.adldUnits,
        comboUnits: store.comboUnits,
        adldRevenue: '-',
        comboRevenue: '-',
      }));

    return NextResponse.json({
      success: true,
      data: {
        stores: topStores,
        devices: [],
        plans: [],
        period: 'campaign',
        activeCampaignsCount: topStores.length > 0 ? 1 : 0,
        totalSalesReports: reports.length,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/sec/leaderboard', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
