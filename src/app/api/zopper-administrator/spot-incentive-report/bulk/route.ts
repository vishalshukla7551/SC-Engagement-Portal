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
      console.log('=== BULK APPROVE DEBUG ===');
      console.log('IDs received:', JSON.stringify(ids, null, 2));
      console.log('Number of IDs:', ids.length);

      // First, let's check how many of these reports exist and are unpaid
      const existingReports = await prisma.spotIncentiveReport.findMany({
        where: {
          id: { in: ids }
        },
        select: {
          id: true,
          spotincentivepaidAt: true,
          imei: true
        }
      });

      console.log('Existing reports found:', existingReports.length);

      const unpaidReports = existingReports.filter(r => !r.spotincentivepaidAt);
      console.log('Unpaid reports count:', unpaidReports.length);

      // Use individual updates instead of updateMany (MongoDB limitation with Prisma)
      const updatePromises = unpaidReports.map(report =>
        prisma.spotIncentiveReport.update({
          where: { id: report.id },
          data: { spotincentivepaidAt: new Date() }
        })
      );

      const updateResults = await Promise.all(updatePromises);
      console.log('Successfully updated:', updateResults.length, 'reports');
      console.log('=== END DEBUG ===');

      result = { count: updateResults.length };
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
