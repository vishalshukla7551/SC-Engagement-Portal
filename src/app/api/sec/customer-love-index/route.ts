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

        // Fetch SECs with profile info to ensure they get the bonus even without sales
        const secsWithProfile = await prisma.sEC.findMany({
            where: {
                otherProfileInfo: {
                    not: null
                }
            },
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

        // Group by SEC and calculate hearts
        const userHearts = new Map<string, {
            id: string; // Add ID
            phone: string;
            name: string;
            store: string;
            hearts: number;
            submissions: number;
        }>();

        // Helper to init user and add profile bonus
        const initUser = (secId: string, secData: any) => {
            if (userHearts.has(secId)) return;

            let profileBonus = 0;
            const info = secData?.otherProfileInfo as any;
            if (info && info.photoUrl && info.birthday && info.maritalStatus) {
                profileBonus = 20;
            }

            // If user has no sales and no bonus, we might not want to show them? 
            // But if they are in this list, they might get sales later.
            // For now, we add them if they have bonus OR are being called from sales loop.

            userHearts.set(secId, {
                id: secId, // Add ID for unique key
                phone: secData?.phone || secId,
                name: secData?.fullName || secData?.phone || 'Unknown',
                store: secData?.store?.name || 'Unknown Store',
                hearts: profileBonus,
                submissions: 0
            });
        };

        // 1. Process valid profiles
        secsWithProfile.forEach(sec => {
            const info = sec.otherProfileInfo as any;
            // Only add to leaderboard if they actually qualify for the 20 pts (or have sales later)
            // Here we strictly check for bonus qualification to avoid flooding leaderboard with 0 pt users
            if (info && info.photoUrl && info.birthday && info.maritalStatus) {
                initUser(sec.id, sec);
            }
        });

        // 2. Process submissions
        submissions.forEach((submission: any) => {
            const secId = submission.secId;
            const planType = submission.plan?.planType || 'UNKNOWN';
            const hearts = PLAN_HEARTS[planType as keyof typeof PLAN_HEARTS] || 0;

            if (!userHearts.has(secId)) {
                // Initialize if not present (e.g. profile was incomplete or not loaded)
                initUser(secId, submission.secUser);
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
