import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    if (!['approve', 'discard'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      // Approve all selected reports
      result = await prisma.spotIncentiveReport.updateMany({
        where: {
          id: { in: ids },
          spotincentivepaidAt: null // Only approve not-already-paid
        },
        data: {
          spotincentivepaidAt: new Date()
        }
      });
    } else if (action === 'discard') {
      // Discard/Delete all selected reports
      // Note: We might want to just delete them as per current single discard logic
      // Assuming single discard does a delete or an update to a deleted status.
      // Based on user request "delete", I will check current implementation next.
      // But usually deleteMany is the way.
      result = await prisma.spotIncentiveReport.deleteMany({
        where: {
          id: { in: ids }
        }
      });
    }

    return NextResponse.json({
      success: true,
      count: result?.count || 0,
      message: `Successfully ${action === 'approve' ? 'approved' : 'discarded'} ${result?.count} reports`
    });

  } catch (error) {
    console.error('Error in bulk action:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
