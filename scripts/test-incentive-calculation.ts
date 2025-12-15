import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testIncentiveCalculation() {
  try {
    console.log('🧪 Testing Incentive Calculation with DailyIncentiveReport...\n');

    // Find a SEC user with daily incentive reports
    const secUser = await prisma.sEC.findFirst({
      where: {
        dailyIncentiveReports: {
          some: {}
        }
      },
      include: {
        store: true,
        dailyIncentiveReports: {
          include: {
            samsungSKU: true,
            plan: true
          },
          take: 5
        }
      }
    });

    if (!secUser) {
      console.log('❌ No SEC user found with daily incentive reports');
      return;
    }

    console.log(`✅ Found SEC user: ${secUser.phone}`);
    console.log(`   Store: ${secUser.store?.name || 'N/A'}`);
    console.log(`   Daily Reports: ${secUser.dailyIncentiveReports.length}`);

    // Show sample daily reports
    console.log('\n📊 Sample Daily Incentive Reports:');
    secUser.dailyIncentiveReports.forEach((report, index) => {
      console.log(`   ${index + 1}. Date: ${report.Date_of_sale.toISOString().split('T')[0]}`);
      console.log(`      SKU: ${report.samsungSKU.ModelName} (₹${report.samsungSKU.ModelPrice})`);
      console.log(`      Plan: ${report.plan.planType} (₹${report.plan.price})`);
      console.log(`      IMEI: ${report.imei}`);
    });

    // Test the API endpoint
    console.log('\n🔗 Testing API endpoint...');
    const testMonth = 12; // December
    const testYear = 2024;

    console.log(`   Calling IncentiveService.calculateMonthlyIncentive('${secUser.id}', ${testMonth}, ${testYear})`);
    
    // Import the service
    const { IncentiveService } = await import('../src/lib/services/IncentiveService');
    
    const result = await IncentiveService.calculateMonthlyIncentive(
      secUser.id,
      testMonth,
      testYear
    );

    console.log('\n✅ Calculation Result:');
    console.log(`   Total Incentive: ₹${result.totalIncentive.toLocaleString()}`);
    console.log(`   Total Units: ${result.unitsSummary.totalUnits}`);
    console.log(`   Units Above Gate: ${result.unitsSummary.unitsAboveGate}`);
    console.log(`   Units Above Volume Kicker: ${result.unitsSummary.unitsAboveVolumeKicker}`);
    
    if (result.breakdownByStore.length > 0) {
      const store = result.breakdownByStore[0];
      console.log(`   Store: ${store.storeName}`);
      console.log(`   Store Total: ₹${store.totalIncentive.toLocaleString()}`);
      console.log(`   Attach Rate: ${store.attachPercentage !== null ? store.attachPercentage + '%' : 'N/A'}`);
      
      console.log('\n   Breakdown by Slab:');
      store.breakdownBySlab.forEach((slab, index) => {
        console.log(`     ${index + 1}. Price Range: ₹${slab.minPrice || 0} - ${slab.maxPrice ? '₹' + slab.maxPrice : 'No limit'}`);
        console.log(`        Units: ${slab.units}, Rate: ${slab.appliedRate === 0 ? '0%' : slab.appliedRate === 1.0 ? '100%' : '120%'}`);
        console.log(`        Base: ₹${slab.baseIncentive}, Device Bonus: ₹${slab.deviceBonuses.foldBonus + slab.deviceBonuses.s25Bonus}`);
        console.log(`        Total: ₹${slab.totalIncentive}`);
      });
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIncentiveCalculation();