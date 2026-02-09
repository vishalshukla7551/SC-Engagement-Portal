import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// New heart point system
const PLAN_HEARTS = {
    'ADLD_1_YR': 3,
    'COMBO_2_YRS': 5,
    'SCREEN_PROTECT_1_YR': 1,
    'SCREEN_PROTECT_2_YR': 1,
    'EXTENDED_WARRANTY_1_YR': 1,
    'TEST_PLAN': 0
};

export async function GET() {
    try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all approved submissions from today onwards
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
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
                        planType: true
                    }
                },
                secUser: {
                    select: {
                        id: true,
                        phone: true,
                        fullName: true,
                        store: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Group by SEC and calculate hearts
        const userHearts = new Map<string, {
            phone: string;
            name: string;
            store: string;
            hearts: number;
            submissions: number;
        }>();

        submissions.forEach((submission: any) => {
            const secId = submission.secId;
            const planType = submission.plan?.planType || 'UNKNOWN';
            const hearts = PLAN_HEARTS[planType as keyof typeof PLAN_HEARTS] || 0;

            if (!userHearts.has(secId)) {
                userHearts.set(secId, {
                    phone: submission.secUser?.phone || secId,
                    name: submission.secUser?.fullName || submission.secUser?.phone || 'Unknown',
                    store: submission.secUser?.store?.name || 'Unknown Store',
                    hearts: 0,
                    submissions: 0
                });
            }

            const userData = userHearts.get(secId)!;
            userData.hearts += hearts;
            userData.submissions += 1;
        });

        // Convert to array and sort by hearts
        const leaderboard = Array.from(userHearts.values())
            .sort((a, b) => b.hearts - a.hearts);

        return NextResponse.json({
            leaderboard,
            totalUsers: leaderboard.length,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching customer love index:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
