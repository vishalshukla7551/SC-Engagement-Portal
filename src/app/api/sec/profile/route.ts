import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { Role } from '@prisma/client';

// GET /api/sec/profile
// Get SEC profile and associated store
export async function GET(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== ('SEC' as Role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find SEC by phone (for SEC users, authUser.id is the phone number)
    // Note: Use authUser.username if authUser.id is not the phone number strictly in all contexts, 
    // but following existing pattern here.
    const sec = await prisma.sEC.findUnique({
      where: { phone: authUser.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        employeeId: true,
        storeId: true,
        store: {
          select: {
            id: true,
            name: true,
            city: true,
          }
        }
      }
    });

    if (!sec) {
      return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        sec: {
          id: sec.id,
          fullName: sec.fullName,
          phone: sec.phone,
          secId: sec.employeeId
        },
        store: sec.store
      }
    });
  } catch (error) {
    console.error('Error in GET /api/sec/profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sec/profile
// Update SEC profile (specifically employeeId)
export async function PUT(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== ('SEC' as Role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId } = body;

    // Use authUser.id as phone because that's what the GET endpoint uses and seems to expect
    // However, checking other files, authUser.username might be safer. 
    // We will try finding by authUser.username (if available) or authUser.id
    const userPhone = authUser.username || authUser.id;

    if (!userPhone) {
      return NextResponse.json({ error: 'User identity not found' }, { status: 400 });
    }

    const updatedSec = await prisma.sEC.update({
      where: { phone: userPhone },
      data: {
        employeeId: employeeId
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        secId: updatedSec.employeeId
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/sec/profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}