'use client';

interface SuccessStateProps {
  onGenerateMore: () => void;
  onViewGallery: (folderId?: string) => void;
}

export const SuccessState = ({ onGenerateMore, onViewGallery }: SuccessStateProps) => {
  return (
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
          onClick={onGenerateMore}
          className="w-full bg-orange-energy text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-energy/90 transition-colors shadow-lg hover:shadow-xl"
        >
          Generate More Thumbnails
        </button>
        <button
          onClick={() => onViewGallery()}
          className="w-full bg-papery-white text-jet py-4 px-6 rounded-lg font-semibold text-lg hover:bg-papery-white/90 transition-colors shadow-lg hover:shadow-xl"
        >
          View Gallery
        </button>
      </div>
    </div>
  );
}; 