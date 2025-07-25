'use client';

import { useState, useEffect, useCallback } from 'react';

import { DriveFolder } from '@/types';

import { GalleryImage } from './GalleryImage';

interface GalleryPageProps {
  onBackToGenerator: () => void;
  selectedFolder: string;
  onFolderChange: (folderId: string) => void;
}

export const GalleryPage = ({ onBackToGenerator, selectedFolder, onFolderChange }: GalleryPageProps) => {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current folder
  const currentFolder = folders.find(f => f.id === selectedFolder);

  const loadFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    setError(null);
    try {
      const response = await fetch('/api/folders');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const drivefolders: DriveFolder[] = await response.json();
      setFolders(drivefolders);
    } catch (error) {
      console.error('Error loading folders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load folders');
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // Auto-select first folder only on initial load
  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      onFolderChange(folders[0].id);
    }
  }, [folders, selectedFolder, onFolderChange]);

  // Load folders when component mounts
  useEffect(() => {
    if (folders.length === 0) {
      loadFolders();
    }
  }, [loadFolders]);

  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-papery-white font-main">
            Thumbnail Gallery
          </h2>
          <p className="text-papery-white/80 mt-2">
            Browse your generated thumbnails by project
          </p>
        </div>
        <button
          onClick={onBackToGenerator}
          className="bg-orange-energy text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-energy/90 transition-colors shadow-lg"
        >
          Back to Generator
        </button>
      </div>

      {/* Loading State */}
      {isLoadingFolders && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-energy"></div>
          <span className="ml-3 text-papery-white">Loading folders...</span>
        </div>
      )}

      {/* Folder Selector */}
      {!isLoadingFolders && !error && folders.length > 0 && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-papery-white">
              Select Project Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => onFolderChange(e.target.value)}
              className="w-full max-w-md px-4 py-3 border border-papery-white/30 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-papery-white/10 text-papery-white"
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id} className="bg-jet text-papery-white">
                  {folder.name} ({new Date(folder.lastModified).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Images Grid */}
          {currentFolder && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-papery-white">
                {currentFolder.name}
              </h3>
              
              {/* Debug info */}
              <div className="text-sm text-papery-white/60">
                Found {currentFolder.images.length} images
              </div>
              
              {currentFolder.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentFolder.images.map((imageUrl, index) => (
                    <GalleryImage
                      key={`${currentFolder.id}-${index}`}
                      imageUrl={imageUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-papery-white/60 py-12">
                  <p>No images found in this folder.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Error State */}
      {!isLoadingFolders && error && (
        <div className="text-center text-papery-white/60 py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-orange-energy/20 rounded-full flex items-center justify-center">
              <span className="text-orange-energy text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-semibold text-papery-white">Connection Error</h3>
            <p className="text-papery-white/80">{error}</p>
            <button
              onClick={loadFolders}
              className="bg-orange-energy text-white px-6 py-3 rounded-lg hover:bg-orange-energy/90 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingFolders && !error && folders.length === 0 && (
        <div className="text-center text-papery-white/60 py-12">
          <p>No folders found. Generate some thumbnails first!</p>
          <button
            onClick={loadFolders}
            className="mt-4 bg-orange-energy text-white px-6 py-2 rounded-lg hover:bg-orange-energy/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}; 