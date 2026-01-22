import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

// GET /api/zopper-administrator/profile
// Get Zopper Administrator profile
export async function GET(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        zopperAdminProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        }
      }
    });

    if (!user || !user.zopperAdminProfile) {
      return NextResponse.json({ error: 'Zopper Administrator profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        admin: {
          id: user.zopperAdminProfile.id,
          fullName: user.zopperAdminProfile.fullName,
          phone: user.zopperAdminProfile.phone,
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/zopper-administrator/profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
