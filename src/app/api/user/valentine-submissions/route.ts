import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Valentine campaign start date: 10-02-2026
        const valentineStartDate = new Date('2026-02-10T00:00:00.000Z');

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

        // Calculate Profile Bonus (20 hearts if photo, birthday, and marital status are set)
        let profileBonus = 0;
        if (sec.otherProfileInfo && typeof sec.otherProfileInfo === 'object') {
            const info = sec.otherProfileInfo as any;
            // Check if all three required fields are present
            const hasPhoto = !!info.photoUrl;
            const hasBirthday = !!info.birthday;
            const hasMaritalStatus = !!info.maritalStatus; // Checks for existence of the object/value

            if (hasPhoto && hasBirthday && hasMaritalStatus) {
                profileBonus = 20;
            }
        }

        // Fetch ALL submissions from 10-02-2026 onwards (verified AND unverified)
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                secId: sec.id,
                Date_of_sale: {
                    gte: valentineStartDate
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

        // Calculate hearts for each submission (for both verified and unverified)
        const submissionsWithHearts = submissions.map(submission => {
            const planType = submission.plan?.planType || 'UNKNOWN';
            const hearts = getHeartsByPlanType(planType); // Calculate for all, regardless of verification status

            return {
                ...submission,
                heartsEarned: hearts
            };
        });

        // Calculate totals
        const verifiedCount = submissions.filter(s => s.spotincentivepaidAt !== null).length;
        const unverifiedCount = submissions.filter(s => s.spotincentivepaidAt === null).length;

        // Total hearts from verified submissions only
        const verifiedHearts = submissionsWithHearts
            .filter(s => s.spotincentivepaidAt !== null)
            .reduce((sum, s) => sum + s.heartsEarned, 0);

        const totalHearts = verifiedHearts + profileBonus;

        return NextResponse.json({
            submissions: submissionsWithHearts,
            verifiedCount,
            unverifiedCount,
            totalHearts: totalHearts,
            profileBonus,
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
