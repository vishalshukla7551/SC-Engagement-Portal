import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sec/incentive-form/stores
 * Returns list of all stores for the incentive form dropdown
 */
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
