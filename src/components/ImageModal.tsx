'use client';

import { memo } from 'react';

interface ImageModalProps {
  modalImage: string | null;
  modalImageLoading: boolean;
  onClose: () => void;
  onImageLoad: () => void;
}

// Separate modal component to isolate re-renders
export const ImageModal = memo(function ImageModal({ 
  modalImage, 
  modalImageLoading, 
  onClose, 
  onImageLoad 
}: ImageModalProps) {
  if (!modalImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-jet/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-jet/80 text-papery-white p-2 rounded-full hover:bg-jet transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Loading spinner */}
        {modalImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-energy"></div>
          </div>
        )}
        
        {/* Modal image */}
        <img
          src={modalImage}
          alt="Full size thumbnail"
          className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${modalImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
          onClick={(e) => e.stopPropagation()}
          onLoad={onImageLoad}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const fileId = modalImage.split('id=')[1] || modalImage.split('/d/')[1]?.split('/')[0];
            
            // Only try fallback once per image
            if (!img.dataset.retried && fileId) {
              img.dataset.retried = 'true';
              if (img.src.includes('uc?export=view')) {
                console.log('Modal: Trying thumbnail format');
                img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h600-c`;
              } else if (img.src.includes('thumbnail')) {
                console.log('Modal: Trying direct format');
                img.src = `https://drive.google.com/uc?id=${fileId}`;
              } else {
                console.error('Modal: All formats failed');
                onImageLoad();
              }
            } else {
              onImageLoad();
            }
          }}
        />
      </div>
    </div>
  );
}); 