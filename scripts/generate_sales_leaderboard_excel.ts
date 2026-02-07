
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const firstEqualsIndex = line.indexOf('=');
    if (firstEqualsIndex !== -1) {
        const key = line.substring(0, firstEqualsIndex).trim();
        const value = line.substring(firstEqualsIndex + 1).trim();
        if (key && value) {
            // Remove quotes if present
            envVars[key] = value.replace(/^"|"$/g, '');
        }
    }
});

const prisma = new PrismaClient({
    datasourceUrl: envVars.DATABASE_URL
});

const BONUS_PHONE_NUMBERS = (envVars.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

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

async function main() {
    try {
        console.log('Fetching sales data...');
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

        console.log(`Found ${reports.length} sales reports.`);

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
                    salesAmount: 0,
                    hasProtectMaxBonus: false
                });
            }

            const userData = userSalesMap.get(secId)!;
            userData.salesAmount += sales;

            if (report.secUser.hasProtectMaxBonus && !userData.hasProtectMaxBonus) {
                userData.salesAmount += 10000;
                userData.hasProtectMaxBonus = true;
            }
        });

        // Add Bonus Users
        console.log('Fetching bonus users...');
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

        // Add bonus to all bonus users
        const allUsers: any[] = Array.from(userSalesMap.values());

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
            } else {
                let bonusAmount = 21000;
                if (secUser.hasProtectMaxBonus) {
                    bonusAmount += 10000;
                }

                allUsers.push({
                    secId: secUser.id,
                    phone: trimmedPhone,
                    name: secUser.fullName || 'Unknown',
                    storeName: secUser.store?.name || '',
                    salesAmount: bonusAmount,
                    hasProtectMaxBonus: secUser.hasProtectMaxBonus || false
                });
            }
        });

        // Add ProtectMax Bonus Only Users
        console.log('Fetching ProtectMax bonus users...');
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
                }
            } else {
                const bonusAmount = 10000;
                allUsers.push({
                    secId: secUser.id,
                    phone: trimmedPhone,
                    name: secUser.fullName || 'Unknown',
                    storeName: secUser.store?.name || '',
                    salesAmount: bonusAmount,
                    hasProtectMaxBonus: true
                });
            }
        });

        // Sort by sales amount descending
        allUsers.sort((a, b) => b.salesAmount - a.salesAmount);

        // Add Rank Title
        const finalData = allUsers.map((user, index) => {
            const rankObj = getRank(user.salesAmount);
            return {
                'Rank': index + 1,
                'Rank Title': rankObj.title,
                'Points Earned': user.salesAmount,
                'Store Name': user.storeName,
                'User Name': user.name,
                'Phone': user.phone,
                'Has Bonus': BONUS_PHONE_NUMBERS.includes(user.phone) ? 'Yes' : 'No',
                'Has ProtectMax Bonus': user.hasProtectMaxBonus ? 'Yes' : 'No'
            };
        });

        // Create Excel
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(finalData);
        xlsx.utils.book_append_sheet(wb, ws, "Leaderboard");

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Sales_Leaderboard_Report_${dateStr}.xlsx`;
        const filePath = path.join(process.cwd(), 'Excel', fileName);

        if (!fs.existsSync(path.join(process.cwd(), 'Excel'))) {
            fs.mkdirSync(path.join(process.cwd(), 'Excel'));
        }

        xlsx.writeFile(wb, filePath);
        console.log(`Excel file created successfully at: ${filePath}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
