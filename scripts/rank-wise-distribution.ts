import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import * as path from 'path';

// Rank Configuration (from RewardsModal.tsx)
const RANKS = [
    { id: 'cadet', title: 'SALESVEER', minSales: 0, color: 'bg-stone-400', icon: '🪁' },
    { id: 'lieutenant', title: 'SALES LIEUTENANT', minSales: 21000, color: 'bg-emerald-500', icon: '🛡️' },
    { id: 'captain', title: 'SALES CAPTAIN', minSales: 51000, color: 'bg-blue-500', icon: '⚓' },
    { id: 'major', title: 'SALES MAJOR', minSales: 80000, color: 'bg-indigo-600', icon: '⭐' },
    { id: 'colonel', title: 'SALES COMMANDER', minSales: 120000, color: 'bg-purple-600', icon: '⚔️' },
    { id: 'brigadier', title: 'SALES CHIEF MARSHAL', minSales: 150000, color: 'bg-orange-500', icon: '🎖️' },
    { id: 'general', title: 'SALES GENERAL', minSales: 200000, color: 'bg-gradient-to-r from-red-600 to-orange-600', icon: '👑' },
];

interface RankDistribution {
    rank: string;
    title: string;
    minSales: number;
    count: number;
    percentage: number;
    icon: string;
    users: Array<{
        secId: string;
        phone: string;
        fullName: string;
        totalSales: number;
        storeName: string;
        city: string;
    }>;
}

function getRankForSales(totalSales: number): number {
    // Find the highest rank that the user qualifies for
    let rankIndex = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (totalSales >= RANKS[i].minSales) {
            rankIndex = i;
            break;
        }
    }
    return rankIndex;
}

async function getRankWiseDistribution() {
    try {
        console.log('🔄 Starting rank-wise distribution analysis...');

        // Get all SEC users with their sales data
        const secUsers = await prisma.sEC.findMany({
            select: {
                id: true,
                employeeId: true,
                phone: true,
                fullName: true,
                storeId: true,
                store: {
                    select: {
                        name: true,
                        city: true,
                    }
                },
                SpotIncentiveReport: {
                    where: {
                        spotincentivepaidAt: { not: null } // Only paid incentives count towards sales
                    },
                    select: {
                        spotincentiveEarned: true,
                        Date_of_sale: true,
                        plan: {
                            select: {
                                price: true,
                                planType: true,
                            }
                        }
                    }
                }
            }
        });

        console.log(`📊 Found ${secUsers.length} SEC users`);

        // Calculate total sales for each user and determine their rank
        const usersWithRanks = secUsers.map(user => {
            // Use plan prices as sales amount since spotincentiveEarned is 0
            const totalSales = user.SpotIncentiveReport.reduce((sum, report) => {
                // Use plan price as the sales value
                return sum + (report.plan?.price || 0);
            }, 0);
            const rankIndex = getRankForSales(totalSales);
            
            return {
                secId: user.employeeId || user.id,
                phone: user.phone,
                fullName: user.fullName || 'N/A',
                totalSales,
                rankIndex,
                rankTitle: RANKS[rankIndex].title,
                storeName: user.store?.name || 'N/A',
                city: user.store?.city || 'N/A',
                salesCount: user.SpotIncentiveReport.length, // Number of sales
            };
        });

        // Group users by rank
        const rankDistribution: RankDistribution[] = RANKS.map((rank, index) => {
            const usersInRank = usersWithRanks.filter(user => user.rankIndex === index);
            
            return {
                rank: rank.id,
                title: rank.title,
                minSales: rank.minSales,
                count: usersInRank.length,
                percentage: Math.round((usersInRank.length / secUsers.length) * 100),
                icon: rank.icon,
                users: usersInRank.map(user => ({
                    secId: user.secId,
                    phone: user.phone,
                    fullName: user.fullName,
                    totalSales: user.totalSales,
                    storeName: user.storeName,
                    city: user.city,
                    salesCount: user.salesCount,
                }))
            };
        });

        // Display results
        console.log('\n🏆 RANK-WISE DISTRIBUTION:');
        console.log('=' .repeat(80));
        
        rankDistribution.forEach((rank, index) => {
            const nextRankSales = index < RANKS.length - 1 ? RANKS[index + 1].minSales : '∞';
            console.log(`${rank.icon} ${rank.title}`);
            console.log(`   Sales Range: ₹${rank.minSales.toLocaleString('en-IN')} - ₹${nextRankSales === '∞' ? '∞' : (nextRankSales - 1).toLocaleString('en-IN')}`);
            console.log(`   Count: ${rank.count} users (${rank.percentage}%)`);
            
            if (rank.count > 0) {
                console.log(`   Top Performers:`);
                const topUsers = rank.users
                    .sort((a, b) => b.totalSales - a.totalSales)
                    .slice(0, 3);
                
                topUsers.forEach((user, i) => {
                    console.log(`     ${i + 1}. ${user.fullName} (${user.secId}) - ₹${user.totalSales.toLocaleString('en-IN')} (${user.salesCount} sales) - ${user.storeName}`);
                });
            }
            console.log('');
        });

        // Create Excel export
        const summaryData = rankDistribution.map(rank => ({
            'Rank': rank.title,
            'Icon': rank.icon,
            'Min Sales Required': `₹${rank.minSales.toLocaleString('en-IN')}`,
            'User Count': rank.count,
            'Percentage': `${rank.percentage}%`,
            'Top Performer': rank.users.length > 0 
                ? `${rank.users.sort((a, b) => b.totalSales - a.totalSales)[0].fullName} (₹${rank.users.sort((a, b) => b.totalSales - a.totalSales)[0].totalSales.toLocaleString('en-IN')})`
                : 'None'
        }));

        // Detailed user data
        const detailedData = usersWithRanks.map(user => ({
            'SEC ID': user.secId,
            'Full Name': user.fullName,
            'Phone': user.phone,
            'Store': user.storeName,
            'City': user.city,
            'Total Sales': `₹${user.totalSales.toLocaleString('en-IN')}`,
            'Sales Count': user.salesCount,
            'Current Rank': user.rankTitle,
            'Rank Icon': RANKS[user.rankIndex].icon,
        }));

        // Create Excel workbook with multiple sheets
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Rank Summary');
        
        // Detailed sheet
        const detailedWs = XLSX.utils.json_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(wb, detailedWs, 'All Users with Ranks');

        // Individual rank sheets
        rankDistribution.forEach(rank => {
            if (rank.users.length > 0) {
                const rankUsers = rank.users.map(user => ({
                    'SEC ID': user.secId,
                    'Full Name': user.fullName,
                    'Phone': user.phone,
                    'Store': user.storeName,
                    'City': user.city,
                    'Total Sales': `₹${user.totalSales.toLocaleString('en-IN')}`,
                    'Sales Count': user.salesCount,
                }));
                
                const rankWs = XLSX.utils.json_to_sheet(rankUsers);
                const sheetName = rank.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31); // Excel sheet name limit
                XLSX.utils.book_append_sheet(wb, rankWs, sheetName);
            }
        });

        // Save Excel file
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Rank_Distribution_${currentDate}_${secUsers.length}_users.xlsx`;
        const filepath = path.join(process.cwd(), filename);
        
        XLSX.writeFile(wb, filepath);

        console.log(`✅ Excel file created: ${filename}`);
        console.log(`📍 Full path: ${filepath}`);

        // Summary statistics
        const totalActiveUsers = usersWithRanks.filter(user => user.totalSales > 0).length;
        const totalSalesAmount = usersWithRanks.reduce((sum, user) => sum + user.totalSales, 0);
        const averageSales = totalSalesAmount / secUsers.length;

        console.log('\n📈 OVERALL STATISTICS:');
        console.log(`Total SEC Users: ${secUsers.length}`);
        console.log(`Active Users (with sales): ${totalActiveUsers}`);
        console.log(`Total Sales Amount: ₹${totalSalesAmount.toLocaleString('en-IN')}`);
        console.log(`Average Sales per User: ₹${Math.round(averageSales).toLocaleString('en-IN')}`);

        return filepath;

    } catch (error) {
        console.error('❌ Error analyzing rank distribution:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the analysis
getRankWiseDistribution()
    .then((filepath) => {
        console.log(`\n🎉 Rank analysis completed successfully!`);
        console.log(`📁 Excel file: ${filepath}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Analysis failed:', error);
        process.exit(1);
    });