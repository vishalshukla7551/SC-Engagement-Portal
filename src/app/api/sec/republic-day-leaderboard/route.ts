import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

const RANKS = [
    { id: 'general', title: 'General', minSales: 1000000 },
    { id: 'brigadier', title: 'Brigadier', minSales: 600000 },
    { id: 'colonel', title: 'Colonel', minSales: 400000 },
    { id: 'major', title: 'Major', minSales: 200000 },
    { id: 'captain', title: 'Captain', minSales: 100000 },
    { id: 'lieutenant', title: 'Lieutenant', minSales: 50000 },
    { id: 'cadet', title: 'Cadet', minSales: 0 },
];

function getRank(sales: number) {
    return RANKS.find(r => sales >= r.minSales) || RANKS[RANKS.length - 1];
}

function getNextRank(currentRankId: string) {
    const currentIndex = RANKS.findIndex(r => r.id === currentRankId);
    // RANKS is ordered descending (General first), so next rank (higher sales) is index - 1
    if (currentIndex <= 0) return null; // Already General
    return RANKS[currentIndex - 1];
}

export async function GET(req: NextRequest) {
    try {
        // 1. Auth Check
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== ('SEC' as Role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Current SEC ID
        const currentSec = await prisma.sEC.findUnique({
            where: { phone: authUser.id },
            select: { id: true, fullName: true }
        });

        if (!currentSec) {
            return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
        }

        // 3. Fetch Sales Data (Republic Day Campaign - e.g., from Jan 1, 2026)
        // Adjust start date as needed.
        const startDate = new Date('2026-01-01T00:00:00.000Z');

        const reports = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: startDate
                }
            },
            select: {
                secId: true,
                plan: {
                    select: {
                        price: true
                    }
                },
                secUser: {
                    select: {
                        fullName: true,
                        employeeId: true,
                        store: {
                            select: {
                                city: true
                            }
                        }
                    }
                }
            }
        });

        // 4. Aggregation
        const userSalesMap = new Map<string, {
            secId: string,
            name: string,
            city: string,
            salesAmount: number
        }>();

        reports.forEach(report => {
            if (!report.secUser) return; // Skip if no user attached (shouldn't happen)

            const { secId } = report;
            const sales = report.plan?.price || 0;

            if (!userSalesMap.has(secId)) {
                userSalesMap.set(secId, {
                    secId: secId,
                    name: report.secUser.fullName || 'Unknown',
                    city: report.secUser.store?.city || '',
                    salesAmount: 0
                });
            }

            const userData = userSalesMap.get(secId)!;
            userData.salesAmount += sales;
        });

        // 5. Process Ranks and Sort
        const allUsers = Array.from(userSalesMap.values()).map(user => {
            const rankObj = getRank(user.salesAmount);
            return {
                ...user,
                rankId: rankObj.id,
                rankTitle: rankObj.title,
                minSalesForRank: rankObj.minSales
            };
        });

        // 6. Build Response Structure
        const leaderboards: Record<string, any[]> = {};

        // Initialize empty arrays
        RANKS.forEach(r => leaderboards[r.id] = []);

        // Group users
        allUsers.forEach(user => {
            leaderboards[user.rankId].push(user);
        });

        // Sort and Top 3
        Object.keys(leaderboards).forEach(rankId => {
            leaderboards[rankId].sort((a, b) => b.salesAmount - a.salesAmount);
            // We keep strictly Top 3 for display
            leaderboards[rankId] = leaderboards[rankId].slice(0, 3);
        });

        // 7. Get Current User Stats forms THE FULL LIST (before slice)
        // We need to find the user in `allUsers` to know their exact global stats
        const currentUserData = allUsers.find(u => u.secId === currentSec.id);

        let userResponse = null;
        if (currentUserData) {
            // Find position in their rank
            const rankUsers = allUsers.filter(u => u.rankId === currentUserData.rankId)
                .sort((a, b) => b.salesAmount - a.salesAmount);
            const position = rankUsers.findIndex(u => u.secId === currentSec.id) + 1;

            const nextRank = getNextRank(currentUserData.rankId);

            userResponse = {
                secId: currentUserData.secId,
                name: currentUserData.name,
                salesAmount: currentUserData.salesAmount,
                rankId: currentUserData.rankId,
                rankTitle: currentUserData.rankTitle,
                positionInRank: position, // e.g. 5th in Captain
                nextRank: nextRank ? {
                    title: nextRank.title,
                    targetSales: nextRank.minSales,
                    remaining: Math.max(0, nextRank.minSales - currentUserData.salesAmount)
                } : null
            };
        } else {
            // User has no sales yet
            userResponse = {
                secId: currentSec.id,
                name: currentSec.fullName,
                salesAmount: 0,
                rankId: 'cadet',
                rankTitle: 'Cadet',
                positionInRank: 0,
                nextRank: {
                    title: 'Lieutenant',
                    targetSales: 50000,
                    remaining: 50000
                }
            };
        }

        return NextResponse.json({
            success: true,
            leaderboards,
            currentUser: userResponse
        });

    } catch (error) {
        console.error('Error in Republic Day Leaderboard API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
