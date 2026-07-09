
import type { UserRole } from './userData';
import type { SchoolSelection, ApplicantAchievement } from './types';

const APP_PREFIX = 'admissionPortal_';

export interface LoginCredentials {
  username?: string;
  role?: UserRole;
  rememberMe?: boolean;
}

export interface SystemSettings {
  isApplicantLoginLocked?: boolean;
}

export interface BiodataDetails {
  fullName: string;
  nisn: string;
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  streetName: string;
  rtRw: string;
  village: string;
  subdistrict: string;
  district: string;
  province: string;
  previousSchool: string;
  fatherName: string;
  fatherDateOfBirth: string;
  fatherOccupation: string;
  fatherIncome: string;
  motherName: string;
  motherDateOfBirth: string;
  motherOccupation: string;
  motherIncome: string;
  guardianName: string;
  contactNumber: string;
  semesterGrades: {
    semester1: number;
    semester2: number;
    semester3: number;
    semester4: number;
    semester5: number;
  };
}

export interface RegistrationProgress {
  schoolSelections?: SchoolSelection[];
  pathway?: string;
  documentMetadata?: { [docId: string]: { name: string; size: number; type: string } | null };
  hasProfilePhoto?: boolean;
  profilePhotoDataUri?: string;
  registrationCompleted?: boolean;
  biodata?: BiodataDetails;
  achievements?: ApplicantAchievement[];
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
    // Background sync to Supabase (only if key is not temp like login credentials)
    if (key !== 'loginCredentials') {
      pushToSupabase(key, value);
    }
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
    if (key !== 'loginCredentials') {
      deleteFromSupabase(key);
    }
  } catch (error) {
    console.warn(`Error removing localStorage key “${key}”:`, error);
  }
}

export function pushToSupabase(key: string, value: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key_anon) return;

  const fullKey = APP_PREFIX + key;
  fetch(`${url}/rest/v1/portal_data`, {
    method: 'POST',
    headers: {
      'apikey': key_anon,
      'Authorization': `Bearer ${key_anon}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      key: fullKey,
      value: value,
      updated_at: new Date().toISOString()
    })
  }).catch(err => console.warn('Supabase sync error:', err));
}

export function deleteFromSupabase(key: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key_anon) return;

  const fullKey = APP_PREFIX + key;
  fetch(`${url}/rest/v1/portal_data?key=eq.${fullKey}`, {
    method: 'DELETE',
    headers: {
      'apikey': key_anon,
      'Authorization': `Bearer ${key_anon}`
    }
  }).catch(err => console.warn('Supabase delete error:', err));
}

export async function pullFromSupabase(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key_anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key_anon) {
    console.warn('Supabase env vars are not set. Offline mode active.');
    return false;
  }

  try {
    const res = await fetch(`${url}/rest/v1/portal_data`, {
      headers: {
        'apikey': key_anon,
        'Authorization': `Bearer ${key_anon}`
      }
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.key && row.value !== undefined) {
          window.localStorage.setItem(row.key, JSON.stringify(row.value));
        }
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Supabase pull error:', err);
    return false;
  }
}
