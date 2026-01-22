import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

// GET /api/samsung-administrator/profile
// Get Samsung Admin profile
export async function GET(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'SAMSUNG_ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        samsungAdminProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        }
      }
    });

    if (!user || !user.samsungAdminProfile) {
      return NextResponse.json({ error: 'Samsung Admin profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: user.samsungAdminProfile.id,
          fullName: user.samsungAdminProfile.fullName,
          phone: user.samsungAdminProfile.phone,
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/samsung-administrator/profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
