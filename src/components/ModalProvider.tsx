'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ModalContextType } from '@/types';
import { ImageModal } from './ImageModal';

// Modal context for isolated state management
const ModalContext = createContext<ModalContextType | null>(null);

// Modal provider component
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImageLoading, setModalImageLoading] = useState(false);

  const showModal = useCallback((imageUrl: string) => {
    setModalImage(imageUrl);
    setModalImageLoading(true);
  }, []);

  const hideModal = useCallback(() => {
    setModalImage(null);
    setModalImageLoading(false);
  }, []);

  const handleModalImageLoad = useCallback(() => {
    setModalImageLoading(false);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalImage) {
        hideModal();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalImage, hideModal]);

  return (
    <ModalContext.Provider value={{ modalImage, modalImageLoading, showModal, hideModal }}>
      {children}
      {/* Render modal in portal */}
      {typeof window !== 'undefined' && modalImage && createPortal(
        <ImageModal
          modalImage={modalImage}
          modalImageLoading={modalImageLoading}
          onClose={hideModal}
          onImageLoad={handleModalImageLoad}
        />,
        document.body
      )}
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 