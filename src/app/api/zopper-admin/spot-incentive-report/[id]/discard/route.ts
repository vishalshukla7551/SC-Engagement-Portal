import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

/**
 * POST /api/zopper-admin/spot-incentive-report/[id]/discard
 * Discard (delete) a spot incentive report
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Delete the report
    await prisma.spotIncentiveReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({
      success: true,
      message: 'Report discarded successfully',
    });

  } catch (error) {
    console.error('Error discarding report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}