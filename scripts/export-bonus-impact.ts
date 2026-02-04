
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Load Environment Variables manually to get REPUBLIC_DAY_BONUS_PHONES
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                if (line.startsWith('REPUBLIC_DAY_BONUS_PHONES=')) {
                    return line.split('=')[1].trim();
                }
            }
        }
    } catch (e) {
        console.warn('Could not read .env file', e);
    }
    return '';
}

const REPUBLIC_DAY_BONUS_PHONES_STR = loadEnv();
const BONUS_PHONE_NUMBERS = REPUBLIC_DAY_BONUS_PHONES_STR.split(',').map(p => p.trim()).filter(Boolean);

// Rank Configuration
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

async function exportBonusImpact() {
    try {
        console.log('🔄 Starting bonus impact analysis...');
        const startDate = new Date('2026-01-01T00:00:00.000Z');

        // Fetch all SEC users with their sales reports
        const secUsers = await prisma.sEC.findMany({
            select: {
                id: true,
                employeeId: true, // Added employeeId
                fullName: true,
                phone: true,
                storeId: true,
                hasProtectMaxBonus: true,
                store: {
                    select: {
                        name: true
                    }
                },
                SpotIncentiveReport: {
                    where: {
                        Date_of_sale: { gte: startDate },
                        spotincentivepaidAt: { not: null }
                    },
                    select: {
                        plan: {
                            select: {
                                price: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`📊 Processing ${secUsers.length} SEC users...`);

        const exportData = secUsers.map(sec => {
            // 1. Calculate Organic Sales
            const organicSales = sec.SpotIncentiveReport.reduce((sum, report) => sum + (report.plan?.price || 0), 0);

            // 2. Determine Republic Day Bonus
            const isRepublicDayBonus = BONUS_PHONE_NUMBERS.includes(sec.phone);
            const republicBonusAmount = isRepublicDayBonus ? 21000 : 0;

            // 3. Determine ProtectMax Bonus
            const isProtectMaxBonus = sec.hasProtectMaxBonus || false;
            const protectMaxBonusAmount = isProtectMaxBonus ? 10000 : 0;

            // 4. Calculate BEFORE 10k Bonus
            const pointsBefore = organicSales + republicBonusAmount;
            const rankBefore = getRank(pointsBefore);

            // 5. Calculate AFTER 10k Bonus
            const pointsAfter = pointsBefore + protectMaxBonusAmount;
            const rankAfter = getRank(pointsAfter);

            const rankChanged = rankBefore.id !== rankAfter.id;

            return {
                'SEC ID': sec.employeeId || 'N/A', // Use employeeId, avoid ObjectId
                'Name': sec.fullName || 'N/A',
                'Phone': sec.phone,
                'Store': sec.store?.name || 'N/A',
                'Organic Sales': organicSales,
                'Republic Day Bonus': republicBonusAmount > 0 ? 'YES (+21k)' : 'NO',
                'Has 10k Bonus?': isProtectMaxBonus ? 'YES' : 'NO',
                'Points BEFORE 10k': pointsBefore,
                'Rank BEFORE 10k': rankBefore.title,
                'Points AFTER 10k': pointsAfter,
                'Rank AFTER 10k': rankAfter.title,
                'Rank Changed?': rankChanged ? 'YES' : 'NO'
            };
        });

        // Filter? User asked "kis sec ...", implies listing relevant ones or all.
        // I will sort by those who have the bonus first, then by points.
        exportData.sort((a, b) => {
            if (a['Has 10k Bonus?'] === 'YES' && b['Has 10k Bonus?'] === 'NO') return -1;
            if (a['Has 10k Bonus?'] === 'NO' && b['Has 10k Bonus?'] === 'YES') return 1;
            return b['Points AFTER 10k'] - a['Points AFTER 10k'];
        });

        // Create Excel
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bonus Impact Analysis');

        // Column Widths
        ws['!cols'] = [
            { wch: 25 }, // ID
            { wch: 25 }, // Name
            { wch: 15 }, // Phone
            { wch: 25 }, // Store
            { wch: 15 }, // Organic
            { wch: 15 }, // Republic
            { wch: 15 }, // Has 10k
            { wch: 18 }, // Points Before
            { wch: 20 }, // Rank Before
            { wch: 18 }, // Points After
            { wch: 20 }, // Rank After
            { wch: 15 }, // Rank Changed
        ];

        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `ProtectMax_Bonus_Impact_${currentDate}.xlsx`;
        const filepath = path.join(process.cwd(), filename);

        XLSX.writeFile(wb, filepath);

        console.log(`✅ Successfully exported bonus impact data.`);
        console.log(`Total Records: ${exportData.length}`);
        console.log(`Users with 10k Bonus: ${exportData.filter(d => d['Has 10k Bonus?'] === 'YES').length}`);
        console.log(`Users with Rank Change: ${exportData.filter(d => d['Rank Changed?'] === 'YES').length}`);
        console.log(`📁 File saved as: ${filename}`);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

exportBonusImpact();
