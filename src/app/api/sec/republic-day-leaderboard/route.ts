import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

// RANKS Updated to match Republic Day Hero Page thresholds
const RANKS = [
    { id: 'brigadier', title: 'Sales Chief Marshal', minSales: 150000 },
    { id: 'colonel', title: 'Sales Commander', minSales: 120000 },
    { id: 'major', title: 'Sales Major', minSales: 90000 },
    { id: 'captain', title: 'Sales Captain', minSales: 51000 },
    { id: 'lieutenant', title: 'Sales Lieutenant', minSales: 21000 },
    { id: 'cadet', title: 'Salesveer', minSales: 0 },
];

function getRank(sales: number) {
    return RANKS.find(r => sales >= r.minSales) || RANKS[RANKS.length - 1];
}

function getNextRank(currentRankId: string) {
    const currentIndex = RANKS.findIndex(r => r.id === currentRankId);
    if (currentIndex <= 0) return null;
    return RANKS[currentIndex - 1];
}

export async function GET(req: NextRequest) {
    try {
        // 1. Auth Check
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || (authUser.role !== 'SEC' && authUser.role !== 'ZOPPER_ADMINISTRATOR')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Current SEC ID (Only if user is SEC)
        let currentSec = null;
        if (authUser.role === 'SEC') {
            currentSec = await prisma.sEC.findUnique({
                where: { phone: authUser.id },
                select: { id: true, fullName: true }
            });

            if (!currentSec) {
                return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
            }
        }

        // 3. Fetch Sales Data
        const startDate = new Date('2026-01-01T00:00:00.000Z');

        const reports = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: startDate
                },
                spotincentivepaidAt: { not: null },
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
                                name: true // Changed from city to name
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
            storeName: string,
            salesAmount: number
        }>();

        reports.forEach(report => {
            if (!report.secUser) return;

            const { secId } = report;
            const sales = report.plan?.price || 0;

            if (!userSalesMap.has(secId)) {
                userSalesMap.set(secId, {
                    secId: secId,
                    name: report.secUser.fullName || 'Unknown',
                    storeName: report.secUser.store?.name || '', // Using store name
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
        RANKS.forEach(r => leaderboards[r.id] = []);

        allUsers.forEach(user => {
            leaderboards[user.rankId].push(user);
        });

        Object.keys(leaderboards).forEach(rankId => {
            leaderboards[rankId].sort((a, b) => b.salesAmount - a.salesAmount);
            // Limit to Top 50 instead of Top 3 for scrollable list
            leaderboards[rankId] = leaderboards[rankId].slice(0, 50);
        });

        // 7. Get Current User Stats
        let userResponse = null;

        if (currentSec) {
            const currentUserData = allUsers.find(u => u.secId === currentSec.id);

            if (currentUserData) {
                const rankUsers = allUsers.filter(u => u.rankId === currentUserData.rankId)
                    .sort((a, b) => b.salesAmount - a.salesAmount);
                const position = rankUsers.findIndex(u => u.secId === currentSec.id) + 1;

                const nextRank = getNextRank(currentUserData.rankId);

                userResponse = {
                    secId: currentUserData.secId,
                    name: currentUserData.name,
                    storeName: currentUserData.storeName,
                    salesAmount: currentUserData.salesAmount,
                    rankId: currentUserData.rankId,
                    rankTitle: currentUserData.rankTitle,
                    positionInRank: position,
                    nextRank: nextRank ? {
                        title: nextRank.title,
                        targetSales: nextRank.minSales,
                        remaining: Math.max(0, nextRank.minSales - currentUserData.salesAmount)
                    } : null
                };
            } else {
                userResponse = {
                    secId: currentSec.id,
                    name: currentSec.fullName,
                    storeName: '',
                    salesAmount: 0,
                    rankId: 'cadet',
                    rankTitle: 'Salesveer',
                    positionInRank: 0,
                    nextRank: {
                        title: 'Sales Lieutenant',
                        targetSales: 21000,
                        remaining: 21000
                    }
                };
            }
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
