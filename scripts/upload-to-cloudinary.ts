import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(filePath: string, folder: string = 'pitchsultan') {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    
    console.log(`Uploading ${filePath}...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: fileName,
      overwrite: true,
    });

    console.log('\n✓ Upload successful!');
    console.log(`URL: ${result.secure_url}`);
    console.log(`Public ID: ${result.public_id}`);
    
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
const folder = process.argv[3] || 'pitchsultan';

if (!filePath) {
  console.error('Usage: npx ts-node scripts/upload-to-cloudinary.ts <file-path> [folder]');
  console.error('Example: npx ts-node scripts/upload-to-cloudinary.ts ~/Downloads/WhatsApp\ Image\ 2026-02-09\ at\ 17.07.28.jpeg');
  process.exit(1);
}

uploadImage(filePath, folder);
