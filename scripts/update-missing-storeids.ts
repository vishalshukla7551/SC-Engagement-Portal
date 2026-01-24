import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const secsToUpdate = [
  { phone: "7020496418", storeId: "store_00357" },
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
  { phone: "9873829955", storeId: "store_00179" }
]
;

async function main() {
  console.log("🔍 Checking SECs without storeId...\n");

  const missingStoreId = [];
  const alreadyHaveStoreId = [];

  for (const sec of secsToUpdate) {
    const existingSec = await prisma.sEC.findUnique({
      where: { phone: sec.phone },
      select: { id: true, phone: true, storeId: true, fullName: true },
    });

    if (!existingSec) {
      console.log(`❌ SEC not found: ${sec.phone}`);
      continue;
    }

    if (!existingSec.storeId) {
      missingStoreId.push(existingSec);
      console.log(`⚠️  Missing storeId: ${sec.phone} (${existingSec.fullName})`);
    } else {
      alreadyHaveStoreId.push(existingSec);
      console.log(`✅ Already has storeId: ${sec.phone} → ${existingSec.storeId}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Missing storeId: ${missingStoreId.length}`);
  console.log(`   Already have storeId: ${alreadyHaveStoreId.length}`);

  if (missingStoreId.length > 0) {
    console.log(`\n🔄 Updating ${missingStoreId.length} SECs...\n`);

    for (const sec of secsToUpdate) {
      const existingSec = await prisma.sEC.findUnique({
        where: { phone: sec.phone },
      });

      if (existingSec && !existingSec.storeId) {
        await prisma.sEC.update({
          where: { phone: sec.phone },
          data: { storeId: sec.storeId },
        });
        console.log(`✅ Updated: ${sec.phone} → ${sec.storeId}`);
      }
    }

    console.log(`\n✨ All SECs updated successfully!`);
  } else {
    console.log(`\n✨ All SECs already have storeId!`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
