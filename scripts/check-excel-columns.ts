import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

async function checkExcelColumns() {
    const excelPath = path.join(process.cwd(), 'Excel', 'Reliance Store list_Salesdost.xlsx');

    console.log(`📂 Checking Excel file: ${excelPath}\n`);

    if (!fs.existsSync(excelPath)) {
        console.error(`❌ Error: File not found at ${excelPath}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    console.log(`📊 Sheet name: ${firstSheetName}\n`);

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
        console.log('⚠️  No data found in Excel file');
        return;
    }

    console.log(`📝 Total rows: ${rows.length}\n`);

    // Get column names from first row
    const firstRow = rows[0] as any;
    const columnNames = Object.keys(firstRow);

    console.log('📋 Column names found:');
    columnNames.forEach((col, idx) => {
        console.log(`   ${idx + 1}. "${col}"`);
    });

    console.log('\n📄 Sample data (first 3 rows):');
    rows.slice(0, 3).forEach((row: any, idx) => {
        console.log(`\nRow ${idx + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
    });
}

checkExcelColumns();
