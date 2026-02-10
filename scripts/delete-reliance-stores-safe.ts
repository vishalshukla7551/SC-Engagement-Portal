import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteRelianceStoresSafe() {
    try {
        console.log('🔍 Finding Reliance Digital stores without sales data...\n');

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
                        spotIncentiveReports: true,
                        dailyIncentiveReports: true
                    }
                }
            }
        });

        // Filter stores WITHOUT any sales data
        const storesToDelete = relianceStores.filter(s =>
            s._count.spotIncentiveReports === 0 && s._count.dailyIncentiveReports === 0
        );

        const storesWithSales = relianceStores.filter(s =>
            s._count.spotIncentiveReports > 0 || s._count.dailyIncentiveReports > 0
        );

        console.log(`📊 Analysis:`);
        console.log(`   Total Reliance stores: ${relianceStores.length}`);
        console.log(`   Stores to DELETE (no sales): ${storesToDelete.length}`);
        console.log(`   Stores to KEEP (have sales): ${storesWithSales.length}\n`);

        if (storesWithSales.length > 0) {
            console.log(`✅ Stores being KEPT (have sales data):`);
            storesWithSales.forEach((store, i) => {
                console.log(`   ${i + 1}. ${store.name} (${store._count.spotIncentiveReports} sales)`);
            });
            console.log('');
        }

        if (storesToDelete.length === 0) {
            console.log('✅ No stores to delete. All Reliance stores have sales data.');
            return;
        }

        console.log('🗑️  Starting deletion process...\n');

        // Get IDs of stores to delete
        const storeIdsToDelete = storesToDelete.map(s => s.id);

        // Delete the stores
        const result = await prisma.store.deleteMany({
            where: {
                id: {
                    in: storeIdsToDelete
                }
            }
        });

        console.log(`✅ Successfully deleted ${result.count} Reliance Digital store(s)`);
        console.log(`✅ Kept ${storesWithSales.length} store(s) with sales data`);
        console.log('\n✨ Deletion completed successfully!');
        console.log(`\n📝 Summary:`);
        console.log(`   - Deleted: ${result.count} stores`);
        console.log(`   - Preserved: ${storesWithSales.length} stores with sales data`);
        console.log(`   - SECs unassigned: 44 (already done in previous step)`);

    } catch (error) {
        console.error('❌ Error deleting Reliance stores:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
deleteRelianceStoresSafe()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
