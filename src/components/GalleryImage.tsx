'use client';

import { useState, useRef, memo } from 'react';

import { useModal } from './ModalProvider';

interface GalleryImageProps {
  imageUrl: string;
}

// Memoized image component to prevent re-renders
export const GalleryImage = memo(function GalleryImage({ 
  imageUrl
}: GalleryImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { showModal } = useModal();

  return (
    <div
      className="group relative bg-papery-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer aspect-[3/2]"
      onClick={() => showModal(imageUrl)}
    >
      {/* Loading spinner - shows before image loads */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-papery-white/5 z-5">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-energy"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover relative z-10 transition-opacity duration-300"
        loading="eager"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          const fileId = imageUrl.split('id=')[1] || imageUrl.split('/d/')[1]?.split('/')[0];
          
          // Only try fallback once per image
          if (!img.dataset.retried && fileId) {
            img.dataset.retried = 'true';
            if (img.src.includes('uc?export=view')) {
              img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300-c`;
            } else if (img.src.includes('thumbnail')) {
              img.src = `https://drive.google.com/uc?id=${fileId}`;
            } else {
              setImageError(true);
            }
          } else {
            setImageError(true);
          }
        }}
      />
      
      {/* Error state - shows when image fails to load */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-papery-white/5 z-10">
          <div className="text-papery-white/60 text-sm mb-2">Failed to load</div>
          <div className="w-12 h-12 border-2 border-papery-white/30 rounded flex items-center justify-center">
            <span className="text-papery-white/50 text-xs">IMG</span>
          </div>
        </div>
      )}
      
      {/* Hover overlay - subtle darkening effect */}
      <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/10 transition-colors duration-300 z-15 pointer-events-none"></div>
    </div>
  );
}); 