export type FormMode = 'concept-generation' | 'specific-concept';
export type ViewState = 'form' | 'success';
export type PageState = 'generator' | 'gallery';

export interface DriveFolder {
  id: string;
  name: string;
  lastModified: string;
  images: string[];
}

export interface FormData {
  videoTitle: string;
  transcript: string;
  conceptDescription: string;
}

export interface ModalContextType {
  modalImage: string | null;
  modalImageLoading: boolean;
  showModal: (imageUrl: string) => void;
  hideModal: () => void;
} 