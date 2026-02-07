import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import * as XLSX from 'xlsx';

/**
 * POST /api/zopper-administrator/spot-incentive-report/import
 * Import Excel file to approve or delete sales based on "Approved" column
 * 
 * Request Body: FormData with 'file' field containing the Excel file
 * 
 * Approved Column Values:
 * - "YES" → Approve the sale (mark as paid)
 * - "NO" → Delete the sale from database
 * - Blank or anything else → Skip (no action)
 * 
 * Response:
 * - success: boolean
 * - summary: { total, approved, deleted, notFound, errors, skipped }
 * - details: Array of processing results
 */
export async function POST(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse the uploaded file
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            return NextResponse.json({ error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' }, { status: 400 });
        }

        // Read the file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
        }

        // Process the data
        const results = {
            total: 0,
            approved: 0,
            deleted: 0,
            notFound: 0,
            errors: 0,
            details: [] as Array<{
                reportId: string;
                status: 'approved' | 'deleted' | 'not_found' | 'error' | 'skipped';
                message: string;
            }>
        };

        const approvalTimestamp = new Date();

        for (const row of data as any[]) {
            results.total++;

            // Get Report ID and Approved status
            const reportId = row['Report ID']?.toString().trim();
            const approvedValue = row['Approved']?.toString().trim().toUpperCase();

            // Skip if no Report ID
            if (!reportId) {
                results.errors++;
                results.details.push({
                    reportId: 'N/A',
                    status: 'error',
                    message: 'Missing Report ID'
                });
                continue;
            }

            // Skip if not marked as YES or NO
            if (approvedValue !== 'YES' && approvedValue !== 'NO') {
                results.details.push({
                    reportId,
                    status: 'skipped',
                    message: 'Not marked for approval or deletion'
                });
                continue;
            }

            try {
                // Find the report
                const report = await prisma.spotIncentiveReport.findUnique({
                    where: { id: reportId },
                    select: {
                        id: true,
                        spotincentivepaidAt: true,
                        secUser: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                });

                if (!report) {
                    results.notFound++;
                    results.details.push({
                        reportId,
                        status: 'not_found',
                        message: 'Report ID not found in database'
                    });
                    continue;
                }

                // Handle "NO" - Delete the sale
                if (approvedValue === 'NO') {
                    await prisma.spotIncentiveReport.delete({
                        where: { id: reportId }
                    });

                    results.deleted++;
                    results.details.push({
                        reportId,
                        status: 'deleted',
                        message: `Successfully deleted sale for ${report.secUser.fullName || 'SEC'}`
                    });
                    continue;
                }

                // Handle "YES" - Approve the sale
                if (approvedValue === 'YES') {
                    // Check if already paid
                    if (report.spotincentivepaidAt) {
                        results.details.push({
                            reportId,
                            status: 'skipped',
                            message: 'Already approved/paid'
                        });
                        continue;
                    }

                    // Update the report to mark as paid
                    await prisma.spotIncentiveReport.update({
                        where: { id: reportId },
                        data: {
                            spotincentivepaidAt: approvalTimestamp
                        }
                    });

                    results.approved++;
                    results.details.push({
                        reportId,
                        status: 'approved',
                        message: `Successfully approved for ${report.secUser.fullName || 'SEC'}`
                    });
                }

            } catch (error) {
                results.errors++;
                results.details.push({
                    reportId,
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: results.total,
                approved: results.approved,
                deleted: results.deleted,
                notFound: results.notFound,
                errors: results.errors,
                skipped: results.total - results.approved - results.deleted - results.notFound - results.errors
            },
            details: results.details
        });

    } catch (error) {
        console.error('Error in POST /api/zopper-administrator/spot-incentive-report/import', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
