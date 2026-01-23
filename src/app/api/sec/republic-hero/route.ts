import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

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
            where: {
                secId: sec.id,
                spotincentivepaidAt: { not: null },
            },
            include: {
                plan: {
                    select: { price: true, planType: true }
                }
            }
        });

        let totalSales = reports.reduce((sum, report) => sum + (report.plan?.price || 0), 0);

        // Add bonus points if user is in bonus list
        if (BONUS_PHONE_NUMBERS.includes(authUser.id)) {
            totalSales += 21000;
        }

        return NextResponse.json({
            success: true,
            data: {
                totalSales,
                salesCount: reports.length,
                hasBonus: BONUS_PHONE_NUMBERS.includes(authUser.id)
            }
        });
    } catch (error) {
        console.error('Error in GET /api/sec/republic-hero', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
