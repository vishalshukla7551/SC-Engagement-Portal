import { prisma } from '../src/lib/prisma';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

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

async function exportRepublicLeaderboard() {
    try {
        console.log('Fetching Republic Leaderboard data...');

        // Fetch Sales Data
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
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Aggregation
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
                    storeName: report.secUser.store?.name || '',
                    salesAmount: 0
                });
            }

            const userData = userSalesMap.get(secId)!;
            userData.salesAmount += sales;

            if (report.secUser.hasProtectMaxBonus && !userData.hasProtectMaxBonus) {
                userData.salesAmount += 10000;
                userData.hasProtectMaxBonus = true;
            }
        });

        // Process Ranks
        const allUsers = Array.from(userSalesMap.values()).map(user => {
            const rankObj = getRank(user.salesAmount);
            return {
                ...user,
                rankId: rankObj.id,
                rankTitle: rankObj.title,
                minSalesForRank: rankObj.minSales
            };
        });

        // Add Bonus Users
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

        bonusUsersData.forEach(secUser => {
            const trimmedPhone = (secUser.phone || '').trim();
            const existingUserIndex = allUsers.findIndex(u => u.phone === trimmedPhone);

            if (existingUserIndex >= 0) {
                const existingUser = allUsers[existingUserIndex];
                existingUser.salesAmount += 21000;

                if (secUser.hasProtectMaxBonus && !existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                }

                const rankObj = getRank(existingUser.salesAmount);
                existingUser.rankId = rankObj.id;
                existingUser.rankTitle = rankObj.title;
                existingUser.minSalesForRank = rankObj.minSales;
            } else {
                let bonusAmount = 21000;

                if (secUser.hasProtectMaxBonus) {
                    bonusAmount += 10000;
                }

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
        });

        // Add ProtectMax bonus users
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
                const existingUser = allUsers[existingUserIndex];
                if (!existingUser.hasProtectMaxBonus) {
                    existingUser.salesAmount += 10000;
                    existingUser.hasProtectMaxBonus = true;
                    const rankObj = getRank(existingUser.salesAmount);
                    existingUser.rankId = rankObj.id;
                    existingUser.rankTitle = rankObj.title;
                    existingUser.minSalesForRank = rankObj.minSales;
                }
            } else {
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

        // Sort by sales amount descending
        allUsers.sort((a, b) => b.salesAmount - a.salesAmount);

        // Add rank position within each rank
        const leaderboards: Record<string, any[]> = {};
        RANKS.forEach(r => leaderboards[r.id] = []);

        allUsers.forEach(user => {
            leaderboards[user.rankId].push(user);
        });

        Object.keys(leaderboards).forEach(rankId => {
            leaderboards[rankId].sort((a, b) => b.salesAmount - a.salesAmount);
        });

        // Prepare data for Excel
        const excelData: any[] = [];
        let globalRank = 1;

        RANKS.forEach(rank => {
            const rankUsers = leaderboards[rank.id];
            rankUsers.forEach((user, index) => {
                excelData.push({
                    'Global Rank': globalRank,
                    'Rank in Category': index + 1,
                    'Rank Title': rank.title,
                    'Name': user.name,
                    'Phone': user.phone,
                    'Store': user.storeName,
                    'Sales Amount': user.salesAmount,
                    'Has Protect Max Bonus': user.hasProtectMaxBonus ? 'Yes' : 'No',
                    'SEC ID': user.secId
                });
                globalRank++;
            });
        });

        // Create workbook
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Republic Leaderboard');

        // Set column widths
        ws['!cols'] = [
            { wch: 12 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 }
        ];

        // Save file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `Republic_Leaderboard_${timestamp}.xlsx`;
        const filepath = path.join(process.cwd(), filename);

        XLSX.writeFile(wb, filepath);

        console.log(`✅ Export successful! File saved: ${filename}`);
        console.log(`Total users: ${excelData.length}`);

    } catch (error) {
        console.error('Error exporting leaderboard:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

exportRepublicLeaderboard();
