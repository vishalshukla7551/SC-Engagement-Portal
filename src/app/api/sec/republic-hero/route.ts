import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

const RANKS = [
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

export async function GET(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== ('SEC' as Role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sec = await prisma.sEC.findUnique({
            where: { phone: authUser.id },
            select: { id: true, hasProtectMaxBonus: true, fullName: true }
        });

        if (!sec) {
            return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
        }

        // Fetch sales from contest period: 24 Jan to 3 Feb 2026
        const startDate = new Date('2026-01-24T00:00:00.000Z');
        const endDate = new Date('2026-02-03T23:59:59.999Z');

        const reports = await prisma.spotIncentiveReport.findMany({
            where: {
                secId: sec.id,
                spotincentivepaidAt: { not: null },
                Date_of_sale: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                plan: {
                    select: { price: true, planType: true }
                }
            }
        });

        let totalSales = reports.reduce((sum, report) => sum + (report.plan?.price || 0), 0);

        // Calculate longest streak (consecutive days with sales)
        const salesDates = reports
            .map(report => new Date(report.Date_of_sale).toDateString())
            .filter((date, index, self) => self.indexOf(date) === index) // Get unique dates
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort chronologically

        let longestStreak = 0;
        let currentStreak = 0;
        let lastDate: Date | null = null;

        salesDates.forEach(dateStr => {
            const date = new Date(dateStr);
            if (lastDate) {
                const dayDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            lastDate = date;
        });
        longestStreak = Math.max(longestStreak, currentStreak);


        // Add bonus points if user is in bonus list
        if (BONUS_PHONE_NUMBERS.includes(authUser.id)) {
            totalSales += 21000;
        }

        // Add 10,000 bonus points for ProtectMax test achievement
        if (sec.hasProtectMaxBonus) {
            totalSales += 10000;
        }

        // Fetch regional ranking
        const secWithRegion = await prisma.sEC.findUnique({
            where: { id: sec.id },
            select: {
                store: {
                    select: { region: true }
                }
            }
        });
        const region = secWithRegion?.store?.region || 'North';

        const regionalReports = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: startDate,
                    lte: endDate
                },
                spotincentivepaidAt: { not: null },
                secUser: {
                    store: {
                        region: region
                    }
                }
            },
            select: {
                secId: true,
                plan: { select: { price: true } },
                secUser: {
                    select: { phone: true, hasProtectMaxBonus: true }
                }
            }
        });

        // Calculate sales for each SEC in the region
        const regionalSalesMap = new Map<string, number>();
        regionalReports.forEach(r => {
            const current = regionalSalesMap.get(r.secId) || 0;
            regionalSalesMap.set(r.secId, current + (r.plan?.price || 0));
        });

        // Add bonuses for ranking
        regionalSalesMap.forEach((sales, secId) => {
            const secReport = regionalReports.find(r => r.secId === secId);
            if (secReport?.secUser) {
                if (BONUS_PHONE_NUMBERS.includes(secReport.secUser.phone)) {
                    regionalSalesMap.set(secId, sales + 21000);
                }
                if (secReport.secUser.hasProtectMaxBonus) {
                    regionalSalesMap.set(secId, sales + 10000);
                }
            }
        });

        // Sort to find rank
        const sortedRegionalSales = Array.from(regionalSalesMap.entries())
            .sort((a, b) => b[1] - a[1]);

        const regionRank = sortedRegionalSales.findIndex(([secId]) => secId === sec.id) + 1;
        const totalRegionParticipants = sortedRegionalSales.length;

        // Get surrounding peers for Hall of Fame (Leaderboard)
        // Convert map to array of objects
        const rankedUsers = sortedRegionalSales.map(([secId, sales], index) => {
            const report = regionalReports.find(r => r.secId === secId);
            return {
                rank: index + 1,
                name: report?.secUser.phone || 'Unknown', // Ideally get name, but using phone/placeholder if name not available in this query
                points: sales,
                isUser: secId === sec.id
            };
        });

        // Current user index
        const userIndex = regionRank - 1;

        // Get 2 above and 2 below, handling boundaries
        let start = Math.max(0, userIndex - 2);
        let end = Math.min(rankedUsers.length, userIndex + 3);

        // Adjust if close to boundaries to always show 5 if possible
        if (end - start < 5) {
            if (start === 0) {
                end = Math.min(rankedUsers.length, start + 5);
            } else if (end === rankedUsers.length) {
                start = Math.max(0, end - 5);
            }
        }

        const surroundingPeers = rankedUsers.slice(start, end).map(u => ({
            ...u,
            points: u.points >= 1000 ? (u.points / 1000).toFixed(1) + 'k' : u.points.toString()
        }));

        // Fetch names for these peers (since we only had phone/ID)
        // We need to query SEC table for these IDs to get names
        const peerIds = sortedRegionalSales.slice(start, end).map(([secId]) => secId);
        const peerSecs = await prisma.sEC.findMany({
            where: { id: { in: peerIds } },
            select: { id: true, fullName: true }
        });

        // Update names in surroundingPeers
        const finalPeers = surroundingPeers.map((peer, i) => {
            // peer.name currently has phone, we want name. 
            // Logic: find the SEC ID from the sorted list corresponding to this peer
            const originalSecId = sortedRegionalSales[start + i][0];
            const secInfo = peerSecs.find(s => s.id === originalSecId);
            return {
                ...peer,
                name: secInfo?.fullName || 'SEC User'
            };
        });

        const rankObj = getRank(totalSales);

        return NextResponse.json({
            success: true,
            data: {
                name: sec.fullName || 'Soldier',
                totalSales,
                rankTitle: rankObj.title,
                salesCount: reports.length,
                longestStreak,
                region,
                regionRank,
                totalRegionParticipants,
                surroundingPeers: finalPeers,
                hasBonus: BONUS_PHONE_NUMBERS.includes(authUser.id),
                hasProtectMaxBonus: sec.hasProtectMaxBonus
            }
        });
    } catch (error) {
        console.error('Error in GET /api/sec/republic-hero', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
