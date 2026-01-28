import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

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

        // Fetch ALL submissions (verified and unverified)
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

        // Separate verified and unverified
        const verifiedSubmissions = submissions.filter(s => s.spotincentivepaidAt !== null);
        const unverifiedSubmissions = submissions.filter(s => s.spotincentivepaidAt === null);

        // Calculate verified sales total
        const verifiedSalesTotal = verifiedSubmissions.reduce((sum, s) => sum + (s.plan?.price || 0), 0);

        // Check if user is bonus user
        const hasBonus = BONUS_PHONE_NUMBERS.includes(secPhone);

        // Bonus only on verified sales
        const bonusAmount = hasBonus ? 21000 : 0;
        const totalPoints = verifiedSalesTotal + bonusAmount;

        return NextResponse.json({ 
            submissions,
            verifiedCount: verifiedSubmissions.length,
            unverifiedCount: unverifiedSubmissions.length,
            verifiedSalesTotal,
            bonusAmount,
            totalPoints,
            hasBonus
        });

    } catch (error) {
        console.error('Error fetching submissions', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
