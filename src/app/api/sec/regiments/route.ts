// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
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
                        store: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                                region: true,
                            }
                        }
                    }
                }
            }
        });

        // Aggregate sales by SEC (matching leaderboard logic)
        const userSalesMap = new Map<string, {
            secId: string,
            name: string,
            phone: string,
            employeeId: string | null,
            storeName: string,
            city: string,
            region: string,
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
                    phone: report.secUser.phone,
                    employeeId: report.secUser.employeeId,
                    storeName: report.secUser.store?.name || 'Unknown Store',
                    city: report.secUser.store?.city || 'Unknown City',
                    region: report.secUser.store?.region || 'UNKNOWN',
                    salesAmount: 0
                });
            }

            const userData = userSalesMap.get(secId)!;
            userData.salesAmount += sales;
        });

        // Calculate rank based on sales thresholds (matching leaderboard/hall of fame)
        const secsWithRank = Array.from(userSalesMap.values()).map(sec => {
            let rank = 'Salesveer';
            if (sec.salesAmount >= 200000) rank = 'Sales General';
            else if (sec.salesAmount >= 150000) rank = 'Sales Chief Marshal';
            else if (sec.salesAmount >= 120000) rank = 'Sales Commander';
            else if (sec.salesAmount >= 90000) rank = 'Sales Major';
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
            'Sales General',
            'Sales Chief Marshal',
            'Sales Commander',
            'Sales Major',
            'Sales Captain',
            'Sales Lieutenant',
            'Salesveer'
        ];

        const regions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];

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
