'use client';

import { useState, useRef, memo } from 'react';
import { useModal } from './ModalProvider';

interface GalleryImageProps {
  imageUrl: string;
  index: number;
}

// Memoized image component to prevent re-renders
export const GalleryImage = memo(function GalleryImage({ 
  imageUrl, 
  index
}: GalleryImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { showModal } = useModal();

  return (
    <div
      className="group relative bg-papery-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
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
        className="w-full h-48 object-cover relative z-10 transition-opacity duration-300"
        loading="eager"
        onLoad={() => {
          console.log(`Image ${index + 1} loaded successfully`);
          setImageLoaded(true);
        }}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          const fileId = imageUrl.split('id=')[1] || imageUrl.split('/d/')[1]?.split('/')[0];
          
          // Only try fallback once per image
          if (!img.dataset.retried && fileId) {
            img.dataset.retried = 'true';
            if (img.src.includes('uc?export=view')) {
              console.log(`Trying thumbnail format for image ${index + 1}`);
              img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300-c`;
            } else if (img.src.includes('thumbnail')) {
              console.log(`Trying direct format for image ${index + 1}`);
              img.src = `https://drive.google.com/uc?id=${fileId}`;
            } else {
              console.error(`All formats failed for image ${index + 1}`);
              setImageError(true);
            }
          } else {
            setImageError(true);
          }
        }}
      />
      
      {/* Hover overlay - subtle darkening effect */}
      <div className="absolute inset-0 bg-jet/0 group-hover:bg-jet/10 transition-colors duration-300 z-15 pointer-events-none"></div>
    </div>
  );
}); 