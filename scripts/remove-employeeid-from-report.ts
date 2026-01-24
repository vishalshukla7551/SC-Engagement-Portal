import * as fs from "fs";

const fileName = "sec_with_objectid_employeeid_2026-01-24.json";

try {
  console.log(`📖 Reading file: ${fileName}\n`);

  // File ko read karo
  const fileContent = fs.readFileSync(fileName, "utf-8");
  const data = JSON.parse(fileContent);

  console.log(`📊 Total records before: ${data.secsWithObjectIdInEmployeeId.length}`);

  // employeeId field ko remove karo sabhi records se
  const updatedRecords = data.secsWithObjectIdInEmployeeId.map((sec: any) => {
    const { employeeId, ...rest } = sec;
    return rest;
  });

  // Updated data structure
  const updatedData = {
    ...data,
    secsWithObjectIdInEmployeeId: updatedRecords,
  };

  // Updated file ko save karo
  const newFileName = `sec_with_objectid_employeeid_cleaned_${new Date().toISOString().split("T")[0]}.json`;
  fs.writeFileSync(newFileName, JSON.stringify(updatedData, null, 2));

  console.log(`✅ employeeId field removed from all records`);
  console.log(`📁 New file saved: ${newFileName}`);
  console.log(`📊 Total records in new file: ${updatedRecords.length}\n`);

  // Sample record dikhao
  console.log("📋 Sample record (employeeId removed):");
  console.log(JSON.stringify(updatedRecords[0], null, 2));
} catch (error) {
  console.error("❌ Error:", error);
}
