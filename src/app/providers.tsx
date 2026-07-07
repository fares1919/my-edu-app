import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAppStore } from '../stores/app.store';
import { useUiStore } from '../stores/ui.store';
import { getDb } from '../services/db/db';
import { seedSubjectsIfEmpty } from '../services/db/repositories/subjects.repo';
import { useProfilesStore } from '../stores/profiles.store';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const setReady = useAppStore((s) => s.setReady);
  const setInitState = useAppStore((s) => s.setInitState);
  const loadActiveProfile = useProfilesStore((s) => s.loadActiveProfile);
  const loadProfiles = useProfilesStore((s) => s.loadProfiles);
  const { theme, fontSize, animationsEnabled } = useUiStore();

  useEffect(() => {
    async function initApp() {
      setInitState('loading');
      try {
        // Initialiser la base de données
        await getDb();
        // Pré-remplir les matières si vide
        await seedSubjectsIfEmpty();
        // Charger le profil actif
        await loadActiveProfile();
        await loadProfiles();
        
        setInitState('success');
        setReady(true);
      } catch (err) {
        console.error('App initialization failed:', err);
        setInitState('error');
        setReady(true); // Even on error, allow app usage
      }
    }

    // Listen for online/offline events
    const handleOnline = () => useAppStore.getState().setOffline(false);
    const handleOffline = () => useAppStore.getState().setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    initApp();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Appliquer les préférences
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-animations', animationsEnabled ? 'enabled' : 'disabled');
  }, [animationsEnabled]);

  return <>{children}</>;
}
