import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeRelianceStores() {
    try {
        console.log('🔍 Analyzing Reliance Digital stores...\n');

        // Find all Reliance Digital stores
        const relianceStores = await prisma.store.findMany({
            where: {
                name: {
                    contains: 'Reliance',
                    mode: 'insensitive'
                }
            },
            include: {
                _count: {
                    select: {
                        secUsers: true,
                        spotIncentiveReports: true,
                        dailyIncentiveReports: true,
                        spotIncentiveCampaigns: true,
                        periodicAttachRates: true
                    }
                }
            }
        });

        console.log(`📊 Total Reliance Digital stores: ${relianceStores.length}\n`);

        // Categorize stores
        const storesWithSales = relianceStores.filter(s =>
            s._count.spotIncentiveReports > 0 || s._count.dailyIncentiveReports > 0
        );

        const storesWithoutSales = relianceStores.filter(s =>
            s._count.spotIncentiveReports === 0 && s._count.dailyIncentiveReports === 0
        );

        console.log(`✅ Stores WITHOUT sales data (can be safely deleted): ${storesWithoutSales.length}`);
        console.log(`⚠️  Stores WITH sales data (cannot be deleted): ${storesWithSales.length}\n`);

        if (storesWithSales.length > 0) {
            console.log('📋 Stores with sales data:');
            storesWithSales.forEach((store, i) => {
                console.log(`${i + 1}. ${store.name}`);
                console.log(`   - Spot reports: ${store._count.spotIncentiveReports}`);
                console.log(`   - Daily reports: ${store._count.dailyIncentiveReports}`);
                console.log(`   - SECs: ${store._count.secUsers}`);
                console.log('');
            });
        }

        console.log('\n💡 RECOMMENDATION:');
        console.log('Since some stores have sales data, you have two options:');
        console.log('1. Delete only stores WITHOUT sales data (safer)');
        console.log('2. Keep all stores but mark them as inactive/archived');
        console.log('3. Reassign sales data to a different store before deletion (complex)\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeRelianceStores();
