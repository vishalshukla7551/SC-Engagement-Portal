import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imei = searchParams.get('imei');

    if (!imei) {
      return NextResponse.json(
        { error: 'IMEI parameter is required' },
        { status: 400 }
      );
    }

    // Check if IMEI exists in the database
    // Using SalesReport model from schema
    const existingSale = await prisma.salesReport.findUnique({
      where: {
        imei: imei,
      },
    });

    return NextResponse.json({
      exists: !!existingSale,
    });
  } catch (error) {
    console.error('Error checking IMEI:', error);
    return NextResponse.json(
      { error: 'Failed to check IMEI', exists: false },
      { status: 500 }
    );
  }
}
