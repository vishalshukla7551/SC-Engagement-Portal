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

    // Safe Fetch Strategy
    let sec;
    try {
      sec = await prisma.sEC.findUnique({
        where: { phone: authUser.username },
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
          },
          otherProfileInfo: true
        } as any
      });
    } catch (e: any) {
      // Fallback for stale schema
      console.warn('Prisma schema mismatch on GET. Fetching without new fields.');
      sec = await prisma.sEC.findUnique({
        where: { phone: authUser.username },
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
    }

    if (!sec) {
      return NextResponse.json({ error: 'SEC profile not found' }, { status: 404 });
    }

    const record: any = sec;

    return NextResponse.json({
      success: true,
      data: {
        sec: {
          id: record.id,
          fullName: record.fullName,
          phone: record.phone,
          secId: record.employeeId,
          otherProfileInfo: record.otherProfileInfo
        },
        store: record.store
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