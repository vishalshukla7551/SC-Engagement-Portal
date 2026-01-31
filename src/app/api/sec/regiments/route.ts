// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

        // Fetch sales data (matching leaderboard logic)
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
                        id: true,
                        fullName: true,
                        phone: true,
                        employeeId: true,
                        hasProtectMaxBonus: true,
                        store: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                                region: true, // Use region directly from Store
                            }
                        }
                    }
                }
            }
        });

        // Initialize userSalesMap with only SECs who have sales
        const userSalesMap = new Map<string, {
            secId: string,
            name: string,
            phone: string,
            employeeId: string | null,
            storeName: string,
            city: string,
            region: string,
            salesAmount: number,
            hasProtectMaxBonus?: boolean
        }>();

        // Aggregate sales for users who have sales
        reports.forEach(report => {
            if (!report.secUser) return;

            const { secId } = report;
            const sales = report.plan?.price || 0;
            const city = report.secUser.store?.city || 'Unknown City';
            const region = report.secUser.store?.region || 'UNKNOWN'; // Use region from Store

            if (!userSalesMap.has(secId)) {
                userSalesMap.set(secId, {
                    secId: secId,
                    name: report.secUser.fullName || 'Unknown',
                    phone: report.secUser.phone || '',
                    employeeId: report.secUser.employeeId,
                    storeName: report.secUser.store?.name || 'Unknown Store',
                    city: city,
                    region: region,
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

        // Add bonus users who have no sales (matching leaderboard logic)
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
                employeeId: true,
                hasProtectMaxBonus: true,
                store: {
                    select: {
                        name: true,
                        city: true,
                        region: true, // Use region directly from Store
                    }
                }
            }
        });

        bonusUsersData.forEach(secUser => {
            const trimmedPhone = (secUser.phone || '').trim();
            const existingUser = Array.from(userSalesMap.values()).find(u => u.phone === trimmedPhone);

            if (existingUser) {
                // User already exists, always add 21000 bonus
                existingUser.salesAmount += 21000;

                // Add ProtectMax bonus if applicable
                if (secUser.hasProtectMaxBonus && !existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                }
            } else {
                // User doesn't exist, add with bonus
                let bonusAmount = 21000;

                // Add ProtectMax bonus if applicable
                if (secUser.hasProtectMaxBonus) {
                    bonusAmount += 10000;
                }

                const city = secUser.store?.city || 'Unknown City';
                const region = secUser.store?.region || 'UNKNOWN';

                userSalesMap.set(secUser.id, {
                    secId: secUser.id,
                    name: secUser.fullName || 'Unknown',
                    phone: trimmedPhone,
                    employeeId: secUser.employeeId,
                    storeName: secUser.store?.name || 'Unknown Store',
                    city: city,
                    region: region,
                    salesAmount: bonusAmount,
                    hasProtectMaxBonus: secUser.hasProtectMaxBonus
                });
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
                employeeId: true,
                hasProtectMaxBonus: true,
                store: {
                    select: {
                        name: true,
                        city: true,
                        region: true
                    }
                }
            }
        });

        protectMaxBonusUsers.forEach(secUser => {
            const trimmedPhone = (secUser.phone || '').trim();
            const existingUser = Array.from(userSalesMap.values()).find(u => u.phone === trimmedPhone);

            if (existingUser) {
                // User already exists, ensure they have the bonus
                if (!existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                }
            } else {
                // User doesn't exist in sales, add with only ProtectMax bonus
                const bonusAmount = 10000;
                const city = secUser.store?.city || 'Unknown City';
                const region = secUser.store?.region || 'UNKNOWN';

                userSalesMap.set(secUser.id, {
                    secId: secUser.id,
                    name: secUser.fullName || 'Unknown',
                    phone: trimmedPhone,
                    employeeId: secUser.employeeId,
                    storeName: secUser.store?.name || 'Unknown Store',
                    city: city,
                    region: region,
                    salesAmount: bonusAmount,
                    hasProtectMaxBonus: true
                });
            }
        });

        // Calculate rank based on sales thresholds (matching leaderboard/hall of fame)
        // Sales General removed - will be assigned manually later
        const secsWithRank = Array.from(userSalesMap.values()).map(sec => {
            let rank = 'Salesveer';
            if (sec.salesAmount >= 150000) rank = 'Sales Chief Marshal';
            else if (sec.salesAmount >= 120000) rank = 'Sales Commander';
            else if (sec.salesAmount >= 80000) rank = 'Sales Major';
            else if (sec.salesAmount >= 51000) rank = 'Sales Captain';
            else if (sec.salesAmount >= 21000) rank = 'Sales Lieutenant';

            return {
                ...sec,
                rank,
                totalSales: sec.salesAmount
            };
        });

        // Group by rank and region
        const regimentMatrix: Record<string, Record<string, number>> = {};
        const personnelByRankAndRegion: Record<string, Record<string, any[]>> = {};

        const ranks = [
            'Sales Chief Marshal',
            'Sales Commander',
            'Sales Major',
            'Sales Captain',
            'Sales Lieutenant',
            'Salesveer'
        ];

        const regions = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UNKNOWN'];

        // Initialize the matrix
        ranks.forEach(rank => {
            regimentMatrix[rank] = {};
            personnelByRankAndRegion[rank] = {};
            regions.forEach(region => {
                regimentMatrix[rank][region] = 0;
                personnelByRankAndRegion[rank][region] = [];
            });
        });

        // Populate the matrix
        secsWithRank.forEach(sec => {
            if (sec.region && regions.includes(sec.region)) {
                regimentMatrix[sec.rank][sec.region]++;
                personnelByRankAndRegion[sec.rank][sec.region].push({
                    id: sec.secId,
                    fullName: sec.name,
                    phone: sec.phone,
                    employeeId: sec.employeeId,
                    storeName: sec.storeName,
                    city: sec.city,
                    region: sec.region,
                    totalSales: sec.totalSales,
                });
            }
        });

        return NextResponse.json({
            success: true,
            matrix: regimentMatrix,
            personnel: personnelByRankAndRegion,
            totalSECs: secsWithRank.length,
        });

    } catch (error: any) {
        console.error('Error fetching regiment data:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
