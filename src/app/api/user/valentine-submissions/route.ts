import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

// New heart point system
const PLAN_HEARTS = {
    'ADLD_1_YR': 3,
    'COMBO_2_YRS': 5,
    'SCREEN_PROTECT_1_YR': 1,
    'SCREEN_PROTECT_2_YR': 1,
    'EXTENDED_WARRANTY_1_YR': 1,
    'TEST_PLAN': 0
};

export async function GET(request: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch SEC details first
        const sec = await prisma.sEC.findUnique({
            where: { phone: authUser.id },
            include: {
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!sec) {
            return NextResponse.json({ error: 'SEC not found' }, { status: 404 });
        }

        // Fetch submissions from today onwards, only verified ones
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                secId: sec.id,
                Date_of_sale: {
                    gte: today
                },
                spotincentivepaidAt: {
                    not: null
                }
            },
            include: {
                plan: {
                    select: {
                        planType: true,
                        price: true
                    }
                },
                samsungSKU: {
                    select: {
                        ModelName: true,
                        Category: true
                    }
                }
            },
            orderBy: {
                Date_of_sale: 'desc'
            }
        });

        // Calculate hearts for each submission
        const submissionsWithHearts = submissions.map(submission => {
            const planType = submission.plan?.planType || 'UNKNOWN';
            const hearts = PLAN_HEARTS[planType as keyof typeof PLAN_HEARTS] || 0;

            return {
                ...submission,
                heartsEarned: hearts
            };
        });

        // Calculate totals
        const verifiedCount = submissions.length;
        const unverifiedCount = await prisma.spotIncentiveReport.count({
            where: {
                secId: sec.id,
                Date_of_sale: {
                    gte: today
                },
                spotincentivepaidAt: null
            }
        });

        const totalHearts = submissionsWithHearts.reduce((sum, s) => sum + s.heartsEarned, 0);

        return NextResponse.json({
            submissions: submissionsWithHearts,
            verifiedCount,
            unverifiedCount,
            totalHearts,
            storeName: sec?.store?.name || 'Unknown Store',
            userName: sec?.fullName || authUser.id
        });

    } catch (error) {
        console.error('Error fetching valentine submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}
