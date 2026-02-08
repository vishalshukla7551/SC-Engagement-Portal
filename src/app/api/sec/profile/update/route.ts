import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/sec/profile/update
 * Update SEC profile information (AgencyName, AgentCode)
 * Body: { agencyName?: string; agentCode?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const agencyName: string | null | undefined = body?.agencyName;
    const agentCode: string | null | undefined = body?.agentCode;
    const otherProfileInfo: any = body?.otherProfileInfo;

    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'SEC') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const phone = authUser.username;

    if (!phone) {
      return NextResponse.json(
        { error: 'Missing SEC identifier' },
        { status: 400 },
      );
    }

    // Handle Cloudinary Upload for Profile Photo
    if (otherProfileInfo?.photoUrl && otherProfileInfo.photoUrl.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(otherProfileInfo.photoUrl, {
          folder: 'sec_profiles',
          public_id: `profile_${phone}`, // Use phone to overwrite existing
          overwrite: true,
          invalidate: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" } // Optional: Optimize for profile
          ]
        });
        // Update the URL to the Cloudinary URL
        otherProfileInfo.photoUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        // Optionally fail or continue without updating photo
        return NextResponse.json({ error: 'Failed to upload profile photo' }, { status: 500 });
      }
    }


    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields if provided
    if (agencyName !== undefined) {
      updateData.AgencyName = agencyName || null;
    }

    if (agentCode !== undefined) {
      updateData.AgentCode = agentCode || null;
    }

    if (otherProfileInfo !== undefined) {
      updateData.otherProfileInfo = otherProfileInfo;
    }

    /* 
     * SAFE UPDATE STRATEGY
     * The Prisma Client runtime might be stale (cached schema) relative to the DB schema.
     * We try to update with the new field. If it fails validation, we fallback to:
     * 1. Update standard fields via Prisma
     * 2. Update new 'otherProfileInfo' field via Raw Command (bypassing validation)
     */
    let updatedRecord: any;
    let storeDetails = null;

    try {
      // Try updating with all fields
      updatedRecord = await prisma.sEC.update({
        where: { phone },
        data: updateData,
      });
    } catch (e: any) {
      // Check if error is due to unknown argument (stale client)
      if (e?.message?.includes('Unknown argument')) {
        console.warn('Prisma schema mismatch detected. Falling back to raw update strategy.');

        // 1. Standard Update (exclude otherProfileInfo)
        const { otherProfileInfo, ...safeData } = updateData;
        updatedRecord = await prisma.sEC.update({
          where: { phone },
          data: safeData,
        });

        // 2. Raw Update for otherProfileInfo
        if (otherProfileInfo) {
          try {
            await prisma.$runCommandRaw({
              update: "SEC",
              updates: [
                {
                  q: { phone: phone },
                  u: { $set: { otherProfileInfo: otherProfileInfo } }
                }
              ]
            });
            // Manually merge for response
            updatedRecord.otherProfileInfo = otherProfileInfo;
          } catch (rawError) {
            console.error('Raw update failed:', rawError);
          }
        }
      } else {
        throw e; // Re-throw other errors
      }
    }

    // Fetch store separately if storeId exists
    if (updatedRecord?.storeId) {
      storeDetails = await prisma.store.findUnique({
        where: { id: updatedRecord.storeId },
      });
    }

    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'SEC record not found' },
        { status: 404 },
      );
    }

    const record: any = updatedRecord;

    return NextResponse.json({
      success: true,
      id: record.id,
      phone: record.phone,
      fullName: record.fullName,
      AgencyName: record.AgencyName,
      AgentCode: record.AgentCode,
      storeId: record.storeId,
      otherProfileInfo: record.otherProfileInfo,
      store: storeDetails,
    });
  } catch (error) {
    console.error('Error in POST /api/sec/profile/update', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
