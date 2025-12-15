import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createActiveCampaigns() {
  try {
    console.log('🚀 Creating active campaigns for ADLD (₹200) and Combo (₹300)...');

    // Get all stores
    const stores = await prisma.store.findMany({
      select: { id: true, name: true, city: true }
    });

    console.log(`📍 Found ${stores.length} stores`);

    // Get all Samsung SKUs (devices)
    const devices = await prisma.samsungSKU.findMany({
      select: { id: true, Category: true, ModelName: true }
    });

    console.log(`📱 Found ${devices.length} devices`);

    // Get ADLD and Combo plans
    const adldPlans = await prisma.plan.findMany({
      where: { planType: 'ADLD_1_YR' },
      select: { id: true, planType: true, price: true, samsungSKUId: true }
    });

    const comboPlans = await prisma.plan.findMany({
      where: { planType: 'COMBO_2_YRS' },
      select: { id: true, planType: true, price: true, samsungSKUId: true }
    });

    console.log(`📋 Found ${adldPlans.length} ADLD plans and ${comboPlans.length} Combo plans`);

    // Campaign dates (valid for 1 year)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Valid for 1 year

    let campaignsCreated = 0;

    // Create ADLD campaigns (₹200) for all stores and devices
    for (const store of stores) {
      for (const plan of adldPlans) {
        try {
          const campaign = await prisma.spotIncentiveCampaign.create({
            data: {
              name: `ADLD Campaign - ${store.name}`,
              description: `₹200 incentive for ADLD 1 Year plans at ${store.name}`,
              storeId: store.id,
              samsungSKUId: plan.samsungSKUId,
              planId: plan.id,
              incentiveType: 'FIXED',
              incentiveValue: 200, // ₹200
              startDate: startDate,
              endDate: endDate,
              active: true
            }
          });
          
          campaignsCreated++;
          console.log(`✅ Created ADLD campaign for ${store.name} - ${campaign.id}`);
        } catch (error) {
          console.error(`❌ Failed to create ADLD campaign for ${store.name}:`, error);
        }
      }
    }

    // Create Combo campaigns (₹300) for all stores and devices
    for (const store of stores) {
      for (const plan of comboPlans) {
        try {
          const campaign = await prisma.spotIncentiveCampaign.create({
            data: {
              name: `Combo Campaign - ${store.name}`,
              description: `₹300 incentive for Combo 2 Years plans at ${store.name}`,
              storeId: store.id,
              samsungSKUId: plan.samsungSKUId,
              planId: plan.id,
              incentiveType: 'FIXED',
              incentiveValue: 300, // ₹300
              startDate: startDate,
              endDate: endDate,
              active: true
            }
          });
          
          campaignsCreated++;
          console.log(`✅ Created Combo campaign for ${store.name} - ${campaign.id}`);
        } catch (error) {
          console.error(`❌ Failed to create Combo campaign for ${store.name}:`, error);
        }
      }
    }

    console.log(`🎉 Successfully created ${campaignsCreated} active campaigns!`);
    console.log(`📊 Campaign Summary:`);
    console.log(`   - ADLD campaigns: ₹200 incentive`);
    console.log(`   - Combo campaigns: ₹300 incentive`);
    console.log(`   - Valid from: ${startDate.toDateString()}`);
    console.log(`   - Valid until: ${endDate.toDateString()}`);

  } catch (error) {
    console.error('❌ Error creating campaigns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createActiveCampaigns();