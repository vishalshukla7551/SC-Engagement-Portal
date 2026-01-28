import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNullRegions() {
  try {
    console.log('🔍 Checking stores with null region field...\n');

    // Count total stores
    const totalStores = await prisma.store.count();
    console.log(`📊 Total stores in database: ${totalStores}`);

    // Count stores with null region
    const nullRegionCount = await prisma.store.count({
      where: {
        region: null
      }
    });

    console.log(`❌ Stores with null region: ${nullRegionCount}`);
    console.log(`✅ Stores with region assigned: ${totalStores - nullRegionCount}`);
    console.log(`📈 Percentage with null region: ${((nullRegionCount / totalStores) * 100).toFixed(2)}%\n`);

    // Get list of stores with null region
    if (nullRegionCount > 0) {
      console.log('📋 Stores with null region:\n');
      
      const storesWithNullRegion = await prisma.store.findMany({
        where: {
          region: null
        },
        select: {
          id: true,
          storeId: true,
          storeName: true,
          city: true,
          state: true,
          region: true
        },
        orderBy: {
          storeName: 'asc'
        }
      });

      storesWithNullRegion.forEach((store, index) => {
        console.log(`${index + 1}. Store ID: ${store.storeId || 'N/A'}`);
        console.log(`   Name: ${store.storeName}`);
        console.log(`   City: ${store.city || 'N/A'}`);
        console.log(`   State: ${store.state || 'N/A'}`);
        console.log(`   Region: ${store.region || 'NULL'}`);
        console.log('');
      });
    }

    // Group by state to see distribution (only if there are null regions)
    if (nullRegionCount > 0) {
      console.log('\n📍 Distribution by State (null regions only):\n');
      
      const storesGrouped = await prisma.store.findMany({
        where: {
          region: null
        },
        select: {
          state: true
        }
      });

      const stateCount = storesGrouped.reduce((acc, store) => {
        const state = store.state || 'Unknown';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(stateCount)
        .sort(([, a], [, b]) => b - a)
        .forEach(([state, count]) => {
          console.log(`${state}: ${count} stores`);
        });
    }

  } catch (error) {
    console.error('❌ Error checking null regions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNullRegions();
