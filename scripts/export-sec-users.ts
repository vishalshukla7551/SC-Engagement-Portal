import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function exportSecUsers() {
    try {
        console.log('Fetching all SEC users...');
        
        // Get raw data first
        const secUsersRaw = await prisma.sEC.findMany({
            select: {
                id: true,
                phone: true,
                fullName: true,
                email: true,
                storeId: true,
                city: true,
                AgencyName: true,
                employeeId: true,
            },
            orderBy: {
                phone: 'asc'
            }
        });

        console.log(`Found ${secUsersRaw.length} SEC users`);

        // Create output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(secUsersRaw);

        // Set column widths
        const columnWidths = [
            { wch: 24 }, // id
            { wch: 15 }, // phone
            { wch: 25 }, // fullName
            { wch: 30 }, // email
            { wch: 15 }, // storeId
            { wch: 20 }, // city
            { wch: 25 }, // AgencyName
            { wch: 15 }, // employeeId
        ];
        worksheet['!cols'] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SEC Users');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `sec_users_${timestamp}.xlsx`;
        const filepath = path.join(outputDir, filename);

        // Write to file
        XLSX.writeFile(workbook, filepath);

        console.log(`✓ Exported ${secUsersRaw.length} SEC users to ${filepath}`);
        console.log(`File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('Error exporting SEC users:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

exportSecUsers();
