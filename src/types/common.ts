// Types utilitaires communs

export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export type IsoDateString = string; // ISO 8601
