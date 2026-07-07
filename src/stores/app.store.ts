import { create } from 'zustand';
import type { LoadState } from '../types/common';

interface AppState {
  isReady: boolean;
  initState: LoadState;
  isOffline: boolean;
  setReady: (ready: boolean) => void;
  setInitState: (state: LoadState) => void;
  setOffline: (offline: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  initState: 'idle',
  isOffline: !navigator.onLine,
  setReady: (ready) => set({ isReady: ready }),
  setInitState: (initState) => set({ initState }),
  setOffline: (offline) => set({ isOffline: offline }),
}));
