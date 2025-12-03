import { PrismaClient, Role, Validation } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

function buildStoreId(n: number): string {
  return `store_${n.toString().padStart(5, '0')}`;
}

async function main() {
  // ----- STORES FROM EXCEL -----
  // Place your Excel file at: prisma/stores.xlsx
  // Accepted header names (case-insensitive):
  // - id:        "id", "store_id", "Store ID"
  // - name:      "name", "store_name", "Store Name"
  // - city:      "city", "City"
  // - state:     "state", "State"
  try {
    const workbookPath = path.join(process.cwd(), 'prisma', 'stores.xlsx');
    const workbook = XLSX.readFile(workbookPath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], {
      defval: '',
    });

    // Remove any existing dummy data first so only Excel stores remain
    await prisma.store.deleteMany({});

    let index = 1;
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

      // Fallback to generated ID if "id" column is missing
      const id: string = (idFromExcel as string) || buildStoreId(index++);
      const name: string = (nameFromExcel as string) || '';
      const city: string | null = cityFromExcel ? String(cityFromExcel) : null;
      const state: string | null = stateFromExcel ? String(stateFromExcel) : null;

      if (!name) continue; // skip empty rows

      await prisma.store.create({
        data: {
          id,
          name,
          city,
          state,
        },
      });
    }
  } catch (err) {
    console.warn('Store seeding from prisma/stores.xlsx skipped:', err);
  }

  // ----- HELPERS FOR ZBM / ZSE -----
  async function ensureZbm(
    username: string,
    fullName: string,
    phone: string,
    region: string,
  ) {
    let user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          password: 'Password@123', // demo only
          role: Role.ZBM,
          validation: Validation.APPROVED,
          metadata: {},
        },
      });
    }

    await prisma.zBM.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phone,
        region,
      },
      create: {
        userId: user.id,
        fullName,
        phone,
        region,
      },
    });
  }

  async function ensureZse(
    username: string,
    fullName: string,
    phone: string,
    region: string,
  ) {
    let user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          password: 'Password@123', // demo only
          role: Role.ZSE,
          validation: Validation.APPROVED,
          metadata: {},
        },
      });
    }

    await prisma.zSE.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phone,
        region,
      },
      create: {
        userId: user.id,
        fullName,
        phone,
        region,
      },
    });
  }

  // ----- 5 ZBMs (Indian names) -----
  await Promise.all([
    ensureZbm('zbm.mumbai', 'Rajesh Sharma', '9876543210', 'Mumbai'),
    ensureZbm('zbm.delhi', 'Amit Verma', '9876501234', 'Delhi NCR'),
    ensureZbm('zbm.pune', 'Sandeep Kulkarni', '9876512345', 'Pune'),
    ensureZbm('zbm.bengaluru', 'Rohit Nair', '9876523456', 'Bengaluru'),
    ensureZbm('zbm.kolkata', 'Anirban Ghosh', '9876534567', 'Kolkata'),
  ]);

  // ----- 5 ZSEs (Indian names) -----
  await Promise.all([
    ensureZse('zse.mumbai', 'Neha Gupta', '9867543210', 'Mumbai'),
    ensureZse('zse.delhi', 'Pooja Singh', '9867501234', 'Delhi NCR'),
    ensureZse('zse.pune', 'Kiran Patil', '9867512345', 'Pune'),
    ensureZse('zse.bengaluru', 'Smita Rao', '9867523456', 'Bengaluru'),
    ensureZse('zse.kolkata', 'Soumya Banerjee', '9867534567', 'Kolkata'),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
