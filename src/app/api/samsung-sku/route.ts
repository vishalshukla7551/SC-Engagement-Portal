import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import path from 'path';

interface SamsungRow {
  Category?: string;
  Model_Name?: string;
  [key: string]: any;
}

function buildPlanKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET: return raw Samsung plan price rows (primarily for debugging / admin use)
export async function GET() {
  try {
    const rows = await prisma.samsungPlanPrice.findMany({
      orderBy: [
        { category: 'asc' },
        { modelName: 'asc' },
        { planLabel: 'asc' },
      ],
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching Samsung plan prices', error);
    return NextResponse.json({ error: 'Failed to fetch Samsung plan prices' }, { status: 500 });
  }
}

// POST /api/samsung-sku
// One-time/import endpoint: reads root-level "Samsung SKU with Plan Price.xlsx" and
// loads ALL Samsung SKU + plan prices into MongoDB.
export async function POST() {
  try {
    const workbookPath = path.join(process.cwd(), 'Samsung SKU with Plan Price.xlsx');
    const workbook = XLSX.readFile(workbookPath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<SamsungRow>(sheet, { defval: '' });

    // Clear existing data so DB matches Excel
    await prisma.samsungPlanPrice.deleteMany({});

    let inserted = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const category = (row.Category || (row as any).category || '').toString().trim();
      const modelName =
        (row.Model_Name || (row as any).Model || (row as any).model_name || (row as any)['Model Name'] || '')
          .toString()
          .trim();

      if (!category || !modelName) {
        // Skip invalid rows
        continue;
      }

      for (const [rawKey, rawValue] of Object.entries(row)) {
        if (!rawKey) continue;
        if (rawKey === 'Category' || rawKey.toLowerCase() === 'category') continue;
        if (rawKey === 'Model_Name' || rawKey === 'Model' || rawKey.toLowerCase() === 'model_name') continue;

        const label = rawKey.toString().trim();
        if (!label) continue;

        const numeric = Number(rawValue);
        if (!Number.isFinite(numeric) || numeric <= 0) continue;

        const planKey = buildPlanKey(label);

        await prisma.samsungPlanPrice.create({
          data: {
            category,
            modelName,
            planLabel: label,
            planKey,
            price: numeric,
          },
        });

        inserted += 1;
      }
    }

    return NextResponse.json(
      { message: 'Samsung SKU data imported from Excel successfully', inserted },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error importing Samsung SKU data from Excel', error);
    return NextResponse.json(
      {
        error:
          'Failed to import Samsung SKU data from Excel. Check that "Samsung SKU with Plan Price.xlsx" exists at the project root and has the expected format.',
      },
      { status: 500 },
    );
  }
}
