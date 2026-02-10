import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

function buildStoreId(n: number): string {
    return `store_${n.toString().padStart(5, '0')}`;
}

async function importRelianceStores() {
    const excelFileName = 'Reliance Store list_Salesdost.xlsx';
    const excelPath = path.join(process.cwd(), 'Excel', excelFileName);

    console.log(`📂 Reading Excel file: ${excelPath}\n`);

    if (!fs.existsSync(excelPath)) {
        console.error(`❌ Error: File not found at ${excelPath}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    console.log(`📊 Processing sheet: ${firstSheetName}`);

    // Use 'defval: ""' to ensure empty cells are empty strings
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

    console.log(`📝 Found ${rows.length} rows in Excel\n`);

    let imported = 0;
    let skipped = 0;
    let updated = 0;

    // Get current max store number to generate new IDs
    const existingStores = await prisma.store.findMany({ select: { id: true, name: true } });
    const existingIds = new Set(existingStores.map(s => s.id));
    const existingNames = new Set(existingStores.map(s => s.name.toLowerCase().trim()));

    const existingNumbers = existingStores
        .map(s => {
            const match = s.id.match(/store_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

    let nextIdNumber = 1;
    if (existingNumbers.length > 0) {
        nextIdNumber = Math.max(...existingNumbers) + 1;
    }

    console.log(`🔢 Starting new store IDs from: ${nextIdNumber}\n`);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Column Mapping based on check-excel-columns output
        const storeName = row['Store Name'];
        const city = row['City'];
        const state = row['State'];
        // 'Site Code' is available but we might not need it for the Store model unless we put it in metadata?
        // For now, we utilize the main fields.

        if (!storeName || typeof storeName !== 'string' || !storeName.trim()) {
            console.log(`⚠️  Row ${i + 1}: Skipping - no store name found`);
            skipped++;
            continue;
        }

        const trimmedName = storeName.trim();
        const trimmedCity = city ? city.toString().trim() : null;
        const trimmedState = state ? state.toString().trim() : null; // Mapping State to Region field

        // Check duplication by name
        if (existingNames.has(trimmedName.toLowerCase())) {
            console.log(`⏭️  Row ${i + 1}: Skipping - "${trimmedName}" already exists`);
            skipped++;
            continue;
        }

        // Generate valid ID
        let newId = buildStoreId(nextIdNumber);
        while (existingIds.has(newId)) {
            nextIdNumber++;
            newId = buildStoreId(nextIdNumber);
        }

        try {
            await prisma.store.create({
                data: {
                    id: newId,
                    name: trimmedName,
                    city: trimmedCity,
                    region: trimmedState, // Using State as Region
                },
            });

            existingIds.add(newId);
            existingNames.add(trimmedName.toLowerCase());
            nextIdNumber++;
            imported++;

            if (imported % 50 === 0) {
                console.log(`✅ Imported ${imported} stores so far...`);
            }

        } catch (error: any) {
            console.error(`❌ Row ${i + 1}: Failed to import "${trimmedName}":`, error.message || error);
            skipped++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`📝 Total rows in Excel: ${rows.length}`);
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`⏭️  Skipped (duplicates/empty): ${skipped}`);

    const totalStores = await prisma.store.count();
    console.log(`\n🎯 Total stores in database now: ${totalStores}`);
    console.log('='.repeat(50));
}

importRelianceStores()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('\n❌ Fatal error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
