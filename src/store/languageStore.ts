import { create } from 'zustand';

interface LanguageState {
  language: 'el' | 'en';
  setLanguage: (language: 'el' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'el',
  setLanguage: (language) => set({ language }),
})); 