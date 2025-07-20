'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { GalleryPage } from '@/components/GalleryPage';
import { ModalProvider } from '@/components/ModalProvider';
import { SuccessState } from '@/components/SuccessState';
import { ThumbnailForm } from '@/components/ThumbnailForm';
import { FormMode, ViewState, PageState, FormData } from '@/types';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cookie management functions
  const getEmailFromCookie = (): string => {
    if (typeof document === 'undefined') return '';
    const cookies = document.cookie.split(';');
    const emailCookie = cookies.find(cookie => cookie.trim().startsWith('userEmail='));
    return emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : '';
  };

  const saveEmailToCookie = (email: string): void => {
    if (typeof document === 'undefined') return;
    // Set cookie to expire in 1 year
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `userEmail=${encodeURIComponent(email)}; expires=${expires}; path=/; SameSite=Lax`;
  };
  
  const [pageState, setPageState] = useState<PageState>('generator');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [activeTab, setActiveTab] = useState<FormMode>('concept-generation');
  const [viewState, setViewState] = useState<ViewState>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    videoTitle: '',
    transcript: '',
    conceptDescription: '',
    email: '',
  });

  // Initialize state from URL parameters
  useEffect(() => {
    const page = searchParams.get('page');
    const folder = searchParams.get('folder');
    
    if (page === 'gallery') {
      setPageState('gallery');
      if (folder) {
        setSelectedFolder(folder);
      }
    } else {
      setPageState('generator');
    }
  }, [searchParams]);

  // Load email from cookie on component mount
  useEffect(() => {
    const savedEmail = getEmailFromCookie();
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }));
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // The useEffect above will handle the state update when searchParams change
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

    // Prepare data based on active tab (always include email)
    const submitData =
      activeTab === 'concept-generation'
        ? { videoTitle: formData.videoTitle, transcript: formData.transcript, email: formData.email }
        : formData;

    try {
      // Send to n8n backend
      const response = await fetch('https://danandbob.app.n8n.cloud/webhook-test/00a0656f-95f7-424c-ba92-fa0a8ff412b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_API_TOKEN}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      console.log('Successfully submitted:', submitData);
      
      // Save email to cookie for future use
      saveEmailToCookie(formData.email);
      
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
      email: getEmailFromCookie(), // Preserve email from cookie
    });
  };

  const handleViewGallery = (folderId?: string) => {
    const params = new URLSearchParams();
    params.set('page', 'gallery');
    if (folderId) {
      params.set('folder', folderId);
      setSelectedFolder(folderId);
    }
    router.push(`/?${params.toString()}`);
    setPageState('gallery');
  };

  const handleBackToGenerator = () => {
    router.push('/');
    setPageState('generator');
    setViewState('form');
    setSelectedFolder('');
  };

  const handleFolderChange = (folderId: string) => {
    const params = new URLSearchParams();
    params.set('page', 'gallery');
    if (folderId) {
      params.set('folder', folderId);
    }
    router.push(`/?${params.toString()}`);
    setSelectedFolder(folderId);
  };

  return (
    <div className="min-h-screen bg-jet">
      {/* Header */}
      <div className="text-center py-8">
        <p className="text-2xl text-orange-energy mb-2 italic font-sketch">
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
            <GalleryPage 
              onBackToGenerator={handleBackToGenerator}
              selectedFolder={selectedFolder}
              onFolderChange={handleFolderChange}
            />
          ) : (
            <>
              {viewState === 'success' ? (
                <SuccessState
                  onGenerateMore={handleGenerateMore}
                  onViewGallery={handleViewGallery}
                />
              ) : (
                <ThumbnailForm
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onViewGallery={handleViewGallery}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
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
      <Suspense fallback={<div className="min-h-screen bg-jet flex items-center justify-center">
        <div className="text-papery-white">Loading...</div>
      </div>}>
        <HomeContent />
      </Suspense>
    </ModalProvider>
  );
}
