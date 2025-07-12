'use client';

import { useState, useEffect, useCallback, memo, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

type FormMode = 'concept-generation' | 'specific-concept';
type ViewState = 'form' | 'success';
type PageState = 'generator' | 'gallery';

export interface DriveFolder {
  id: string;
  name: string;
  lastModified: string;
  images: string[];
}

// Modal context for isolated state management
const ModalContext = createContext<{
  modalImage: string | null;
  modalImageLoading: boolean;
  showModal: (imageUrl: string) => void;
  hideModal: () => void;
} | null>(null);

// Modal provider component
const ModalProvider = ({ children }: { children: React.ReactNode }) => {
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
const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Memoized image component to prevent re-renders
const GalleryImage = memo(({
  imageUrl,
  index,
  folderId
}: {
  imageUrl: string;
  index: number;
  folderId: string;
}) => {
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
        onLoad={(e) => {
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

// Separate modal component to isolate re-renders
const ImageModal = memo(({
  modalImage,
  modalImageLoading,
  onClose,
  onImageLoad
}: {
  modalImage: string | null;
  modalImageLoading: boolean;
  onClose: () => void;
  onImageLoad: () => void;
}) => {
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

function HomeContent() {
  const [pageState, setPageState] = useState<PageState>('generator');
  const [activeTab, setActiveTab] = useState<FormMode>('concept-generation');
  const [viewState, setViewState] = useState<ViewState>('form');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    videoTitle: '',
    transcript: '',
    conceptDescription: '',
  });

  // Get current folder
  const currentFolder = folders.find(f => f.id === selectedFolder);

  // Load folders when gallery page is accessed
  useEffect(() => {
    if (pageState === 'gallery' && folders.length === 0) {
      loadFolders();
    }
  }, [pageState]);



  const loadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await fetch('/api/folders');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const drivefolders: DriveFolder[] = await response.json();
      setFolders(drivefolders);

      // Set default folder to the first (most recent) one
      if (drivefolders.length > 0 && !selectedFolder) {
        setSelectedFolder(drivefolders[0].id);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare data based on active tab
    const submitData =
      activeTab === 'concept-generation'
        ? { videoTitle: formData.videoTitle, transcript: formData.transcript }
        : formData;

    try {
      // Send to n8n backend
      const response = await fetch('https://danandbob.app.n8n.cloud/webhook-test/00a0656f-95f7-424c-ba92-fa0a8ff412b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      console.log('Successfully submitted:', submitData);
      
      // Show success state
      setViewState('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Set specific error message based on error type
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setSubmitError('Unable to connect to the thumbnail generation service. Please check that the n8n workflow is active and try again.');
      } else if (error instanceof Error) {
        setSubmitError(`Error: ${error.message}. Please try again or contact support if the issue persists.`);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateMore = () => {
    setViewState('form');
    setSubmitError(null);
    setFormData({
      videoTitle: '',
      transcript: '',
      conceptDescription: '',
    });
  };

  const handleViewGallery = () => {
    setPageState('gallery');
  };

  const handleBackToGenerator = () => {
    setPageState('generator');
    setViewState('form');
  };

  const SuccessState = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-orange-energy rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-papery-white font-main">
          Thumbnails Generated!
        </h2>
        <p className="text-lg text-papery-white/80 font-sketch">
          You will receive an email once your thumbnails are ready.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGenerateMore}
          className="w-full bg-orange-energy text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-energy/90 transition-colors shadow-lg hover:shadow-xl"
        >
          Generate More Thumbnails
        </button>
        <button
          onClick={handleViewGallery}
          className="w-full bg-papery-white text-jet py-4 px-6 rounded-lg font-semibold text-lg hover:bg-papery-white/90 transition-colors shadow-lg hover:shadow-xl"
        >
          View Gallery
        </button>
      </div>
    </div>
  );

  const GalleryPage = () => (
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
          onClick={handleBackToGenerator}
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
      {!isLoadingFolders && folders.length > 0 && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-papery-white">
              Select Project Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
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
                      index={index}
                      folderId={currentFolder.id}
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

      {/* Empty State */}
      {!isLoadingFolders && folders.length === 0 && (
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

  return (
    <div className="min-h-screen bg-jet">
      {/* Header */}
      <div className="text-center py-8">
        <p className="text-2xl text-orange-energy mb-2 font-sketch">
          Morningside AI
        </p>
        <h1 className="text-4xl font-bold text-papery-white font-main">
          AI Thumbnail Generator
        </h1>
      </div>

      {/* Main Container - 75% width, centered */}
      <div className="flex justify-center px-4">
        <div className={`w-full ${pageState === 'gallery' ? 'max-w-6xl' : 'max-w-4xl'} bg-papery-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-papery-white/20 p-8`}>
          {pageState === 'gallery' ? (
            <GalleryPage />
          ) : (
            <>
              {viewState === 'success' ? (
                <SuccessState />
              ) : (
                <>
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-papery-white/10 rounded-lg p-1 mb-8">
                    <button
                      className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === 'concept-generation'
                          ? 'bg-orange-energy text-white shadow-md'
                          : 'text-papery-white hover:bg-papery-white/10'
                        }`}
                      onClick={() => setActiveTab('concept-generation')}
                    >
                      Concept Generation Mode
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === 'specific-concept'
                          ? 'bg-orange-energy text-white shadow-md'
                          : 'text-papery-white hover:bg-papery-white/10'
                        }`}
                      onClick={() => setActiveTab('specific-concept')}
                    >
                      Concept Execution Mode
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Title Input */}
                    <div>
                      <label
                        htmlFor="videoTitle"
                        className="block text-sm font-semibold text-papery-white mb-2"
                      >
                        Video Title *
                      </label>
                      <input
                        type="text"
                        id="videoTitle"
                        required
                        autoComplete="off"
                        value={formData.videoTitle}
                        onChange={e =>
                          handleInputChange('videoTitle', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-papery-white/30 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-papery-white/10 text-papery-white placeholder-papery-white/60"
                        placeholder="Enter your video title..."
                      />
                    </div>

                    {/* Video Transcript */}
                    <div>
                      <label
                        htmlFor="transcript"
                        className="block text-sm font-semibold text-papery-white mb-2"
                      >
                        Video Transcript *
                      </label>
                      <textarea
                        id="transcript"
                        required
                        rows={6}
                        value={formData.transcript}
                        onChange={e =>
                          handleInputChange('transcript', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-papery-white/30 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-papery-white/10 text-papery-white placeholder-papery-white/60 resize-vertical"
                        placeholder="Paste your video transcript here..."
                      />
                    </div>

                    {/* Specific Concept Description - Only show in specific concept mode */}
                    {activeTab === 'specific-concept' && (
                      <div>
                        <label
                          htmlFor="conceptDescription"
                          className="block text-sm font-semibold text-papery-white mb-2"
                        >
                          Specific Concept Description *
                        </label>
                        <textarea
                          id="conceptDescription"
                          required
                          rows={4}
                          value={formData.conceptDescription}
                          onChange={e =>
                            handleInputChange('conceptDescription', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-papery-white/30 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-papery-white/10 text-papery-white placeholder-papery-white/60 resize-vertical"
                          placeholder="Describe the specific concept you want for your thumbnail..."
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {submitError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">Submission Failed</p>
                            <p className="text-sm mt-1">{submitError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-energy text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-energy/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Thumbnails'
                        )}
                      </button>

                      {/* Gallery Navigation Button */}
                      <button
                        type="button"
                        onClick={handleViewGallery}
                        className="w-full bg-papery-white/10 text-papery-white border border-papery-white/30 py-3 px-6 rounded-lg font-medium hover:bg-papery-white/20 transition-colors"
                      >
                        View Existing Thumbnails
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}

export default function Home() {
  return (
    <ModalProvider>
      <HomeContent />
    </ModalProvider>
  );
}
