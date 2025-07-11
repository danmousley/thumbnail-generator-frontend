'use client';

import { useState } from 'react';

type FormMode = 'concept-generation' | 'specific-concept';
type ViewState = 'form' | 'success';

export default function Home() {
  const [activeTab, setActiveTab] = useState<FormMode>('concept-generation');
  const [viewState, setViewState] = useState<ViewState>('form');
  const [formData, setFormData] = useState({
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

    // Prepare data based on active tab
    const submitData =
      activeTab === 'concept-generation'
        ? { videoTitle: formData.videoTitle, transcript: formData.transcript }
        : formData;

    // TODO: Send to n8n backend
    console.log('Submitting:', submitData);

    // Show success state instead of alert
    setViewState('success');
  };

  const handleGenerateMore = () => {
    setViewState('form');
    setFormData({
      videoTitle: '',
      transcript: '',
      conceptDescription: '',
    });
  };

  const handleViewGallery = () => {
    // TODO: Navigate to gallery page
    console.log('Navigate to gallery');
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
        <div className="w-full max-w-4xl bg-papery-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-papery-white/20 p-8">
          {viewState === 'success' ? (
            <SuccessState />
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-papery-white/10 rounded-lg p-1 mb-8">
                <button
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'concept-generation'
                      ? 'bg-orange-energy text-white shadow-md'
                      : 'text-papery-white hover:bg-papery-white/10'
                  }`}
                  onClick={() => setActiveTab('concept-generation')}
                >
                  Concept Generation Mode
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'specific-concept'
                      ? 'bg-orange-energy text-white shadow-md'
                      : 'text-papery-white hover:bg-papery-white/10'
                  }`}
                  onClick={() => setActiveTab('specific-concept')}
                >
                  Specific Concept Mode
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

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-orange-energy text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-energy/90 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Generate Thumbnails
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}
