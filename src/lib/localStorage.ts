
import type { UserRole } from './userData';
import type { SchoolSelection } from './types';

const APP_PREFIX = 'admissionPortal_';

export interface LoginCredentials {
  username?: string;
  role?: UserRole;
  rememberMe?: boolean;
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
