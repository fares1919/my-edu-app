import { create } from 'zustand';
import type { Profile, ProfileFormData } from '../types/profile';
import { profileRepo, getActiveProfile, setActiveProfile } from '../services/db/repositories/profiles.repo';
import { generateId } from '../utils/ids';
import { nowISO } from '../utils/dates';
import { syncProfileToCloud } from '../services/supabase/sync';

interface ProfilesState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  loadProfiles: () => Promise<void>;
  loadActiveProfile: () => Promise<void>;
  createProfile: (data: ProfileFormData) => Promise<Profile>;
  updateProfile: (id: string, data: Partial<ProfileFormData>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
}

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,

  loadProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await profileRepo.getAll();
      set({ profiles, isLoading: false });
    } catch (err) {
      console.error('Failed to load profiles:', err);
      set({ isLoading: false });
    }
  },

  loadActiveProfile: async () => {
    try {
      const profile = await getActiveProfile();
      set({ activeProfile: profile || null });
    } catch (err) {
      console.error('Failed to load active profile:', err);
    }
  },

  createProfile: async (data: ProfileFormData) => {
    const now = nowISO();
    const profile: Profile = {
      id: generateId(),
      name: data.name.trim(),
      avatar: data.avatar,
      level: data.level,
      parentCode: data.parentCode,
      isActive: get().profiles.length === 0, // premier profil = actif
      createdAt: now,
      updatedAt: now,
    };
    await profileRepo.create(profile);
    await get().loadProfiles();
    if (profile.isActive) {
      set({ activeProfile: profile });
    }
    // Sync to cloud
    syncProfileToCloud(profile);
    return profile;
  },

  updateProfile: async (id: string, data: Partial<ProfileFormData>) => {
    const existing = await profileRepo.getById(id);
    if (!existing) throw new Error('Profile not found');
    const updated: Profile = {
      ...existing,
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      ...(data.level ? { level: data.level } : {}),
      ...(data.parentCode !== undefined ? { parentCode: data.parentCode } : {}),
      updatedAt: nowISO(),
    };
    await profileRepo.update(updated);
    await get().loadProfiles();
    if (get().activeProfile?.id === id) {
      set({ activeProfile: updated });
    }
  },

  deleteProfile: async (id: string) => {
    await profileRepo.remove(id);
    if (get().activeProfile?.id === id) {
      set({ activeProfile: null });
    }
    await get().loadProfiles();
  },

  selectProfile: async (id: string) => {
    await setActiveProfile(id);
    await get().loadActiveProfile();
    await get().loadProfiles();
  },
}));
