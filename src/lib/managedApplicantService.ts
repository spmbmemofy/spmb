
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { ManagedApplicant } from './types';

// Adding initial data for demonstration purposes.
const initialManagedApplicants: ManagedApplicant[] = [
    {
        id: 'managed-kusnadi-01',
        fullName: 'Muhammad Kusnadi',
        nisn: '0078901234',
        gender: 'Laki-laki',
        asalSekolahId: 'smpn1sambaliung30401888', // Make sure this ID exists in schoolService
        semesterGrades: { semester1: 85, semester2: 86, semester3: 87, semester4: 88, semester5: 89 },
    }
];

const MANAGED_APPLICANTS_STORAGE_KEY = 'managedApplicantsData';

export const initializeManagedApplicantsData = (): void => {
  // Check if data already exists. If not, initialize with the new initial data.
  const storedData = getFromLocalStorage<ManagedApplicant[] | null>(MANAGED_APPLICANTS_STORAGE_KEY, null);
  if (storedData === null) {
    saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, initialManagedApplicants);
  }
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
