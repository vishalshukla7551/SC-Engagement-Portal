import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

// RANKS Updated to match Republic Day Hero Page thresholds
const RANKS = [
    { id: 'general', title: 'Sales General', minSales: 200000 },
    { id: 'brigadier', title: 'Sales Chief Marshal', minSales: 150000 },
    { id: 'colonel', title: 'Sales Commander', minSales: 120000 },
    { id: 'major', title: 'Sales Major', minSales: 80000 },
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
                select: { id: true, fullName: true, hasProtectMaxBonus: true }
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
                        phone: true,
                        hasProtectMaxBonus: true,
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
            phone: string,
            name: string,
            storeName: string,
            salesAmount: number,
            hasProtectMaxBonus?: boolean
        }>();

        reports.forEach(report => {
            if (!report.secUser) return;

            const { secId } = report;
            const sales = report.plan?.price || 0;

            if (!userSalesMap.has(secId)) {
                userSalesMap.set(secId, {
                    secId: secId,
                    phone: report.secUser.phone || '',
                    name: report.secUser.fullName || 'Unknown',
                    storeName: report.secUser.store?.name || '', // Using store name
                    salesAmount: 0
                });
            }

            const userData = userSalesMap.get(secId)!;
            userData.salesAmount += sales;

            // Add ProtectMax bonus if applicable
            if (report.secUser.hasProtectMaxBonus && !userData.hasProtectMaxBonus) {
                userData.salesAmount += 10000;
                userData.hasProtectMaxBonus = true;
            }
        });

        // 5. Process Ranks and Sort (WITHOUT bonus - will add later)
        const allUsers = Array.from(userSalesMap.values()).map(user => {
            const rankObj = getRank(user.salesAmount);
            return {
                ...user,
                rankId: rankObj.id,
                rankTitle: rankObj.title,
                minSalesForRank: rankObj.minSales
            };
        });

        // 6. Add Bonus Users who have no sales
        // Fetch all SECs with bonus phones
        const bonusUsersData = await prisma.sEC.findMany({
            where: {
                phone: {
                    in: BONUS_PHONE_NUMBERS
                }
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                hasProtectMaxBonus: true,
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Add bonus to all bonus users (whether they have sales or not)
        // Bonus users ALWAYS get +21000, no matter their sales
        bonusUsersData.forEach(secUser => {
            const trimmedPhone = (secUser.phone || '').trim();
            const existingUserIndex = allUsers.findIndex(u => u.phone === trimmedPhone);

            if (existingUserIndex >= 0) {
                // User already exists, always add 21000 bonus
                const existingUser = allUsers[existingUserIndex];
                existingUser.salesAmount += 21000;
                // Recalculate rank with bonus
                const rankObj = getRank(existingUser.salesAmount);
                existingUser.rankId = rankObj.id;
                existingUser.rankTitle = rankObj.title;
                existingUser.minSalesForRank = rankObj.minSales;
            } else {
                // User doesn't exist, add with only bonus
                const bonusAmount = 21000;
                const rankObj = getRank(bonusAmount);

                allUsers.push({
                    secId: secUser.id,
                    phone: trimmedPhone,
                    name: secUser.fullName || 'Unknown',
                    storeName: secUser.store?.name || '',
                    salesAmount: bonusAmount,
                    rankId: rankObj.id,
                    rankTitle: rankObj.title,
                    minSalesForRank: rankObj.minSales,
                    hasProtectMaxBonus: secUser.hasProtectMaxBonus
                });
            }

            // Add ProtectMax bonus if applicable
            if (secUser.hasProtectMaxBonus && existingUserIndex >= 0) {
                const existingUser = allUsers[existingUserIndex];
                if (!existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                    // Recalculate rank with ProtectMax bonus
                    const rankObj = getRank(existingUser.salesAmount);
                    existingUser.rankId = rankObj.id;
                    existingUser.rankTitle = rankObj.title;
                    existingUser.minSalesForRank = rankObj.minSales;
                }
            }
        });

        // Add users with ProtectMax bonus who don't have sales yet
        const protectMaxBonusUsers = await prisma.sEC.findMany({
            where: {
                hasProtectMaxBonus: true
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                hasProtectMaxBonus: true,
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        protectMaxBonusUsers.forEach(secUser => {
            const trimmedPhone = (secUser.phone || '').trim();
            const existingUserIndex = allUsers.findIndex(u => u.phone === trimmedPhone);

            if (existingUserIndex >= 0) {
                // User already exists, ensure they have the bonus
                const existingUser = allUsers[existingUserIndex];
                if (!existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                    // Recalculate rank with ProtectMax bonus
                    const rankObj = getRank(existingUser.salesAmount);
                    existingUser.rankId = rankObj.id;
                    existingUser.rankTitle = rankObj.title;
                    existingUser.minSalesForRank = rankObj.minSales;
                }
            } else {
                // User doesn't exist in sales, add with only ProtectMax bonus
                const bonusAmount = 10000;
                const rankObj = getRank(bonusAmount);

                allUsers.push({
                    secId: secUser.id,
                    phone: trimmedPhone,
                    name: secUser.fullName || 'Unknown',
                    storeName: secUser.store?.name || '',
                    salesAmount: bonusAmount,
                    rankId: rankObj.id,
                    rankTitle: rankObj.title,
                    minSalesForRank: rankObj.minSales,
                    hasProtectMaxBonus: true
                });
            }
        });

        // 7. Build Response Structure
        const leaderboards: Record<string, any[]> = {};
        RANKS.forEach(r => leaderboards[r.id] = []);

        allUsers.forEach(user => {
            leaderboards[user.rankId].push(user);
        });

        Object.keys(leaderboards).forEach(rankId => {
            leaderboards[rankId].sort((a, b) => b.salesAmount - a.salesAmount);
            // Show all users in each rank
        });

        // 8. Get Current User Stats
        let userResponse = null;

        if (currentSec) {
            const currentUserData = allUsers.find(u => u.secId === currentSec.id);

            if (currentUserData) {
                const rankUsers = allUsers.filter(u => u.rankId === currentUserData.rankId)
                    .sort((a, b) => b.salesAmount - a.salesAmount);
                const position = rankUsers.findIndex(u => u.secId === currentSec.id) + 1;

                const nextRank = getNextRank(currentUserData.rankId);

                // Add bonus if user is in bonus list
                const hasBonus = BONUS_PHONE_NUMBERS.includes(authUser.id);
                const hasProtectMaxBonus = currentSec.hasProtectMaxBonus || false;
                let totalSalesAmount = currentUserData.salesAmount;
                if (hasBonus) totalSalesAmount += 21000;
                if (hasProtectMaxBonus) totalSalesAmount += 10000;

                userResponse = {
                    secId: currentUserData.secId,
                    name: currentUserData.name,
                    storeName: currentUserData.storeName,
                    salesAmount: totalSalesAmount,
                    rankId: currentUserData.rankId,
                    rankTitle: currentUserData.rankTitle,
                    positionInRank: position,
                    hasBonus: hasBonus,
                    hasProtectMaxBonus: hasProtectMaxBonus,
                    nextRank: nextRank ? {
                        title: nextRank.title,
                        targetSales: nextRank.minSales,
                        remaining: Math.max(0, nextRank.minSales - totalSalesAmount)
                    } : null
                };
            } else {
                const hasBonus = BONUS_PHONE_NUMBERS.includes(authUser.id);
                const bonusAmount = hasBonus ? 21000 : 0;

                userResponse = {
                    secId: currentSec.id,
                    name: currentSec.fullName,
                    storeName: '',
                    salesAmount: bonusAmount,
                    rankId: bonusAmount >= 21000 ? 'lieutenant' : 'cadet',
                    rankTitle: bonusAmount >= 21000 ? 'Sales Lieutenant' : 'Salesveer',
                    positionInRank: 0,
                    hasBonus: hasBonus,
                    nextRank: bonusAmount >= 21000 ? {
                        title: 'Sales Captain',
                        targetSales: 51000,
                        remaining: Math.max(0, 51000 - bonusAmount)
                    } : {
                        title: 'Sales Lieutenant',
                        targetSales: 21000,
                        remaining: 21000 - bonusAmount
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
