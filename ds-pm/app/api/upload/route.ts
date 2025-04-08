import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VALID_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'image' | 'document';

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing file or type parameter' },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      (type === 'image' && !VALID_IMAGE_TYPES.includes(file.type)) ||
      (type === 'document' && !VALID_DOC_TYPES.includes(file.type))
    ) {
      return NextResponse.json(
        { error: `Invalid file type for ${type} upload` },
        { status: 400 }
      );
    }

    // Validate file size
    const MAX_SIZE = type === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_SIZE/1024/1024}MB)` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `property_manager/${type}s`,
          resource_type: 'auto',
          allowed_formats: type === 'image' 
            ? ['jpg', 'jpeg', 'png', 'webp'] 
            : ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
            use_filename: true,
          unique_filename: false,
          overwrite: false,
          format: type === 'document' ? undefined : 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      originalName: file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
}