import { prisma } from '../src/lib/prisma';

/**
 * Script to delete all DailyIncentiveReport entries with COMBO_2_YRS plan
 */
async function deleteCombo2YearReports() {
  try {
    console.log('🔍 Finding all DailyIncentiveReport entries with COMBO_2_YRS plan...\n');

    // First, find all plans with COMBO_2_YRS type
    const combo2YearPlans = await prisma.plan.findMany({
      where: {
        planType: 'COMBO_2_YRS'
      },
      select: {
        id: true
      }
    });

    console.log(`📋 Found ${combo2YearPlans.length} COMBO_2_YRS plan(s)\n`);

    if (combo2YearPlans.length === 0) {
      console.log('✅ No COMBO_2_YRS plans found. Nothing to delete.');
      return;
    }

    // Get all plan IDs
    const planIds = combo2YearPlans.map(p => p.id);

    // Count reports before deletion
    const countBefore = await prisma.dailyIncentiveReport.count({
      where: {
        planId: {
          in: planIds
        }
      }
    });

    console.log(`📊 Found ${countBefore} DailyIncentiveReport(s) with COMBO_2_YRS plan\n`);

    if (countBefore === 0) {
      console.log('✅ No reports to delete.');
      return;
    }

    // Get details before deletion
    const reportsToDelete = await prisma.dailyIncentiveReport.findMany({
      where: {
        planId: {
          in: planIds
        }
      },
      include: {
        store: {
          select: {
            name: true
          }
        },
        samsungSKU: {
          select: {
            ModelName: true
          }
        }
      }
    });

    console.log('📝 Reports to be deleted:\n');
    reportsToDelete.forEach((report, index) => {
      console.log(`  ${index + 1}. ID: ${report.id}`);
      console.log(`     Store: ${report.store.name}`);
      console.log(`     Device: ${report.samsungSKU.ModelName}`);
      console.log(`     Date: ${report.Date_of_sale.toLocaleDateString()}`);
      console.log(`     IMEI: ${report.imei}\n`);
    });

    // Delete all reports with COMBO_2_YRS plans
    const deleteResult = await prisma.dailyIncentiveReport.deleteMany({
      where: {
        planId: {
          in: planIds
        }
      }
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.count} DailyIncentiveReport(s) with COMBO_2_YRS plan!`);

    // Verify deletion
    const countAfter = await prisma.dailyIncentiveReport.count({
      where: {
        planId: {
          in: planIds
        }
      }
    });

    console.log(`\n📊 Verification: ${countAfter} COMBO_2_YRS reports remaining (should be 0)`);

    if (countAfter === 0) {
      console.log('✅ All COMBO_2_YRS reports successfully deleted!');
    } else {
      console.log('⚠️  Warning: Some reports may not have been deleted.');
    }

  } catch (error) {
    console.error('❌ Error deleting COMBO_2_YRS reports:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteCombo2YearReports()
  .then(() => {
    console.log('\n🎉 Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
