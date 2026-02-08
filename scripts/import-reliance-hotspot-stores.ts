import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

function buildStoreId(n: number): string {
    return `store_${n.toString().padStart(5, '0')}`;
}

interface ExcelRow {
    'Store Name'?: string;
    'City'?: string;
    'State'?: string;
    'Id'?: string;
    // Handle various possible column names
    [key: string]: any;
}

async function importFromExcel(excelFileName: string, startIndex: number, existingIds: Set<string>) {
    const excelPath = path.join(process.cwd(), 'Excel', excelFileName);
    console.log(`\n📁 Reading Excel file: ${excelFileName}`);
    console.log(`From path: ${excelPath}`);

    if (!fs.existsSync(excelPath)) {
        console.error(`❌ File not found: ${excelPath}`);
        return { imported: 0, updated: 0, skipped: 0, nextIndex: startIndex };
    }

    const workbook = XLSX.readFile(excelPath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    console.log(`📊 Processing sheet: ${firstSheetName}`);

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });

    console.log(`Found ${rows.length} rows in Excel`);

    let imported = 0;
    let skipped = 0;
    let updated = 0;
    let currentIndex = startIndex;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Try to find store name in various possible columns
        const storeName = row['Store Name'] || row['store_name'] || row['name'] || row['Name'] || '';

        if (!storeName || typeof storeName !== 'string' || !storeName.trim()) {
            console.log(`Row ${i + 1}: ⏭️  Skipping - no store name found`);
            skipped++;
            continue;
        }

        const city = (row['City'] || row['city'] || '').toString().trim() || null;

        // Use provided ID or generate one
        const id = row['Id'] && row['Id'].toString().trim()
            ? row['Id'].toString().trim()
            : buildStoreId(currentIndex);

        try {
            // Check if store already exists
            if (existingIds.has(id)) {
                // Update existing store
                await prisma.store.update({
                    where: { id },
                    data: {
                        name: storeName.trim(),
                        city,
                    },
                });
                updated++;
                console.log(`Row ${i + 1}: ↻ Updated ${storeName.trim()} (${id})`);
            } else {
                // Create new store
                await prisma.store.create({
                    data: {
                        id,
                        name: storeName.trim(),
                        city,
                        region: "WEST", // Default region, can be updated later
                    },
                });
                existingIds.add(id); // Add to set to avoid duplicate checks
                imported++;
                console.log(`Row ${i + 1}: ✅ Imported ${storeName.trim()} (${id})`);

                // Increment index only for newly created stores
                if (!row['Id']) {
                    currentIndex++;
                }
            }
        } catch (error: any) {
            // Handle duplicate key error specifically
            if (error.code === 11000 || error.code === 'P2002') {
                console.log(`Row ${i + 1}: ⏭️  Skipping - ${storeName.trim()} (${id}) already exists`);
            } else {
                console.error(`Row ${i + 1}: ❌ Failed to import ${storeName}:`, error.message || error);
            }
            skipped++;
        }
    }

    return { imported, updated, skipped, nextIndex: currentIndex };
}

async function main() {
    console.log('🚀 Starting import of Reliance Digital and Hotspot stores...\n');

    // Get current max store number and existing store IDs
    const existingStores = await prisma.store.findMany({ select: { id: true } });
    const existingIds = new Set(existingStores.map(s => s.id));
    const existingNumbers = existingStores
        .map(s => {
            const match = s.id.match(/store_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

    let startIndex = 1;
    if (existingNumbers.length > 0) {
        startIndex = Math.max(...existingNumbers) + 1;
    }

    console.log(`📊 Current database status:`);
    console.log(`   Total existing stores: ${existingStores.length}`);
    console.log(`   Next store ID will start from: store_${startIndex.toString().padStart(5, '0')}\n`);

    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // Import Reliance Digital stores
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 IMPORTING RELIANCE DIGITAL STORES');
    console.log('═══════════════════════════════════════════════════════');
    const relianceResult = await importFromExcel('Reliance Digital_Store List.xlsx', startIndex, existingIds);
    totalImported += relianceResult.imported;
    totalUpdated += relianceResult.updated;
    totalSkipped += relianceResult.skipped;

    // Import Hotspot stores (continue from where Reliance left off)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔥 IMPORTING HOTSPOT STORES');
    console.log('═══════════════════════════════════════════════════════');
    const hotspotResult = await importFromExcel('Hotspot Store List.xlsx', relianceResult.nextIndex, existingIds);
    totalImported += hotspotResult.imported;
    totalUpdated += hotspotResult.updated;
    totalSkipped += hotspotResult.skipped;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 FINAL IMPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Successfully imported: ${totalImported}`);
    console.log(`↻  Updated: ${totalUpdated}`);
    console.log(`⏭️  Skipped/Failed: ${totalSkipped}`);

    // Show all stores now in DB
    const allStores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
    console.log(`\n📦 Total stores in database: ${allStores.length}`);

    if (allStores.length <= 20) {
        console.log('\n📋 All stores:');
        allStores.forEach((store, idx) => {
            console.log(`  ${idx + 1}. ${store.name} - ${store.city || 'N/A'} (${store.id})`);
        });
    } else {
        console.log(`\n📋 Showing last 15 stores (total: ${allStores.length}):`);
        allStores.slice(-15).forEach((store, idx) => {
            console.log(`  ${allStores.length - 14 + idx}. ${store.name} - ${store.city || 'N/A'} (${store.id})`);
        });
    }

    console.log('\n✨ Import completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
