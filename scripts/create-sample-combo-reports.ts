import { prisma } from '../src/lib/prisma';

/**
 * Script to create 3 sample DailyIncentiveReport entries with COMBO_2_YRS plan for store_00001
 */
async function createSampleComboReports() {
  try {
    console.log('🔍 Creating sample COMBO_2_YRS reports for store_00001...\n');

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: 'store_00001' }
    });

    if (!store) {
      console.log('❌ Store store_00001 not found!');
      return;
    }

    console.log(`✅ Found store: ${store.name}\n`);

    // Find COMBO_2_YRS plans
    const comboPlans = await prisma.plan.findMany({
      where: {
        planType: 'COMBO_2_YRS'
      },
      include: {
        samsungSKU: true
      },
      take: 3 // Get 3 different plans
    });

    if (comboPlans.length === 0) {
      console.log('❌ No COMBO_2_YRS plans found in database!');
      return;
    }

    console.log(`📋 Found ${comboPlans.length} COMBO_2_YRS plan(s) to use:\n`);
    comboPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.samsungSKU?.ModelName} - ₹${plan.price}`);
    });

    console.log(`\n📝 Creating reports without SEC assignment...\n`);

    // Create 3 sample reports
    const reports = [];
    const today = new Date();

    for (let i = 0; i < Math.min(3, comboPlans.length); i++) {
      const plan = comboPlans[i];
      
      // Create date: today minus i days
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - i);

      // Generate unique IMEI - ensure it's truly unique
      let imei = '';
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        const timestamp = Date.now();
        const randomPart = Math.floor(Math.random() * 1000000000);
        imei = `${timestamp}${randomPart}`.substring(0, 15);
        
        // Check if IMEI already exists
        const existing = await prisma.dailyIncentiveReport.findUnique({
          where: { imei }
        });
        
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
          // Wait a tiny bit to ensure timestamp changes
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      if (!isUnique) {
        console.log(`❌ Failed to generate unique IMEI after ${attempts} attempts. Skipping report ${i + 1}.`);
        continue;
      }

      const report = await prisma.dailyIncentiveReport.create({
        data: {
          storeId: 'store_00001',
          samsungSKUId: plan.samsungSKUId!,
          planId: plan.id,
          imei: imei,
          Date_of_sale: saleDate,
          metadata: {
            note: 'Sample COMBO_2_YRS report created by script',
            createdBy: 'create-sample-combo-reports.ts'
          }
          // No secId - reports created without SEC assignment
        },
        include: {
          plan: true,
          samsungSKU: true,
          store: true,
          secUser: true
        }
      });

      reports.push(report);

      console.log(`✅ Created report ${i + 1}:`);
      console.log(`   ID: ${report.id}`);
      console.log(`   Date of Sale: ${report.Date_of_sale.toLocaleDateString()}`);
      console.log(`   Device: ${report.samsungSKU.ModelName} (${report.samsungSKU.Category})`);
      console.log(`   Plan: ${report.plan.planType} - ₹${report.plan.price}`);
      console.log(`   IMEI: ${report.imei}`);
      console.log(`   Store: ${report.store.name}`);
      console.log(`   SEC: Not assigned\n`);
    }

    console.log(`\n🎉 Successfully created ${reports.length} sample COMBO_2_YRS report(s) for store_00001!`);

    // Verify the reports
    const verifyReports = await prisma.dailyIncentiveReport.findMany({
      where: {
        storeId: 'store_00001',
        plan: {
          planType: 'COMBO_2_YRS'
        }
      },
      include: {
        plan: true,
        samsungSKU: true
      }
    });

    console.log(`\n📊 Total COMBO_2_YRS reports for store_00001: ${verifyReports.length}`);

  } catch (error) {
    console.error('❌ Error creating sample reports:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleComboReports()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
