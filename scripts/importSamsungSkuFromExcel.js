const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

function buildPlanKey(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const excelPath = path.join(process.cwd(), 'Samsung SKU with Plan Price.xlsx');
  console.log('Reading Excel file: Samsung SKU with Plan Price.xlsx');
  console.log('From path:', excelPath);

  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at path:', excelPath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  console.log(`Processing sheet: ${firstSheetName}`);

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  console.log(`Found ${rows.length} rows in Excel`);

  // Clear existing data so DB matches Excel completely
  await prisma.samsungPlanPrice.deleteMany({});

  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const category = (row.Category || row.category || '').toString().trim();
    const modelName =
      (row.Model_Name || row.Model || row.model_name || row['Model Name'] || '').toString().trim();

    if (!category || !modelName) {
      console.log(`Row ${i + 1}: Skipping - missing Category or Model_Name`);
      continue;
    }

    for (const [rawKey, rawValue] of Object.entries(row)) {
      if (!rawKey) continue;
      if (rawKey === 'Category' || rawKey.toLowerCase() === 'category') continue;
      if (rawKey === 'Model_Name' || rawKey === 'Model' || rawKey.toLowerCase() === 'model_name')
        continue;

      const label = rawKey.toString().trim();
      if (!label) continue;

      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric) || numeric <= 0) continue;

      const planKey = buildPlanKey(label);

      await prisma.samsungPlanPrice.create({
        data: {
          category,
          modelName,
          planLabel: label,
          planKey,
          price: numeric,
        },
      });
      inserted += 1;
      console.log(
        `Row ${i + 1}: Imported ${category} - ${modelName} | ${label} -> Rs. ${numeric.toFixed(2)}`,
      );
    }
  }

  console.log('\n=== Samsung SKU Import Summary ===');
  console.log(`Total Excel rows: ${rows.length}`);
  console.log(`Total plan price rows inserted: ${inserted}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
