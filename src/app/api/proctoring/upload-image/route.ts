import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const { image, phoneNumber } = await req.json();

        if (!image) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'sec_test_starts',
            public_id: `start_test_${phoneNumber}_${Date.now()}`,
        });

        console.log(`Cloudinary Upload Success: ${uploadResponse.secure_url}`);
        return NextResponse.json({ success: true, url: uploadResponse.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
