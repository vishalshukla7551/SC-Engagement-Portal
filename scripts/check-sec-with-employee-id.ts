import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function checkSecWithEmployeeId() {
  try {
    console.log("🔍 SEC users ko check kar rahe hain jinke paas employeeId fill hai...\n");

    // Sabhi SEC users ko fetch karo
    const allSecs = await prisma.sEC.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        employeeId: true,
        email: true,
        storeId: true,
        city: true,
      },
    });

    console.log(`📊 Total SEC users: ${allSecs.length}\n`);

    // Jinke paas employeeId fill hai unhe filter karo
    const secsWithEmployeeId = allSecs.filter(
      (sec) => sec.employeeId && sec.employeeId.trim() !== ""
    );

    console.log(
      `✅ SEC users with employeeId filled: ${secsWithEmployeeId.length}\n`
    );

    // Check karo kitne ke paas ObjectId format hai
    const objectIdRegex = /^[0-9a-f]{24}$/i;
    const secsWithObjectId = secsWithEmployeeId.filter((sec) =>
      objectIdRegex.test(sec.employeeId || "")
    );

    console.log(
      `🎯 SEC users with ObjectId in employeeId: ${secsWithObjectId.length}\n`
    );

    // Detailed report
    console.log("📋 Details:\n");
    console.log(`Total SECs: ${allSecs.length}`);
    console.log(`SECs with employeeId: ${secsWithEmployeeId.length}`);
    console.log(`SECs with ObjectId format: ${secsWithObjectId.length}`);
    console.log(
      `SECs without employeeId: ${allSecs.length - secsWithEmployeeId.length}\n`
    );

    // File mein save karo
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSecs: allSecs.length,
        secsWithEmployeeId: secsWithEmployeeId.length,
        secsWithObjectId: secsWithObjectId.length,
        secsWithoutEmployeeId: allSecs.length - secsWithEmployeeId.length,
      },
      secsWithObjectIdInEmployeeId: secsWithObjectId.map((sec) => ({
        id: sec.id,
        fullName: sec.fullName,
        phone: sec.phone,
        employeeId: sec.employeeId,
        email: sec.email,
        storeId: sec.storeId,
        city: sec.city,
      })),
    };

    const fileName = `sec_with_objectid_employeeid_${new Date().toISOString().split("T")[0]}.json`;
    fs.writeFileSync(fileName, JSON.stringify(reportData, null, 2));

    console.log(`✨ Report saved to: ${fileName}`);
    console.log(`📁 Total records in file: ${secsWithObjectId.length}`);

    // CSV format mein bhi save karo
    if (secsWithObjectId.length > 0) {
      const csvFileName = `sec_with_objectid_employeeid_${new Date().toISOString().split("T")[0]}.csv`;
      const csvHeader =
        "ID,Full Name,Phone,Employee ID,Email,Store ID,City\n";
      const csvRows = secsWithObjectId
        .map(
          (sec) =>
            `"${sec.id}","${sec.fullName || ""}","${sec.phone}","${sec.employeeId}","${sec.email || ""}","${sec.storeId || ""}","${sec.city || ""}"`
        )
        .join("\n");

      fs.writeFileSync(csvFileName, csvHeader + csvRows);
      console.log(`📊 CSV report saved to: ${csvFileName}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSecWithEmployeeId();
