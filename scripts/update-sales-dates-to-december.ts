import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to update all DailyIncentiveReport dates to be between Dec 1, 2025 and current date
 * Updates Date_of_sale, createdAt, and updatedAt fields
 */
async function updateSalesDates() {
  try {
    console.log('🔄 Starting to update all daily sales report dates...\n');

    // Define date range: Dec 1, 2025 to today
    const startDate = new Date('2025-12-01T00:00:00.000Z');
    const endDate = new Date(); // Current date
    
    console.log(`📅 Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`   (Dec 1, 2025 to ${endDate.toLocaleDateString()})\n`);

    // Get all daily incentive reports
    const allReports = await prisma.dailyIncentiveReport.findMany({
      select: {
        id: true,
        Date_of_sale: true,
        imei: true
      }
    });

    console.log(`📊 Found ${allReports.length} sales reports to update\n`);

    if (allReports.length === 0) {
      console.log('✅ No reports found. Nothing to update.');
      return;
    }

    // Function to generate random date between start and end
    const getRandomDate = (start: Date, end: Date): Date => {
      const startTime = start.getTime();
      const endTime = end.getTime();
      const randomTime = startTime + Math.random() * (endTime - startTime);
      return new Date(randomTime);
    };

    // Update each report
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allReports.length; i++) {
      const report = allReports[i];
      
      try {
        // Generate random date between Dec 1, 2025 and today
        const newDateOfSale = getRandomDate(startDate, endDate);
        
        // Update the report
        await prisma.dailyIncentiveReport.update({
          where: { id: report.id },
          data: {
            Date_of_sale: newDateOfSale,
            createdAt: newDateOfSale,
            updatedAt: newDateOfSale
          }
        });

        successCount++;
        
        // Log progress every 10 records
        if ((i + 1) % 10 === 0 || i === allReports.length - 1) {
          console.log(`✓ Updated ${i + 1}/${allReports.length} reports...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Error updating report ${report.id}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} reports`);
    console.log(`❌ Failed: ${errorCount} reports`);
    console.log(`📅 New date range: Dec 1, 2025 to ${endDate.toLocaleDateString()}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error in updateSalesDates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateSalesDates()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
