import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function backupSecDocuments() {
  try {
    console.log("🔄 SEC documents ka backup le rahe hain...\n");

    // Sabhi SEC users ko fetch karo
    const allSecs = await prisma.sEC.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        employeeId: true,
        email: true,
        kycInfo: true,
        storeId: true,
        city: true,
        AgencyName: true,
      },
    });

    console.log(`📊 Total SEC users: ${allSecs.length}\n`);

    // Backup folder create karo
    const backupDir = "backups";
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log(`📁 Backup directory created: ${backupDir}\n`);
    }

    // Timestamp ke saath backup file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = path.join(
      backupDir,
      `sec_backup_${timestamp}.json`
    );

    // Backup data structure
    const backupData = {
      backupTimestamp: new Date().toISOString(),
      totalRecords: allSecs.length,
      records: allSecs,
    };

    // Backup file ko save karo
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup successfully created!`);
    console.log(`📁 Backup file: ${backupFileName}`);
    console.log(`📊 Total records backed up: ${allSecs.length}`);
    console.log(`⏰ Backup timestamp: ${backupData.backupTimestamp}\n`);

    // CSV format mein bhi backup lelo
    const csvBackupFileName = path.join(
      backupDir,
      `sec_backup_${timestamp}.csv`
    );
    const csvHeader =
      "ID,Full Name,Phone,Employee ID,Email,Store ID,City,Agency Name,KYC Info\n";
    const csvRows = allSecs
      .map(
        (sec) =>
          `"${sec.id}","${sec.fullName || ""}","${sec.phone}","${sec.employeeId || ""}","${sec.email || ""}","${sec.storeId || ""}","${sec.city || ""}","${sec.AgencyName || ""}","${sec.kycInfo ? JSON.stringify(sec.kycInfo).replace(/"/g, '""') : ""}"`
      )
      .join("\n");

    fs.writeFileSync(csvBackupFileName, csvHeader + csvRows);
    console.log(`📊 CSV backup file: ${csvBackupFileName}\n`);

    // Summary
    console.log("📋 Backup Summary:");
    console.log(`   - JSON format: ${backupFileName}`);
    console.log(`   - CSV format: ${csvBackupFileName}`);
    console.log(`   - Total records: ${allSecs.length}`);
    console.log(`   - Backup size: ${(fs.statSync(backupFileName).size / 1024).toFixed(2)} KB\n`);

    console.log("✨ Backup complete! Ab aap safely employeeId field ko remove kar sakte ho.\n");
  } catch (error) {
    console.error("❌ Error during backup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

backupSecDocuments();
