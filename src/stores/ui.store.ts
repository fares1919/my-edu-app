import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'normal' | 'large' | 'dyslexic';
  animationsEnabled: boolean;
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  setFontSize: (size: 'normal' | 'large' | 'dyslexic') => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  fontSize: 'normal',
  animationsEnabled: true,
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
