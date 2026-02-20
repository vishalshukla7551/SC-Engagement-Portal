import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

const CAMPAIGN_START = new Date('2026-02-19T00:00:00.000+05:30');

/**
 * GET /api/sec/incentive-form/selfie-status
 *
 * Checks whether the current SEC has already uploaded a POSM selfie
 * in the Reliance Digital 2026 campaign.
 *
 * Returns:
 *   { hasSelfie: boolean, selfieUrl: string | null }
 */
export async function GET(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== 'SEC') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secUser = await prisma.sEC.findUnique({
            where: { phone: authUser.username },
            select: { id: true },
        });

        if (!secUser) {
            return NextResponse.json({ error: 'SEC not found' }, { status: 404 });
        }

        // Find the first SpotIncentiveReport in this campaign that has a selfieUrl
        const reportWithSelfie = await prisma.spotIncentiveReport.findFirst({
            where: {
                secId: secUser.id,
                Date_of_sale: { gte: CAMPAIGN_START },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Extract selfieUrl from metadata (stored as JSON)
        const metadata = reportWithSelfie?.metadata as Record<string, any> | null;
        const selfieUrl: string | null = metadata?.selfieUrl ?? null;
        const hasSelfie = !!selfieUrl;

        return NextResponse.json({ hasSelfie, selfieUrl }, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/sec/incentive-form/selfie-status', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
