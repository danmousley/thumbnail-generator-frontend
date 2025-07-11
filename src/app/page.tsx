'use client';

import { useState } from 'react';

type FormMode = 'concept-generation' | 'specific-concept';

export default function Home() {
  const [activeTab, setActiveTab] = useState<FormMode>('concept-generation');
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

    // Show success message (will implement in next phase)
    alert(
      'Thanks! You will receive an email once the thumbnails are generated.'
    );
  };

  return (
    <div className="min-h-screen bg-papery-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-jet font-main">
          AI Thumbnail Generator
        </h1>
        <p className="text-lg text-muted-green mt-2 font-sketch">
          Create stunning thumbnails with AI
        </p>
      </div>

      {/* Main Form Container - 75% width, centered */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-jet/10 p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
            <button
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'concept-generation'
                  ? 'bg-orange-energy text-white shadow-md'
                  : 'text-jet hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('concept-generation')}
            >
              Concept Generation Mode
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'specific-concept'
                  ? 'bg-orange-energy text-white shadow-md'
                  : 'text-jet hover:bg-gray-200'
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
                className="block text-sm font-semibold text-jet mb-2"
              >
                Video Title *
              </label>
              <input
                type="text"
                id="videoTitle"
                required
                value={formData.videoTitle}
                onChange={e => handleInputChange('videoTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-white"
                placeholder="Enter your video title..."
              />
            </div>

            {/* Video Transcript */}
            <div>
              <label
                htmlFor="transcript"
                className="block text-sm font-semibold text-jet mb-2"
              >
                Video Transcript *
              </label>
              <textarea
                id="transcript"
                required
                rows={6}
                value={formData.transcript}
                onChange={e => handleInputChange('transcript', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-white resize-vertical"
                placeholder="Paste your video transcript here..."
              />
            </div>

            {/* Specific Concept Description - Only show in specific concept mode */}
            {activeTab === 'specific-concept' && (
              <div>
                <label
                  htmlFor="conceptDescription"
                  className="block text-sm font-semibold text-jet mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-energy focus:border-orange-energy outline-none transition-colors bg-white resize-vertical"
                  placeholder="Describe the specific concept you want for your thumbnail..."
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-jet text-papery-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-jet/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Generate Thumbnails
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}
