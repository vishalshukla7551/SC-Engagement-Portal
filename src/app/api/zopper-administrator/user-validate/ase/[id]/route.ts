import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/user-validate/ase/[id]
// Body: { storeIds?: string[]; zsmId?: string }
// Updates store / manager mapping for an ASE profile.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: aseId } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const { storeIds, zsmId } = body as { storeIds?: string[]; zsmId?: string };

    if ((!storeIds || storeIds.length === 0) && !zsmId) {
      return NextResponse.json(
        { error: 'At least one of storeIds or zsmId must be provided' },
        { status: 400 },
      );
    }

    const existing = await prisma.aSE.findUnique({ where: { id: aseId } });
    if (!existing) {
      return NextResponse.json({ error: 'ASE profile not found' }, { status: 404 });
    }

    // Validate if zsmId is a valid MongoDB ObjectId (24 hex chars)
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    const validZsmId = zsmId && isValidObjectId(zsmId) ? zsmId : undefined;

    const updated = await prisma.aSE.update({
      where: { id: aseId },
      data: {
        ...(storeIds && storeIds.length ? { storeIds } : {}),
        ...(validZsmId ? { zsmId: validZsmId } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/user-validate/ase/[id]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
