import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

interface SecDocument {
  id: string;
  fullName: string;
  phone: string;
  employeeId: string;
  email: null | string;
  storeId: string;
  city: null | string;
}

async function clearEmployeeIdFromDatabase() {
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync(
      "sec_with_objectid_employeeid_2026-01-24.json",
      "utf-8"
    );
    const data = JSON.parse(jsonData);
    const documents: SecDocument[] = data.secsWithObjectIdInEmployeeId;

    console.log(`Found ${documents.length} documents to process...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each document
    for (const doc of documents) {
      try {
        // Update the SEC user and clear employeeId
        const updated = await prisma.sEC.update({
          where: { id: doc.id },
          data: {
            employeeId: null,
          },
        });

        successCount++;
        console.log(
          `✓ Updated ${doc.fullName} (${doc.phone}) - employeeId cleared`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to update ${doc.fullName} (${doc.phone}):`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total documents: ${documents.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearEmployeeIdFromDatabase();
