'use client';

import { useState } from 'react';
import { FormMode, ViewState, PageState, FormData } from '@/types';
import { ModalProvider } from '@/components/ModalProvider';
import { GalleryPage } from '@/components/GalleryPage';
import { SuccessState } from '@/components/SuccessState';
import { ThumbnailForm } from '@/components/ThumbnailForm';

function HomeContent() {
  const [pageState, setPageState] = useState<PageState>('generator');
  const [activeTab, setActiveTab] = useState<FormMode>('concept-generation');
  const [viewState, setViewState] = useState<ViewState>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    videoTitle: '',
    transcript: '',
    conceptDescription: '',
  });

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
            <GalleryPage onBackToGenerator={handleBackToGenerator} />
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
      <HomeContent />
    </ModalProvider>
  );
}
