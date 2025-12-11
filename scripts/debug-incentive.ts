import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Debug script to check incentive calculation data
 */

async function debugIncentive() {
  try {
    console.log('🔍 Debugging Incentive Calculation\n');

    // Check store001
    const store = await (prisma as any).store.findUnique({
      where: { id: 'store001' }
    });

    console.log('📍 Store001 details:');
    console.log(JSON.stringify(store, null, 2));
    console.log('');

    // Check SamsungSKU with ModelPrice 40000
    const skus = await (prisma as any).samsungSKU.findMany({
      where: {
        ModelPrice: 40000
      }
    });

    console.log(`📱 SamsungSKU with ModelPrice 40000: ${skus.length} found`);
    skus.forEach((sku: any) => {
      console.log(`  - ${sku.ModelName} (${sku.Category}): ₹${sku.ModelPrice}`);
    });
    console.log('');

    // Check sales reports for store001
    const salesReports = await (prisma as any).salesReport.findMany({
      where: {
        storeId: 'store001'
      },
      include: {
        samsungSKU: true,
        secUser: true
      }
    });

    console.log(`📊 Sales Reports for store001: ${salesReports.length} found`);
    salesReports.forEach((report: any) => {
      console.log(`  - SEC: ${report.secUser.phone}, SKU: ${report.samsungSKU.ModelName}, Price: ₹${report.samsungSKU.ModelPrice}, Date: ${report.Date_of_sale}`);
    });
    console.log('');

    // Check price incentive slabs
    const slabs = await (prisma as any).priceIncentiveSlab.findMany({
      orderBy: { minPrice: 'asc' }
    });

    console.log(`💰 Price Incentive Slabs: ${slabs.length} found`);
    slabs.forEach((slab: any) => {
      const minPrice = slab.minPrice || 0;
      const maxPrice = slab.maxPrice || 'No limit';
      console.log(`  - ₹${minPrice.toLocaleString()} - ${maxPrice === 'No limit' ? maxPrice : '₹' + maxPrice.toLocaleString()}: ₹${slab.incentiveAmount} (Gate: ${slab.gate}, VK: ${slab.volumeKicker})`);
    });
    console.log('');

    // Check which slab 40000 falls into
    const slab40k = await (prisma as any).priceIncentiveSlab.findFirst({
      where: {
        OR: [
          {
            AND: [
              { minPrice: { lte: 40000 } },
              { maxPrice: { gte: 40000 } }
            ]
          },
          {
            AND: [
              { minPrice: { lte: 40000 } },
              { maxPrice: null }
            ]
          }
        ]
      },
      orderBy: [
        { minPrice: 'desc' }
      ]
    });

    console.log('🎯 Slab for ₹40,000:');
    if (slab40k) {
      console.log(`  - Range: ₹${slab40k.minPrice?.toLocaleString()} - ${slab40k.maxPrice ? '₹' + slab40k.maxPrice.toLocaleString() : 'No limit'}`);
      console.log(`  - Incentive: ₹${slab40k.incentiveAmount}`);
      console.log(`  - Gate: ${slab40k.gate} units per SEC`);
      console.log(`  - Volume Kicker: ${slab40k.volumeKicker} units per SEC`);
      
      if (store) {
        const numberOfSec = store.numberOfSec || 1;
        const finalGate = slab40k.gate * numberOfSec;
        const finalVolumeKicker = slab40k.volumeKicker * numberOfSec;
        
        console.log(`\n  📐 For store001 with ${numberOfSec} SEC(s):`);
        console.log(`    - Final Gate: ${finalGate} units`);
        console.log(`    - Final Volume Kicker: ${finalVolumeKicker} units`);
        
        if (salesReports.length > 0) {
          const units = salesReports.length;
          console.log(`    - Current Units: ${units}`);
          
          if (units <= finalGate) {
            console.log(`    - Incentive: ₹0 (units ≤ gate)`);
          } else if (units <= finalVolumeKicker) {
            const eligibleUnits = units - finalGate;
            const incentive = eligibleUnits * slab40k.incentiveAmount;
            console.log(`    - Eligible Units: ${eligibleUnits} (${units} - ${finalGate})`);
            console.log(`    - Incentive: ₹${incentive} (${eligibleUnits} × ₹${slab40k.incentiveAmount} × 100%)`);
          } else {
            const eligibleUnits = units - finalGate;
            const incentive = eligibleUnits * slab40k.incentiveAmount * 1.2;
            console.log(`    - Eligible Units: ${eligibleUnits} (${units} - ${finalGate})`);
            console.log(`    - Incentive: ₹${incentive} (${eligibleUnits} × ₹${slab40k.incentiveAmount} × 120%)`);
          }
        }
      }
    } else {
      console.log('  ❌ No slab found for ₹40,000!');
    }
    console.log('');

    // Check sales summaries
    if (salesReports.length > 0) {
      const secId = salesReports[0].secId;
      const summaries = await (prisma as any).salesSummary.findMany({
        where: { secId }
      });

      console.log(`📋 Sales Summaries for SEC ${salesReports[0].secUser.phone}: ${summaries.length} found`);
      summaries.forEach((summary: any) => {
        console.log(`  - ${summary.month}/${summary.year}: Estimated = ₹${summary.estimatedIncenetiveEarned || 0}, Samsung = ₹${summary.totalSamsungIncentiveEarned || 0}`);
      });
    }

    console.log('\n✅ Debug completed!\n');

  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
debugIncentive()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
