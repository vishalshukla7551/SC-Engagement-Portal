import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.samsungPlanPrice.findMany({
      select: {
        category: true,
        modelName: true,
      },
    });

    const map = new Map<string, { id: string; category: string; modelName: string; label: string }>();

    for (const row of rows) {
      const category = row.category?.trim();
      const modelName = row.modelName?.trim();
      if (!category || !modelName) continue;

      // Use a strict composite key for uniqueness
      const key = `${category}||${modelName}`;
      if (!map.has(key)) {
        const label = `${category} - ${modelName}`;
        // Expose the composite key as the id so it is guaranteed unique
        const id = key;
        map.set(key, { id, category, modelName, label });
      }
    }

    const devices = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json(devices, { status: 200 });
  } catch (error) {
    console.error('Error fetching Samsung devices', error);
    return NextResponse.json({ error: 'Failed to fetch Samsung devices' }, { status: 500 });
  }
}
