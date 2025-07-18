import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export interface DriveFolder {
  id: string;
  name: string;
  lastModified: string;
  images: string[];
}

// Mock data for development - replace with actual Google Drive API
const getMockData = (): DriveFolder[] => {
  return [
    {
      id: '1',
      name: 'My Amazing Video Thumbnails',
      lastModified: '2024-01-15T10:30:00Z',
      images: [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3',
        'https://picsum.photos/400/300?random=4',
      ],
    },
    {
      id: '2',
      name: 'Tutorial Series Batch 1',
      lastModified: '2024-01-10T14:20:00Z',
      images: [
        'https://picsum.photos/400/300?random=5',
        'https://picsum.photos/400/300?random=6',
        'https://picsum.photos/400/300?random=7',
      ],
    },
    {
      id: '3',
      name: 'Product Launch Campaign',
      lastModified: '2024-01-05T09:15:00Z',
      images: [
        'https://picsum.photos/400/300?random=8',
        'https://picsum.photos/400/300?random=9',
      ],
    },
  ];
};

async function initializeGoogleDrive() {
  try {
    // Check if we have the required environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;



    if (!serviceAccountEmail || !serviceAccountPrivateKey || !projectId) {
      console.log('Google Drive credentials not configured, using mock data');
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

async function getImagesFromFolder(drive: ReturnType<typeof google.drive>, folderId: string): Promise<string[]> {
  try {
    const imagesResponse = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/' or name contains '.jpg' or name contains '.jpeg' or name contains '.png' or name contains '.gif' or name contains '.webp' or name contains '.bmp' or name contains '.svg') and trashed=false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name',
      pageSize: 100,
    });

    const images = imagesResponse.data.files || [];
    
    // Use the API route instead of direct Google Drive URLs for proper authentication
    return images.map((image) => `/api/image/${image.id}`);
  } catch (error) {
    console.error('Error fetching images from folder:', error);
    return [];
  }
}

export async function GET() {
  try {
    const drive = await initializeGoogleDrive();
    
    if (!drive) {
      // Return mock data if Google Drive is not configured
      return NextResponse.json(getMockData());
    }

    const parentFolderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PARENT_FOLDER_ID;
    
    if (!parentFolderId) {
      console.log('Parent folder ID not configured, using mock data');
      return NextResponse.json(getMockData());
    }

    // Get all folders in the parent directory
    const foldersResponse = await drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    const folders = foldersResponse.data.files || [];
    const drivefolders: DriveFolder[] = [];

    // For each folder, get its images
    for (const folder of folders) {
      const images = await getImagesFromFolder(drive, folder.id || '');
      drivefolders.push({
        id: folder.id || '',
        name: folder.name || 'Untitled',
        lastModified: folder.modifiedTime || new Date().toISOString(),
        images,
      });
    }

    // Sort by last modified (newest first)
    const sortedFolders = drivefolders.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    return NextResponse.json(sortedFolders);
  } catch (error) {
    console.error('Error in folders API:', error);
    return NextResponse.json(getMockData());
  }
} 