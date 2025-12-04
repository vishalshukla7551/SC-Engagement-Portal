import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/sec/incentive-form/devices
 * Returns list of all Samsung SKUs (devices) grouped by category
 */
export async function GET() {
  try {
    const devices = await prisma.samsungSKU.findMany({
      select: {
        id: true,
        Category: true,
        ModelName: true,
      },
      orderBy: [
        { Category: 'asc' },
        { ModelName: 'asc' },
      ],
    });

    // Group devices by category for easier frontend handling
    const groupedByCategory = devices.reduce((acc, device) => {
      if (!acc[device.Category]) {
        acc[device.Category] = [];
      }
      acc[device.Category].push({
        id: device.id,
        modelName: device.ModelName,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; modelName: string }>>);

    return NextResponse.json(
      {
        devices,
        groupedByCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}
