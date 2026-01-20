import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== ('SEC' as Role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sec = await prisma.sEC.findUnique({
            where: { phone: authUser.id },
            select: { id: true }
        });

        if (!sec) {
            return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
        }

        // specific status check logic? Assuming all reports are valid sales.
        const reports = await prisma.spotIncentiveReport.findMany({
            where: { secId: sec.id },
            include: {
                plan: {
                    select: { price: true, planType: true }
                }
            }
        });

        const totalSales = reports.reduce((sum, report) => sum + (report.plan?.price || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                totalSales,
                salesCount: reports.length
            }
        });
    } catch (error) {
        console.error('Error in GET /api/sec/republic-hero', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
