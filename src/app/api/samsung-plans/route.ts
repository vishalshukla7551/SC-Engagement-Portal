import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.samsungPlanPrice.findMany({
      select: {
        planLabel: true,
        planKey: true,
      },
    });

    const map = new Map<string, { id: string; label: string }>();

    for (const row of rows) {
      const label = row.planLabel?.trim();
      const key = row.planKey?.trim();
      if (!label || !key) continue;
      if (!map.has(key)) {
        map.set(key, { id: key, label });
      }
    }

    const plans = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error('Error fetching Samsung plans', error);
    return NextResponse.json({ error: 'Failed to fetch Samsung plans' }, { status: 500 });
  }
}
