import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Heart point system - matches incentive form logic
const getHeartsByPlanType = (planType: string): number => {
    const type = (planType || '').toUpperCase();

    if (type.includes('COMBO')) {
        return 5;
    } else if (type.includes('ADLD') || type.includes('DAMAGE')) {
        return 3;
    } else if (type.includes('SCREEN') || type.includes('PROTECTION')) {
        return 1;
    } else if (type.includes('WARRANTY') || type.includes('EXTENDED')) {
        return 1;
    } else {
        return 1; // Default
    }
};

export async function GET() {
    try {
        // Valentine campaign start date: 10-02-2026
        const valentineStartDate = new Date('2026-02-10T00:00:00.000Z');

        // Fetch all approved submissions from campaign start onwards
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: valentineStartDate
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
                        otherProfileInfo: true,
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
            id: string;
            phone: string;
            name: string;
            store: string;
            hearts: number;
            submissions: number;
        }>();

        // 1. Process all SECs to ensure everyone appears on the leaderboard
        const allSecs = await prisma.sEC.findMany({
            select: {
                id: true,
                phone: true,
                fullName: true,
                otherProfileInfo: true,
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Initialize all SECs with their profile bonus (if applicable)
        allSecs.forEach(sec => {
            const info = sec.otherProfileInfo as any;
            let profileBonus = 0;

            // Check if they qualify for the 20 point profile bonus
            if (info && info.photoUrl && info.birthday && info.maritalStatus) {
                profileBonus = 20;
            }

            userHearts.set(sec.id, {
                id: sec.id,
                phone: sec.phone || sec.id,
                name: sec.fullName || sec.phone || 'Unknown',
                store: sec.store?.name || 'Unknown Store',
                hearts: profileBonus,
                submissions: 0
            });
        });

        // 2. Process submissions
        submissions.forEach((submission: any) => {
            const secId = submission.secId;
            const planType = submission.plan?.planType || 'UNKNOWN';
            const hearts = getHeartsByPlanType(planType);

            if (!userHearts.has(secId)) {
                // Initialize if not present (should be covered by allSecs but safety check)
                const info = submission.secUser?.otherProfileInfo as any;
                let profileBonus = 0;
                if (info && info.photoUrl && info.birthday && info.maritalStatus) {
                    profileBonus = 20;
                }

                userHearts.set(secId, {
                    id: secId,
                    phone: submission.secUser?.phone || secId,
                    name: submission.secUser?.fullName || submission.secUser?.phone || 'Unknown',
                    store: submission.secUser?.store?.name || 'Unknown Store',
                    hearts: profileBonus,
                    submissions: 0
                });
            }

            const userData = userHearts.get(secId)!;
            userData.hearts += hearts;
            userData.submissions += 1;
        });

        // Convert to array, filter users with at least 1 heart, and sort by hearts
        const leaderboard = Array.from(userHearts.values())
            .filter(user => user.hearts >= 1)
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
