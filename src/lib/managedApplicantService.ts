
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { ManagedApplicant } from './types';

const MANAGED_APPLICANTS_STORAGE_KEY = 'managedApplicantsData';

const initialManagedApplicants: ManagedApplicant[] = [
    {
        id: 'managed-1',
        fullName: 'Calon Siswa Contoh 1',
        nisn: '9988776655',
        gender: 'Laki-laki',
        asalSekolahId: 'smpn1tanjungredeb',
        semesterGrades: { semester1: 85, semester2: 88, semester3: 90, semester4: 87, semester5: 91 }
    },
    {
        id: 'managed-2',
        fullName: 'Calon Siswa Contoh 2',
        nisn: '9988776644',
        gender: 'Perempuan',
        asalSekolahId: 'smpn1tanjungredeb',
        semesterGrades: { semester1: 90, semester2: 92, semester3: 88, semester4: 91, semester5: 93 }
    }
];

const initializeManagedApplicantsData = (): ManagedApplicant[] => {
  const storedData = getFromLocalStorage<ManagedApplicant[] | null>(MANAGED_APPLICANTS_STORAGE_KEY, null);
  if (!storedData || storedData.length === 0) {
    saveToLocalStorage(MANAGED_APPLICANTS_STORAGE_KEY, initialManagedApplicants);
    return initialManagedApplicants;
  }
  return storedData;
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

// Ensure data is initialized on first load
if (typeof window !== 'undefined') {
  initializeManagedApplicantsData();
}
