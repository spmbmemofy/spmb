// src/lib/localStorage.ts
const APP_PREFIX = 'admissionPortal_';

export interface LoginCredentials {
  nisn?: string;
  role?: 'applicant' | 'admin';
  rememberMe?: boolean;
}

export interface RegistrationProgress {
  schoolId?: string;
  pathway?: string;
  // Store metadata for "remembered" files, not the File objects themselves
  documentMetadata?: { [docId: string]: { name: string; size: number; type: string } | null };
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
