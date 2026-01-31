import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDailyIncentiveReports() {
  try {
    console.log('Creating DailyIncentiveReport records...\n');

    // Get the store
    const store = await prisma.store.findUnique({
      where: { id: 'store_00001' }
    });

    if (!store) {
      console.error('❌ Store store_00001 not found');
      return;
    }

    console.log(`✓ Found store: ${store.name}`);

    // Get the Samsung SKU
    const samsungSKU = await prisma.samsungSKU.findUnique({
      where: { id: '6936cd1ecd89841a64998003' }
    });

    if (!samsungSKU) {
      console.error('❌ Samsung SKU 6936cd1ecd89841a64998003 not found');
      return;
    }

    console.log(`✓ Found Samsung SKU: ${samsungSKU.ModelName}\n`);

    // Get COMBO and ADLD plans
    const comboPlan = await prisma.plan.findFirst({
      where: { planType: 'COMBO_2_YRS' }
    });

    const adldPlan = await prisma.plan.findFirst({
      where: { planType: 'ADLD_1_YR' }
    });

    if (!comboPlan || !adldPlan) {
      console.error('❌ Required plans not found');
      return;
    }

    console.log(`✓ Found plans: COMBO_2_YRS and ADLD_1_YR\n`);

    // Create 4 reports with different dates in January 2026
    const dates = [
      new Date('2026-01-05'),
      new Date('2026-01-10'),
      new Date('2026-01-15'),
      new Date('2026-01-20')
    ];

    const plans = [comboPlan, adldPlan, comboPlan, adldPlan];

    const reports = [];

    for (let i = 0; i < 4; i++) {
      const report = await prisma.dailyIncentiveReport.create({
        data: {
          storeId: store.id,
          samsungSKUId: samsungSKU.id,
          planId: plans[i].id,
          imei: `IMEI_${Date.now()}_${i}`,
          Date_of_sale: dates[i],
          metadata: {
            source: 'script',
            batch: 'daily_incentive_test'
          }
        },
        include: {
          store: true,
          samsungSKU: true,
          plan: true
        }
      });

      reports.push(report);
      console.log(`✓ Report ${i + 1} created:`, {
        date: report.Date_of_sale.toISOString().split('T')[0],
        plan: report.plan.planType,
        imei: report.imei
      });
    }

    console.log(`\n✅ Successfully created ${reports.length} DailyIncentiveReport records`);

  } catch (error) {
    console.error('❌ Error creating reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDailyIncentiveReports();
