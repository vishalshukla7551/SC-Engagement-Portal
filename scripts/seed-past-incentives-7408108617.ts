
import { PrismaClient } from '@prisma/client';
import { IncentiveService } from '../src/lib/services/IncentiveService';

const prisma = new PrismaClient();

async function addReportsForUser() {
    const targetPhone = '7408108617';

    try {
        console.log(`🔍 Finding SEC user with phone ${targetPhone}...`);

        // 1. Find the user
        const secUser = await prisma.sEC.findFirst({
            where: { phone: targetPhone },
            include: { store: true }
        });

        if (!secUser) {
            console.error(`❌ User with phone ${targetPhone} not found.`);
            return;
        }

        console.log(`✅ Found User: ${secUser.fullName || 'Unnamed'} (${secUser.id})`);

        if (!secUser.storeId) {
            console.error(`❌ User is not assigned to any store.`);
            return;
        }

        console.log(`   Store: ${secUser.store?.name} (${secUser.storeId})`);

        // 2. Get Products (Samsung SKU + Plans)
        const skus = await prisma.samsungSKU.findMany({
            include: { plans: true },
            take: 5
        });

        if (skus.length === 0) {
            console.error('❌ No Samsung SKUs found in database.');
            return;
        }

        // 3. Define target dates for Oct, Nov, Dec 2025
        // Current date is assumed to be roughly Jan 2026
        const targetDates = [
            { date: new Date('2025-10-15T10:00:00Z'), type: 'ADLD', count: 3 },
            { date: new Date('2025-10-20T10:00:00Z'), type: 'COMBO', count: 2 },
            { date: new Date('2025-11-10T10:00:00Z'), type: 'ADLD', count: 4 },
            { date: new Date('2025-11-25T10:00:00Z'), type: 'COMBO', count: 1 },
            { date: new Date('2025-12-05T10:00:00Z'), type: 'ADLD', count: 5 },
            { date: new Date('2025-12-20T10:00:00Z'), type: 'COMBO', count: 3 },
        ];

        // Helper to generate random IMEI
        const generateIMEI = () => `35${Math.floor(Math.random() * 10000000000000)}`;

        console.log(`\n📝 Creating daily incentive reports for Oct, Nov, Dec 2025...`);

        let createdCount = 0;
        const monthsToUpdate = new Set<string>();

        for (const item of targetDates) {
            for (let i = 0; i < item.count; i++) {
                // Pick a random SKU and identifying plan
                const sku = skus[Math.floor(Math.random() * skus.length)];
                // Try to find a plan matching the type, or default to first
                const plan = sku.plans.find(p => p.planType.includes(item.type)) || sku.plans[0];

                if (!plan) {
                    continue;
                }

                // key for later update
                const monthKey = `${String(item.date.getMonth() + 1).padStart(2, '0')}-${item.date.getFullYear()}`;
                monthsToUpdate.add(monthKey);

                await prisma.dailyIncentiveReport.create({
                    data: {
                        secId: secUser.id,
                        storeId: secUser.storeId!,
                        samsungSKUId: sku.id,
                        planId: plan.id,
                        imei: generateIMEI(),
                        Date_of_sale: item.date,
                        metadata: {
                            source: 'manual-script-insertion-past-data',
                            addedAt: new Date()
                        }
                    }
                });
                createdCount++;
            }
            console.log(`   + Created ${item.count} ${item.type} reports for ${item.date.toISOString().split('T')[0]}`);
        }

        console.log(`✅ Successfully added ${createdCount} reports.`);

        // 4. Update Monthly Passbook Info (IncentiveService)
        console.log(`\n🔄 Updating Incentive Passbook Info for impacted months: ${Array.from(monthsToUpdate).join(', ')}`);

        // Refresh User/Store data
        const updatedStore = await prisma.store.findUnique({
            where: { id: secUser.storeId! }
        });

        let incentiveInfo = (updatedStore?.samsungIncentiveInfo as any[]) || [];
        let infoUpdated = false;

        for (const monthKey of monthsToUpdate) {
            const [monthStr, yearStr] = monthKey.split('-');
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

            try {
                console.log(`   Calculating for ${monthKey}...`);
                const result = await IncentiveService.calculateMonthlyIncentive(
                    secUser.id,
                    month,
                    year,
                    updatedStore?.numberOfSec || 1
                );

                const existingIndex = incentiveInfo.findIndex((info: any) => info.month === monthKey);

                // Determine payment date (assume paid end of next month for past months)
                let paidDate: Date | null = null;
                if (year === 2025) {
                    if (month === 10) paidDate = new Date('2025-11-30');
                    if (month === 11) paidDate = new Date('2025-12-31');
                    if (month === 12) paidDate = new Date('2026-01-31');
                }

                const newEntry = {
                    month: monthKey,
                    samsungIncentiveAmount: result.storeLevelIncentive, // Using Store Total
                    samsungIncentivePaidAt: paidDate // Mark as paid
                };

                if (existingIndex >= 0) {
                    incentiveInfo[existingIndex] = newEntry;
                } else {
                    incentiveInfo.push(newEntry);
                }
                infoUpdated = true;
                console.log(`     > Updated info for ${monthKey}. Paid at: ${paidDate?.toISOString()}`);

            } catch (err) {
                console.error(`   ❌ Failed to calculate for ${monthKey}:`, err);
            }
        }

        if (infoUpdated && secUser.storeId) {
            await prisma.store.update({
                where: { id: secUser.storeId },
                data: { samsungIncentiveInfo: incentiveInfo }
            });
            console.log(`✅ Updated Store samsungIncentiveInfo.`);
        }

    } catch (error) {
        console.error('❌ Error executing script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addReportsForUser();
