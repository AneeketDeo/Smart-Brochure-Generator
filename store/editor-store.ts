import { create } from 'zustand'
import { BrochureContent } from '@/lib/ai/generateBrochure'

export interface EditorState {
  content: BrochureContent | null
  template: string
  brandColor: string
  logoUrl: string | null
  images: string[]
  contactDetails: {
    phone?: string
    whatsapp?: string
    email?: string
    website?: string
  }
  setContent: (content: BrochureContent) => void
  setTemplate: (template: string) => void
  setBrandColor: (color: string) => void
  setLogoUrl: (url: string | null) => void
  setImages: (images: string[]) => void
  addImage: (url: string) => void
  setContactDetails: (details: EditorState['contactDetails']) => void
  updateContent: (updates: Partial<BrochureContent>) => void
  reset: () => void
}

const initialState = {
  content: null,
  template: 'basic',
  brandColor: '#3b82f6',
  logoUrl: null,
  images: [],
  contactDetails: {},
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  setContent: (content) => set({ content }),
  setTemplate: (template) => set({ template }),
  setBrandColor: (brandColor) => set({ brandColor }),
  setLogoUrl: (logoUrl) => set({ logoUrl }),
  setImages: (images) => set({ images }),
  addImage: (url) => set((state) => ({ images: [...state.images, url] })),
  setContactDetails: (contactDetails) => set({ contactDetails }),
  updateContent: (updates) =>
    set((state) => ({
      content: state.content ? { ...state.content, ...updates } : null,
    })),
  reset: () => set(initialState),
}))

