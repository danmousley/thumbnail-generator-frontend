'use client';

import { FormMode, FormData } from '@/types';

interface ThumbnailFormProps {
  activeTab: FormMode;
  setActiveTab: (tab: FormMode) => void;
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onViewGallery: (folderId?: string) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const ThumbnailForm = ({
  activeTab,
  setActiveTab,
  formData,
  onInputChange,
  onSubmit,
  onViewGallery,
  isSubmitting,
  submitError
}: ThumbnailFormProps) => {
  return (
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
      <form onSubmit={onSubmit} className="space-y-6">
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
              onInputChange('videoTitle', e.target.value)
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
              onInputChange('transcript', e.target.value)
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
                onInputChange('conceptDescription', e.target.value)
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
            onClick={() => onViewGallery()}
            className="w-full bg-papery-white/10 text-papery-white border border-papery-white/30 py-3 px-6 rounded-lg font-medium hover:bg-papery-white/20 transition-colors"
          >
            View Existing Thumbnails
          </button>
        </div>
      </form>
    </>
  );
}; 