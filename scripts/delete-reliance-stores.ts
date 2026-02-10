import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteRelianceStores() {
    try {
        console.log('🔍 Searching for Reliance Digital stores...\n');

        // Find all Reliance Digital stores
        const relianceStores = await prisma.store.findMany({
            where: {
                name: {
                    contains: 'Reliance',
                    mode: 'insensitive'
                }
            },
            include: {
                secUsers: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true
                    }
                },
                spotIncentiveReports: {
                    select: {
                        id: true
                    }
                },
                dailyIncentiveReports: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (relianceStores.length === 0) {
            console.log('✅ No Reliance Digital stores found in the database.');
            return;
        }

        console.log(`📊 Found ${relianceStores.length} Reliance Digital store(s):\n`);

        // Display store details
        relianceStores.forEach((store, index) => {
            console.log(`${index + 1}. Store: ${store.name}`);
            console.log(`   ID: ${store.id}`);
            console.log(`   City: ${store.city || 'N/A'}`);
            console.log(`   Region: ${store.region || 'N/A'}`);
            console.log(`   SECs assigned: ${store.secUsers.length}`);
            console.log(`   Spot incentive reports: ${store.spotIncentiveReports.length}`);
            console.log(`   Daily incentive reports: ${store.dailyIncentiveReports.length}`);

            if (store.secUsers.length > 0) {
                console.log(`   ⚠️  SECs that will be unassigned:`);
                store.secUsers.forEach(sec => {
                    console.log(`      - ${sec.fullName || 'Unknown'} (${sec.phone})`);
                });
            }
            console.log('');
        });

        // Ask for confirmation (in production, you'd want user input here)
        console.log('⚠️  WARNING: This will:');
        console.log('   1. Delete all Reliance Digital stores');
        console.log('   2. Unassign SECs from these stores (set storeId to null)');
        console.log('   3. Keep all sales/incentive data (reports will remain)');
        console.log('');

        // Proceed with deletion
        console.log('🗑️  Starting deletion process...\n');

        // Step 1: Unassign SECs from Reliance stores
        const storeIds = relianceStores.map(s => s.id);

        const unassignedSecs = await prisma.sEC.updateMany({
            where: {
                storeId: {
                    in: storeIds
                }
            },
            data: {
                storeId: null
            }
        });

        console.log(`✅ Unassigned ${unassignedSecs.count} SEC(s) from Reliance stores`);

        // Step 2: Delete the stores
        const deletedStores = await prisma.store.deleteMany({
            where: {
                id: {
                    in: storeIds
                }
            }
        });

        console.log(`✅ Deleted ${deletedStores.count} Reliance Digital store(s)`);
        console.log('\n✨ Deletion completed successfully!');
        console.log('\n📝 Note: Sales and incentive reports have been preserved.');

    } catch (error) {
        console.error('❌ Error deleting Reliance stores:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
deleteRelianceStores()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
