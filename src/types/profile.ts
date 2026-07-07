import type { Level } from './subject';

export interface Profile {
  id: string;
  name: string; // non vide
  avatar?: string;
  level: Level;
  parentCode?: string;
  isActive: boolean;
  createdAt: string; // IsoDateString
  updatedAt: string; // IsoDateString
}

export interface ProfileFormData {
  name: string;
  avatar?: string;
  level: Level;
  parentCode?: string;
}
