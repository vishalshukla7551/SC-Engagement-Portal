import { prisma } from '../src/lib/prisma';

async function debugRegimentsAPI() {
    try {
        console.log('🔍 Debugging Regiments API Data...\n');

        const startDate = new Date('2026-01-01T00:00:00.000Z');

        // Fetch sales data
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

        console.log(`📊 Total reports: ${reports.length}\n`);

        // Check store regions
        const storeRegions = new Map<string, string>();
        const secRegions = new Map<string, string>();
        let nullRegionCount = 0;
        let validRegionCount = 0;

        reports.forEach(report => {
            if (!report.secUser?.store) return;

            const storeId = report.secUser.store.id;
            const region = report.secUser.store.region;
            const secId = report.secId;

            storeRegions.set(storeId, region || 'NULL');
            secRegions.set(secId, region || 'NULL');

            if (!region) {
                nullRegionCount++;
            } else {
                validRegionCount++;
            }
        });

        console.log('📈 Region Status:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Reports with region: ${validRegionCount}`);
        console.log(`❌ Reports with NULL region: ${nullRegionCount}`);
        console.log(`📍 Unique stores: ${storeRegions.size}`);
        console.log(`👥 Unique SECs: ${secRegions.size}\n`);

        // Count by region
        const regionCounts = {
            NORTH: 0,
            SOUTH: 0,
            EAST: 0,
            WEST: 0,
            UNKNOWN: 0,
            NULL: 0
        };

        secRegions.forEach(region => {
            if (region === 'NULL') {
                regionCounts.NULL++;
            } else if (region === 'UNKNOWN' || !region) {
                regionCounts.UNKNOWN++;
            } else if (regionCounts.hasOwnProperty(region)) {
                regionCounts[region as keyof typeof regionCounts]++;
            }
        });

        console.log('🗺️  SEC Distribution by Region:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🟠 NORTH:   ${regionCounts.NORTH}`);
        console.log(`🔵 SOUTH:   ${regionCounts.SOUTH}`);
        console.log(`🟢 EAST:    ${regionCounts.EAST}`);
        console.log(`🟡 WEST:    ${regionCounts.WEST}`);
        console.log(`⚪ UNKNOWN: ${regionCounts.UNKNOWN}`);
        console.log(`⛔ NULL:    ${regionCounts.NULL}\n`);

        // Sample stores with NULL regions
        const nullRegionStores = Array.from(storeRegions.entries())
            .filter(([_, region]) => region === 'NULL')
            .slice(0, 5);

        if (nullRegionStores.length > 0) {
            console.log('⚠️  Sample stores with NULL regions:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            for (const [storeId, region] of nullRegionStores) {
                const store = await prisma.store.findUnique({
                    where: { id: storeId },
                    select: { name: true, city: true, region: true }
                });
                console.log(`Store: ${store?.name}`);
                console.log(`City: ${store?.city}`);
                console.log(`Region in DB: ${store?.region || 'NULL'}`);
                console.log('');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugRegimentsAPI();
