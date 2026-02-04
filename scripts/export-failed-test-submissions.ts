
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as XLSX from 'xlsx';
import * as path from 'path';

async function exportFailedTestSubmissions() {
    try {
        console.log('🔄 Starting export of failed test submissions (< 80%)...');

        // Fetch all test submissions with score < 80
        // Note: score is stored as Int (e.g. 70 for 70%)
        const submissions = await prisma.testSubmission.findMany({
            where: {
                score: {
                    lt: 80
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📊 Found ${submissions.length} submissions with score < 80%`);

        if (submissions.length === 0) {
            console.log('✅ No failed submissions found.');
            return;
        }

        // Filter secIds into valid ObjectIds and potential Employee IDs
        const validObjectIdRegex = /^[0-9a-fA-F]{24}$/;

        // Get unique non-null secIds
        // Use Set to remove duplicates immediately
        const distinctSecIds = [...new Set(submissions
            .map(s => s.secId)
            .filter((id): id is string => !!id))];

        const objectIds = distinctSecIds.filter(id => validObjectIdRegex.test(id));
        const potentialEmployeeIds = distinctSecIds.filter(id => !validObjectIdRegex.test(id));

        // Fetch SECs by valid ObjectId
        const secsById = await prisma.sEC.findMany({
            where: {
                id: {
                    in: objectIds
                }
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                employeeId: true
            }
        });

        // Fetch SECs by EmployeeId (for those that aren't valid ObjectIds)
        const secsByEmployeeId = potentialEmployeeIds.length > 0 ? await prisma.sEC.findMany({
            where: {
                employeeId: {
                    in: potentialEmployeeIds
                }
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                employeeId: true
            }
        }) : [];

        // Combine results into a map
        // We map BOTH id -> sec AND employeeId -> sec to handle both cases in lookup
        const secMap = new Map();
        [...secsById, ...secsByEmployeeId].forEach(sec => {
            secMap.set(sec.id, sec);
            if (sec.employeeId) {
                secMap.set(sec.employeeId, sec);
            }
        });

        // Collect all storeIds efficiently
        const storeIds = [...new Set(submissions
            .map(s => s.storeId)
            .filter((id): id is string => !!id))];

        // Fetch Store details
        const stores = await prisma.store.findMany({
            where: {
                id: {
                    in: storeIds
                }
            },
            select: {
                id: true,
                name: true
            }
        });

        const storeMap = new Map(stores.map(store => [store.id, store.name]));

        // Transform data for Excel export
        const exportData = submissions.map(submission => {
            let secName = 'N/A';

            if (submission.secId && secMap.has(submission.secId)) {
                const sec = secMap.get(submission.secId);
                secName = sec?.fullName || 'N/A';
            }

            let storeName = submission.storeName;
            if (!storeName && submission.storeId && storeMap.has(submission.storeId)) {
                storeName = storeMap.get(submission.storeId) || 'N/A';
            }

            return {
                'Name': secName,
                'SEC ID': submission.secId || 'N/A',
                'Phone Number': submission.phone || 'N/A',
                'Store Name': storeName || 'N/A',
                'Score': `${submission.score}%`,
                'Test Name': submission.testName || 'N/A',
                'Date': new Date(submission.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };
        });

        // Create Excel workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Failed Submissions');

        // Set column widths
        const colWidths = [
            { wch: 25 }, // Name
            { wch: 25 }, // SEC ID
            { wch: 15 }, // Phone Number
            { wch: 30 }, // Store Name (Newly added)
            { wch: 10 }, // Score
            { wch: 30 }, // Test Name
            { wch: 25 }, // Date
        ];
        ws['!cols'] = colWidths;

        // Generate filename
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Failed_Test_Submissions_${currentDate}.xlsx`;
        const filepath = path.join(process.cwd(), filename);

        // Write Excel file
        XLSX.writeFile(wb, filepath);

        console.log(`✅ Successfully exported ${exportData.length} records.`);
        console.log(`📁 File saved as: ${filename}`);
        console.log(`📍 Full path: ${filepath}`);

    } catch (error) {
        console.error('❌ Error exporting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
exportFailedTestSubmissions();
