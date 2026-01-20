import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function stopCampaigns() {
    try {
        console.log('🛑 Stopping active campaigns for ADLD and Combo...');

        // Find all plans of type ADLD or Combo
        const targetPlans = await prisma.plan.findMany({
            where: {
                planType: {
                    in: ['ADLD_1_YR', 'COMBO_2_YRS']
                }
            },
            select: { id: true }
        });

        const targetPlanIds = targetPlans.map(p => p.id);

        if (targetPlanIds.length === 0) {
            console.log('⚠️ No ADLD or Combo plans found.');
            return;
        }

        // Update all active campaigns for these plans
        const result = await prisma.spotIncentiveCampaign.updateMany({
            where: {
                planId: { in: targetPlanIds },
                active: true
            },
            data: {
                active: false,
                endDate: new Date() // Set end date to now
            }
        });

        console.log(`✅ Successfully deactivated ${result.count} campaigns.`);

    } catch (error) {
        console.error('❌ Error stopping campaigns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

stopCampaigns();
