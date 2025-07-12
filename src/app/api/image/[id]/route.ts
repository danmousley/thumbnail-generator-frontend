import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

async function initializeGoogleDrive() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;

    if (!serviceAccountEmail || !serviceAccountPrivateKey || !projectId) {
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      credentials: {
        type: 'service_account',
        project_id: projectId,
        client_email: serviceAccountEmail,
        private_key: serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      },
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const drive = await initializeGoogleDrive();
    
    if (!drive) {
      return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 });
    }

    const fileId = params.id;
    
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
    
    return new NextResponse(response.data, {
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