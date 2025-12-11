import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to seed PriceIncentiveSlab collection
 * Creates incentive slabs with gate=3 and volumeKicker=8
 */

async function seedPriceIncentiveSlabs() {
  try {
    console.log('🌱 Starting PriceIncentiveSlab seeding...\n');

    // Define price slabs with different price ranges (based on official incentive structure)
    const slabs = [
      {
        minPrice: 0,
        maxPrice: 10000,
        incentiveAmount: 63,
        gate: 3,
        volumeKicker: 8,
        description: 'Below 10k'
      },
      {
        minPrice: 10001,
        maxPrice: 20000,
        incentiveAmount: 125,
        gate: 3,
        volumeKicker: 8,
        description: '10k - 20k'
      },
      {
        minPrice: 20001,
        maxPrice: 30000,
        incentiveAmount: 150,
        gate: 3,
        volumeKicker: 8,
        description: '20k - 30k'
      },
      {
        minPrice: 30001,
        maxPrice: 40000,
        incentiveAmount: 250,
        gate: 3,
        volumeKicker: 8,
        description: '30k - 40k'
      },
      {
        minPrice: 40001,
        maxPrice: 70000,
        incentiveAmount: 375,
        gate: 3,
        volumeKicker: 8,
        description: '40k - 70k'
      },
      {
        minPrice: 70001,
        maxPrice: 100000,
        incentiveAmount: 438,
        gate: 3,
        volumeKicker: 8,
        description: '70k - 1 Lac'
      },
      {
        minPrice: 100001,
        maxPrice: null,
        incentiveAmount: 500,
        gate: 3,
        volumeKicker: 8,
        description: 'Above 1 Lac'
      }
    ];

    console.log(`📋 Creating ${slabs.length} price incentive slabs...\n`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const slab of slabs) {
      const { description, ...slabData } = slab;

      try {
        // Check if a slab with this price range already exists
        const existing = await (prisma as any).priceIncentiveSlab.findFirst({
          where: {
            minPrice: slabData.minPrice,
            maxPrice: slabData.maxPrice
          }
        });

        if (existing) {
          // Update existing slab
          await (prisma as any).priceIncentiveSlab.update({
            where: { id: existing.id },
            data: {
              incentiveAmount: slabData.incentiveAmount,
              gate: slabData.gate,
              volumeKicker: slabData.volumeKicker,
              updatedAt: new Date()
            }
          });
          console.log(`  ✓ Updated: ${description}`);
          console.log(`    Price Range: ₹${slabData.minPrice?.toLocaleString()} - ${slabData.maxPrice ? '₹' + slabData.maxPrice.toLocaleString() : 'No limit'}`);
          console.log(`    Incentive: ₹${slabData.incentiveAmount}, Gate: ${slabData.gate}, Volume Kicker: ${slabData.volumeKicker}\n`);
          updatedCount++;
        } else {
          // Create new slab
          await (prisma as any).priceIncentiveSlab.create({
            data: slabData
          });
          console.log(`  ✓ Created: ${description}`);
          console.log(`    Price Range: ₹${slabData.minPrice?.toLocaleString()} - ${slabData.maxPrice ? '₹' + slabData.maxPrice.toLocaleString() : 'No limit'}`);
          console.log(`    Incentive: ₹${slabData.incentiveAmount}, Gate: ${slabData.gate}, Volume Kicker: ${slabData.volumeKicker}\n`);
          createdCount++;
        }
      } catch (error) {
        console.error(`  ✗ Failed to process: ${description}`, error);
      }
    }

    console.log(`\n📝 Summary:`);
    console.log(`   - Created: ${createdCount} slabs`);
    console.log(`   - Updated: ${updatedCount} slabs`);
    console.log(`   - Total: ${createdCount + updatedCount} slabs`);
    
    console.log(`\n📊 Incentive Rules:`);
    console.log(`   - Gate: 3 units per SEC (threshold before incentives apply)`);
    console.log(`   - Volume Kicker: 8 units per SEC (threshold for 120% incentive)`);
    console.log(`   - Final thresholds = threshold × store.numberOfSec`);
    
    console.log(`\n💡 Example for a store with 2 SECs:`);
    console.log(`   - Final Gate: 3 × 2 = 6 units`);
    console.log(`   - Final Volume Kicker: 8 × 2 = 16 units`);
    console.log(`   - Units 1-6: 0% incentive`);
    console.log(`   - Units 7-16: 100% incentive`);
    console.log(`   - Units 17+: 120% incentive`);
    
    console.log(`\n✅ Seeding completed!\n`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedPriceIncentiveSlabs()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
