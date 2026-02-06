import { PrismaClient } from '@prisma/client';
import { IncentiveService } from '../src/lib/services/IncentiveService';

const prisma = new PrismaClient();

async function addReportsForUser() {
    const targetPhone = '9569310917';

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
            return; // Can't add store-based reports without a store
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

        // 3. Create Sample Reports
        // We'll create reports for:
        // - Current Month (Jan 2026 according to system time? Wait, user metadata says 2026, but let's stick to recent dates relative to now)
        // - Previous Month

        // Helper to generate random IMEI
        const generateIMEI = () => `35${Math.floor(Math.random() * 10000000000000)}`;

        const reportsToCreate = [
            // Recent sales (January 2025/2026 - using current date)
            { daysAgo: 1, type: 'ADLD' },
            { daysAgo: 2, type: 'COMBO' },
            { daysAgo: 5, type: 'ADLD' },

            // Previous month sales (December)
            { daysAgo: 35, type: 'ADLD' },
            { daysAgo: 40, type: 'COMBO' },
            { daysAgo: 42, type: 'ADLD' },
        ];

        console.log(`\n📝 Creating ${reportsToCreate.length} daily incentive reports...`);

        let createdCount = 0;
        const monthsToUpdate = new Set<string>();

        for (const item of reportsToCreate) {
            // Pick a random SKU and identifying plan
            const sku = skus[Math.floor(Math.random() * skus.length)];
            // Try to find a plan matching the type, or default to first
            const plan = sku.plans.find(p => p.planType.includes(item.type)) || sku.plans[0];

            if (!plan) {
                console.warn('   Skipping, no suitable plan found for SKU', sku.ModelName);
                continue;
            }

            const date = new Date();
            date.setDate(date.getDate() - item.daysAgo);

            // key for later update
            const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            monthsToUpdate.add(monthKey);

            await prisma.dailyIncentiveReport.create({
                data: {
                    secId: secUser.id,
                    storeId: secUser.storeId,
                    samsungSKUId: sku.id,
                    planId: plan.id,
                    imei: generateIMEI(),
                    Date_of_sale: date,
                    metadata: {
                        source: 'manual-script-insertion',
                        addedAt: new Date()
                    }
                }
            });
            console.log(`   + Created: ${item.type} for ${date.toISOString().split('T')[0]}`);
            createdCount++;
        }

        console.log(`✅ Successfully added ${createdCount} reports.`);

        // 4. Update Monthly Passbook Info (IncentiveService)
        console.log(`\n🔄 Updating Incentive Passbook Info for impacted months: ${Array.from(monthsToUpdate).join(', ')}`);

        // Refresh User/Store data
        const updatedStore = await prisma.store.findUnique({
            where: { id: secUser.storeId }
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
                const newEntry = {
                    month: monthKey,
                    samsungIncentiveAmount: result.storeLevelIncentive, // Using Store Total
                    samsungIncentivePaidAt: existingIndex >= 0 ? incentiveInfo[existingIndex].samsungIncentivePaidAt : null
                };

                if (existingIndex >= 0) {
                    incentiveInfo[existingIndex] = newEntry;
                } else {
                    incentiveInfo.push(newEntry);
                }
                infoUpdated = true;
                console.log(`     > Store Total: ₹${result.storeLevelIncentive}, Per SEC: ₹${result.totalIncentive}`);

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
//testing