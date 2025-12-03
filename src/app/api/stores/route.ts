import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import path from 'path';

type StoreDto = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

export async function GET() {
  try {
    const stores: StoreDto[] = await prisma.store.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
    });

    return NextResponse.json(
      stores.map((store) => ({
        id: store.id,
        name: store.name,
        city: store.city,
        state: store.state,
        label: store.city ? `${store.name} - ${store.city}` : store.name,
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching stores', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 },
    );
  }
}

// POST /api/stores
// One-time/import endpoint: reads prisma/stores.xlsx and loads ALL stores into MongoDB.
// It clears the existing Store collection first, then inserts rows from Excel.
export async function POST() {
  try {
    const workbookPath = path.join(process.cwd(), 'prisma', 'stores.xlsx');
    const workbook = XLSX.readFile(workbookPath);

    // Collect rows from ALL sheets so we don't miss any stores
    const rows: any[] = [];
    for (const name of workbook.SheetNames) {
      const sheetRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[name], {
        defval: '',
      });
      rows.push(...sheetRows);
    }

    // Remove all existing stores so we only keep Excel data
    await prisma.store.deleteMany({});

    let index = 1;
    let inserted = 0;

    for (const row of rows) {
      const lower: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        lower[key.toLowerCase()] = value;
      }

      const idFromExcel =
        lower['id'] || lower['store_id'] || lower['store id'] || lower['storeid'];
      const nameFromExcel =
        lower['name'] || lower['store_name'] || lower['store name'] || lower['storename'];
      const cityFromExcel = lower['city'];
      const stateFromExcel = lower['state'];

      const id: string = (idFromExcel as string) || `store_${String(index).padStart(5, '0')}`;
      const name: string = (nameFromExcel as string) || '';
      const city: string | null = cityFromExcel ? String(cityFromExcel) : null;
      const state: string | null = stateFromExcel ? String(stateFromExcel) : null;

      if (!name) continue; // skip empty / invalid rows

      await prisma.store.create({
        data: {
          id,
          name,
          city,
          state,
        },
      });

      inserted += 1;
      index += 1;
    }

    return NextResponse.json(
      { message: 'Stores imported from Excel successfully', inserted },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error importing stores from Excel', error);
    return NextResponse.json(
      { error: 'Failed to import stores from Excel. Check that prisma/stores.xlsx exists and has the correct format.' },
      { status: 500 },
    );
  }
}



