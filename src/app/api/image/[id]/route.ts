import { NextRequest, NextResponse } from 'next/server';

import { initializeGoogleDrive } from '@/lib/googleAuth';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const drive = await initializeGoogleDrive();
    
    if (!drive) {
      return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
    }

    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    
    // Get the file content
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    // Get file metadata to determine content type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    const contentType = metadata.data.mimeType || 'image/jpeg';
    
    return new NextResponse(response.data as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
} 