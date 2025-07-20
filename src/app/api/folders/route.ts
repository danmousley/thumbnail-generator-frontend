import { google } from 'googleapis';
import { NextResponse } from 'next/server';

import { initializeGoogleDrive } from '@/lib/googleAuth';

export interface DriveFolder {
  id: string;
  name: string;
  lastModified: string;
  images: string[];
}





async function getImagesFromFolder(drive: ReturnType<typeof google.drive>, folderId: string): Promise<string[]> {
  try {
    const imagesResponse = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/' or name contains '.jpg' or name contains '.jpeg' or name contains '.png' or name contains '.gif' or name contains '.webp' or name contains '.bmp' or name contains '.svg') and mimeType != 'application/vnd.google-apps.folder' and trashed=false`,
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
      // Return error response if Google Drive is not configured
      return NextResponse.json(
        { error: 'Google Drive authentication failed. Please check your credentials.' },
        { status: 500 }
      );
    }

    const parentFolderId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_PARENT_FOLDER_ID;
    
    if (!parentFolderId) {
      console.log('Parent folder ID not configured');
      return NextResponse.json(
        { error: 'Google Drive parent folder not configured.' },
        { status: 500 }
      );
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
    return NextResponse.json(
      { error: 'Failed to fetch folders from Google Drive.' },
      { status: 500 }
    );
  }
} 