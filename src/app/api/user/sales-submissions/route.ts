import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== 'SEC') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secPhone = authUser.username;

        // Find SEC user
        const secUser = await prisma.sEC.findUnique({
            where: { phone: secPhone },
        });

        if (!secUser) {
            return NextResponse.json({ error: 'SEC not found' }, { status: 404 });
        }

        // Fetch submissions
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                secId: secUser.id
            },
            include: {
                plan: true,
                samsungSKU: true
            },
            orderBy: {
                createdAt: 'desc' // Newest first
            }
        });

        return NextResponse.json({ submissions });

    } catch (error) {
        console.error('Error fetching submissions', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
