
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { ManagedApplicant } from './types';

// The user requested to start the simulation from scratch, so we are clearing all initial dummy data.
const initialManagedApplicants: ManagedApplicant[] = [];

const MANAGED_APPLICANTS_STORAGE_KEY = 'managedApplicantsData';

export const initializeManagedApplicantsData = (): void => {
  // Check if data already exists. If not, initialize with an empty array.
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
