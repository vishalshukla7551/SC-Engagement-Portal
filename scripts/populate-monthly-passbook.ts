import { PrismaClient } from '@prisma/client';
import { IncentiveService } from '../src/lib/services/IncentiveService';

const prisma = new PrismaClient();

async function populateMonthlyPassbook() {
    try {
        console.log('🚀 Starting population of Monthly Passbook (Store.samsungIncentiveInfo)...\n');

        // 1. Fetch all stores that have daily incentive reports
        const storesWithReports = await prisma.store.findMany({
            where: {
                dailyIncentiveReports: {
                    some: {}
                }
            },
            include: {
                dailyIncentiveReports: true,
                secUsers: true // To get an SEC ID for the calculator if needed
            }
        });

        console.log(`found ${storesWithReports.length} stores with daily reports.`);

        for (const store of storesWithReports) {
            console.log(`\n---------------------------------------------------------`);
            console.log(`Processing Store: ${store.name} (${store.id})`);

            // 2. Identify months with activity
            const months = new Set<string>();
            store.dailyIncentiveReports.forEach(report => {
                const date = new Date(report.Date_of_sale);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                months.add(`${month}-${year}`);
            });

            console.log(`Active months: ${Array.from(months).join(', ')}`);

            // Get existing info or initialize
            let incentiveInfo = (store.samsungIncentiveInfo as any[]) || [];
            let updated = false;

            // 3. For each month, calculate actual incentive
            for (const monthKey of months) {
                const [monthStr, yearStr] = monthKey.split('-');
                const month = parseInt(monthStr, 10);
                const year = parseInt(yearStr, 10);

                // We need an SEC ID (any SEC from the store will do to trigger the service)
                // If the store has no SECs, we can't use the service easily as it expects an SEC ID.
                // But let's see if we can find one.
                const secUser = store.secUsers[0];

                let calculatedIncentive = 0;

                if (secUser) {
                    try {
                        const result = await IncentiveService.calculateMonthlyIncentive(
                            secUser.id,
                            month,
                            year,
                            store.numberOfSec || 1
                        );

                        // The service returns `totalIncentive` (per SEC).
                        // However, `Store.samsungIncentiveInfo` usually stores what?
                        // Looking at the passbook route: 
                        // `const samsungIncentiveInfo = (secUser.store.samsungIncentiveInfo as any[]) || [];`
                        // `incentive: '₹' + (samsungInfo?.samsungIncentiveAmount || estimatedIncentive)`
                        // And estimated incentive is `Math.round(units * avgPlanPrice * 0.1)`. 
                        // This estimated incentive seems to be the Total incentive for the USER (if calculated for user context) or TOTAL for store?
                        // Wait, the passbook route groups `dailyReports` (which are ALL reports for the store in the route code: `where: { storeId: secUser.storeId }`).
                        // So `dailyReports` in the route ARE store-level.
                        // And `estimatedIncentive` is calculated on these store-level reports.

                        // Wait. The passbook route:
                        // `const dailyReports: any = await prisma.dailyIncentiveReport.findMany({ where: { storeId: secUser.storeId }, ... });`
                        // So `monthlyTransactions` loop iterates over ALL store reports.
                        // But the PASSBOOK is for a single SEC user.
                        // Showing ALL store sales to a single SEC might be correct if they share the incentive, but usually a passbook shows *my* share.

                        // Let's look closely at `IncentiveService.calculateMonthlyIncentive`.
                        // It returns `totalIncentive` which is "Per SEC incentive (already divided)".
                        // And `storeLevelIncentive`.

                        // If `Store.samsungIncentiveInfo` is stored on the STORE, it logically should be the STORE TOTAL.
                        // BUT, the Passbook route uses it directly: `incentive: ... samsungInfo.samsungIncentiveAmount`.
                        // If the Passbook is showing "Units" which are ALL units (it seems to show all units: `dailyReports.filter...`), then it should probably show STORE TOTAL incentive?

                        // Let's check `test-incentive-calculation.ts` output.
                        // "Total Incentive: ₹..." comes from `result.totalIncentive` (per SEC).

                        // If I put "Store Total" in `samsungIncentiveInfo`, and the passbook (which is visible to SEC) shows it, the SEC sees the total pool.
                        // If I put "Per SEC" share, the SEC sees their share.

                        // Given the context of "putting data in the passbook", and the user likely sees this, I should probably put the *relevant* amount. 
                        // However, `Store.samsungIncentiveInfo` suggests it's info about the STORE's earning from Samsung.
                        // So it's most likely the Store Total. The SEC passbook might then display the Store Total or maybe implies that's what they get? 
                        // Actually, looking at `IncentiveService`, `calculateMonthlyIncentive` is named `monthlyIncentive`.

                        // Let's assume `samsungIncentiveAmount` in `samsungIncentiveInfo` should be the **Store Total Incentive**.
                        // Why? Because it's stored on the `Store` model.

                        calculatedIncentive = result.storeLevelIncentive;
                        console.log(`   ${monthKey}: Calculated Store Total: ₹${calculatedIncentive}`);

                    } catch (err) {
                        console.error(`   ${monthKey}: Error calculating:`, err);
                        continue;
                    }
                } else {
                    console.warn(`   ${monthKey}: No SEC found for store, skipping calculation.`);
                    continue;
                }

                // Update incentiveInfo
                const existingIndex = incentiveInfo.findIndex((info: any) => info.month === monthKey);

                const newEntry = {
                    month: monthKey,
                    samsungIncentiveAmount: calculatedIncentive,
                    samsungIncentivePaidAt: existingIndex >= 0 ? incentiveInfo[existingIndex].samsungIncentivePaidAt : null
                };

                if (existingIndex >= 0) {
                    incentiveInfo[existingIndex] = newEntry;
                    console.log(`   Updated entry for ${monthKey}`);
                } else {
                    incentiveInfo.push(newEntry);
                    console.log(`   Added new entry for ${monthKey}`);
                }
                updated = true;
            }

            // 4. Save updates
            if (updated) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: {
                        samsungIncentiveInfo: incentiveInfo
                    }
                });
                console.log(`   ✅ Saved updates for store ${store.name}`);
            } else {
                console.log(`   No updates needed for store ${store.name}`);
            }
        }

        console.log('\n🎉 Population completed!');

    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

populateMonthlyPassbook();
