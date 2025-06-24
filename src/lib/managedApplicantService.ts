
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { ManagedApplicant } from './types';

// Adding initial data for demonstration purposes.
const initialManagedApplicants: ManagedApplicant[] = [
    {
    id: 'managed-0987654321',
    fullName: 'Siti Lestari',
    nisn: '0987654321',
    gender: 'Perempuan',
    asalSekolahId: 'smpn1sambaliung30401888', // From SMPN 1 Sambaliung
    semesterGrades: {
      semester1: 85,
      semester2: 88,
      semester3: 90,
      semester4: 87,
      semester5: 92,
    },
  },
];

const MANAGED_APPLICANTS_STORAGE_KEY = 'managedApplicantsData';

/**
 * Initializes the managed applicants data.
 * This now overwrites existing data to ensure consistency with the current codebase's initial state upon starting a session.
 */
export const initializeManagedApplicantsData = (): void => {
  saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, initialManagedApplicants);
};

export function getManagedApplicants(): ManagedApplicant[] {
  return getFromLocalStorage<ManagedApplicant[]>(MANAGED_APPLICANTS_STORAGE_KEY, []);
}

export function addManagedApplicant(newApplicant: Omit<ManagedApplicant, 'id'>): ManagedApplicant {
  const applicants = getManagedApplicants();
  if (applicants.some(a => a.nisn === newApplicant.nisn)) {
    throw new Error('Pendaftar dengan NISN yang sama sudah ada.');
  }
  const applicantWithId: ManagedApplicant = { 
    ...newApplicant, 
    id: `managed-${Date.now()}`
  };
  const updatedApplicants = [...applicants, applicantWithId];
  saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, updatedApplicants);
  return applicantWithId;
}

export function updateManagedApplicant(updatedApplicant: ManagedApplicant): ManagedApplicant | undefined {
  let applicants = getManagedApplicants();
  const index = applicants.findIndex(a => a.id === updatedApplicant.id);
  if (index !== -1) {
    if (applicants.some(a => a.nisn === updatedApplicant.nisn && a.id !== updatedApplicant.id)) {
        throw new Error('Pendaftar dengan NISN yang sama sudah ada.');
    }
    applicants[index] = updatedApplicant;
    saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, applicants);
    return updatedApplicant;
  }
  return undefined;
}

export function deleteManagedApplicant(applicantId: string): boolean {
  let applicants = getManagedApplicants();
  const newApplicants = applicants.filter(a => a.id !== applicantId);
  if (newApplicants.length < applicants.length) {
    saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, newApplicants);
    return true;
  }
  return false;
}

export function deleteManagedApplicantByNisn(nisn: string): boolean {
  let applicants = getManagedApplicants();
  const initialLength = applicants.length;
  const newApplicants = applicants.filter(a => a.nisn !== nisn);
  if (newApplicants.length < applicants.length) {
    saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, newApplicants);
    return true;
  }
  return false;
}
