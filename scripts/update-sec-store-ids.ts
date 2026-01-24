import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const secsToUpdate = [
  { phone: "8271116222", storeId: "store_00428" },
  { phone: "7029543643", storeId: "store_00492" },
  { phone: "7044339703", storeId: "store_00271" },
  { phone: "7093299335", storeId: "store_00567" },
  { phone: "8100432608", storeId: "store_00271" },
  { phone: "8708323804", storeId: "store_00613" },
  { phone: "8867811147", storeId: "store_00054" },
  { phone: "9137303035", storeId: "store_00701" },
  { phone: "9140682442", storeId: "store_00297" },
  { phone: "9264995526", storeId: "store_00260" },
  { phone: "9637742857", storeId: "store_00436" },
  { phone: "9663827863", storeId: "store_00051" },
  { phone: "9873829955", storeId: "store_00179" },
];

async function updateSecStoreIds() {
  try {
    console.log("Starting SEC store ID updates...\n");

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const { phone, storeId } of secsToUpdate) {
      try {
        // Check if SEC exists
        const existingSec = await prisma.sEC.findUnique({
          where: { phone },
        });

        if (!existingSec) {
          console.log(`⚠️  SEC not found with phone: ${phone}`);
          skipCount++;
          continue;
        }

        // Check if SEC already has a storeId
        if (existingSec.storeId) {
          console.log(
            `⏭️  SEC ${phone} already has storeId: ${existingSec.storeId}, skipping...`
          );
          skipCount++;
          continue;
        }

        // Update SEC with storeId
        const updated = await prisma.sEC.update({
          where: { phone },
          data: { storeId },
        });

        console.log(
          `✅ Updated SEC ${phone} with storeId: ${storeId}`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating SEC ${phone}:`, error);
        errorCount++;
      }
    }

    console.log("\n--- Update Summary ---");
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`⏭️  Skipped (already have storeId or not found): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${secsToUpdate.length}`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSecStoreIds();
