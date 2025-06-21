// src/lib/localStorage.ts
const APP_PREFIX = 'admissionPortal_';

export interface LoginCredentials {
  username?: string;
  role?: 'applicant' | 'admin' | 'verifikator';
  rememberMe?: boolean;
}

export type SchoolSelection = {
  schoolId: string;
  major: string | null;
};

export interface RegistrationProgress {
  schoolSelections?: SchoolSelection[];
  pathway?: string;
  documentMetadata?: { [docId: string]: { name: string; size: number; type: string } | null };
  hasProfilePhoto?: boolean;
  profilePhotoDataUri?: string;
  registrationCompleted?: boolean;
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(APP_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(APP_PREFIX + key, item);
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(APP_PREFIX + key);
  } catch (error) {
    console.warn(`Error removing localStorage key “${key}”:`, error);
  }
}
