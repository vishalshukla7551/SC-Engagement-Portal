import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/sec/incentive-form/upload-selfie
 * Upload selfie with Samsung ProtectMax POSM to Cloudinary
 * Only accessible by SEC users at Reliance Digital stores
 */
export async function POST(req: NextRequest) {
    try {
        const cookies = await (await import('next/headers')).cookies();
        const authUser = await getAuthenticatedUserFromCookies(cookies as any);

        if (!authUser || authUser.role !== 'SEC') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image || !image.startsWith('data:image')) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
        }

        const phone = authUser.username;
        const publicId = `reliance_posm_selfies/selfie_${phone}_${Date.now()}`;

        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'reliance_posm_selfies',
            public_id: publicId,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
            ]
        });

        return NextResponse.json({
            success: true,
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
        });
    } catch (error) {
        console.error('Selfie upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
