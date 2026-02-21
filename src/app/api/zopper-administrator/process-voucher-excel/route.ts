import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import * as XLSX from 'xlsx';

/**
 * POST /api/zopper-administrator/process-voucher-excel
 *
 * Bulk-assigns voucher codes to SpotIncentiveReport records via an uploaded Excel.
 * The Excel is the same one exported from /Zopper-Administrator/spot-incentive-report,
 * with the admin having filled in the "Voucher Code" column.
 *
 * Matching key : "IMEI" column  →  spotIncentiveReport.imei  (@@unique)
 * Write fields : voucherCode + spotincentivepaidAt = now()
 *
 * Per-row outcomes:
 *   success   – voucher assigned, paid timestamp set
 *   skipped   – record already has the exact same voucher code (idempotent, paidAt preserved)
 *   notFound  – no SpotIncentiveReport with that IMEI
 *   failed    – validation error or duplicate voucher on a different record
 */
export async function POST(req: NextRequest) {
    try {
        // ── Auth guard ──────────────────────────────────────────────────────────
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── File validation ─────────────────────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
                { status: 400 }
            );
        }

        // ── Parse Excel ─────────────────────────────────────────────────────────
        let rows: any[];
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet) as any[];
        } catch {
            return NextResponse.json({ error: 'Failed to parse Excel file' }, { status: 400 });
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
        }

        // ── Result accumulators ─────────────────────────────────────────────────
        const results = {
            total: 0,
            updated: 0,
            skipped: 0,
            notFound: 0,
            failed: 0,
            details: {
                success: [] as Array<{ imei: string; voucherCode: string }>,
                skipped: [] as Array<{ imei: string; voucherCode: string; reason: string }>,
                notFound: [] as Array<{ imei: string }>,
                failed: [] as Array<{ imei: string; voucherCode: string; reason: string }>,
            },
        };

        const paidAt = new Date();

        // ── Per-row processing ──────────────────────────────────────────────────
        for (const row of rows) {
            results.total++;

            const imeiRaw = row['IMEI'];
            const voucherRaw = row['Voucher Code'];

            const imeiStr = imeiRaw?.toString().trim() ?? '';
            const voucherCodeStr = voucherRaw?.toString().trim() ?? '';

            // 1. Missing IMEI or Voucher Code column
            if (!imeiStr || !voucherCodeStr) {
                results.failed++;
                results.details.failed.push({
                    imei: imeiStr || 'N/A',
                    voucherCode: voucherCodeStr || '',
                    reason: !imeiStr ? 'Missing IMEI' : 'Missing Voucher Code',
                });
                continue;
            }

            try {
                // 2. Look up record by IMEI
                const report = await prisma.spotIncentiveReport.findUnique({
                    where: { imei: imeiStr },
                    select: {
                        id: true,
                        voucherCode: true,
                        spotincentivepaidAt: true,
                        secUser: { select: { fullName: true } },
                    },
                });

                if (!report) {
                    results.notFound++;
                    results.details.notFound.push({ imei: imeiStr });
                    continue;
                }

                // 3. Idempotency — same voucher already on this record → skip
                if (report.voucherCode === voucherCodeStr) {
                    results.skipped++;
                    results.details.skipped.push({
                        imei: imeiStr,
                        voucherCode: voucherCodeStr,
                        reason: 'Voucher code already assigned to this record',
                    });
                    continue;
                }

                // 4. Duplicate check — same voucher on a DIFFERENT record
                const existingVoucher = await prisma.spotIncentiveReport.findFirst({
                    where: {
                        voucherCode: voucherCodeStr,
                        NOT: { id: report.id },
                    },
                    select: { imei: true },
                });

                if (existingVoucher) {
                    results.failed++;
                    results.details.failed.push({
                        imei: imeiStr,
                        voucherCode: voucherCodeStr,
                        reason: `Voucher code already assigned to IMEI ${existingVoucher.imei}`,
                    });
                    continue;
                }

                // 5. All checks passed → update
                await prisma.spotIncentiveReport.update({
                    where: { id: report.id },
                    data: {
                        voucherCode: voucherCodeStr,
                        spotincentivepaidAt: paidAt,
                    },
                });

                results.updated++;
                results.details.success.push({ imei: imeiStr, voucherCode: voucherCodeStr });

            } catch (error) {
                results.failed++;
                results.details.failed.push({
                    imei: imeiStr,
                    voucherCode: voucherCodeStr,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // ── Response ────────────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            summary: {
                total: results.total,
                updated: results.updated,
                skipped: results.skipped,
                notFound: results.notFound,
                failed: results.failed,
            },
            details: results.details,
        });

    } catch (error) {
        console.error('Error in POST /api/zopper-administrator/process-voucher-excel', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
