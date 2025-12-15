import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLatestSaleDatePerMonth() {
  try {
    console.log('🧪 Testing Latest Sale Date Per Month functionality...\n');

    // Find a store with daily incentive reports
    const storeWithReports = await prisma.store.findFirst({
      where: {
        dailyIncentiveReports: {
          some: {}
        }
      },
      include: {
        dailyIncentiveReports: {
          orderBy: {
            Date_of_sale: 'desc'
          },
          take: 10
        }
      }
    });

    if (!storeWithReports) {
      console.log('❌ No store found with daily incentive reports');
      return;
    }

    console.log(`✅ Found store: ${storeWithReports.name}`);
    console.log(`   Total Daily Reports: ${storeWithReports.dailyIncentiveReports.length}`);

    // Group reports by month (same logic as API)
    const monthlyReportsGrouped: Record<string, any[]> = {};
    
    storeWithReports.dailyIncentiveReports.forEach((report) => {
      const reportDate = new Date(report.Date_of_sale);
      const month = reportDate.getMonth() + 1;
      const year = reportDate.getFullYear();
      const monthKey = `${month.toString().padStart(2, '0')}-${year}`;
      
      if (!monthlyReportsGrouped[monthKey]) {
        monthlyReportsGrouped[monthKey] = [];
      }
      monthlyReportsGrouped[monthKey].push(report);
    });

    const formatDate = (date: Date) => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };

    console.log('\n📅 Monthly Breakdown with Latest Sale Dates:');
    Object.entries(monthlyReportsGrouped).forEach(([monthKey, reports]) => {
      const [monthStr, yearStr] = monthKey.split('-');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      
      // Find the latest sale date for this month
      const latestSaleDate = reports.reduce((latest, report) => {
        const saleDate = new Date(report.Date_of_sale);
        return saleDate > latest ? saleDate : latest;
      }, new Date(0));

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[month - 1];
      const yearShort = year.toString().slice(-2);
      
      console.log(`   ${monthName} ${yearShort}: ${reports.length} units, latest sale: ${formatDate(latestSaleDate)}`);
      console.log(`      Modal will show: "Total Units Sold (till ${formatDate(latestSaleDate)})"`);
    });

    console.log('\n✅ Test completed! Each month will show its own latest sale date.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLatestSaleDatePerMonth();