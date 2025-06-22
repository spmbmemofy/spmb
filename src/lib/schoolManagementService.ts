
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import { initialManagedSchools, type ManagedSchool } from './school-management-data';

const SCHOOLS_STORAGE_KEY = 'allManagedSchoolsData';

const initializeSchools = (): ManagedSchool[] => {
  const storedSchools = getFromLocalStorage<ManagedSchool[] | null>(SCHOOLS_STORAGE_KEY, null);
  if (!storedSchools || storedSchools.length === 0) {
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, initialManagedSchools);
    return initialManagedSchools;
  }
  return storedSchools;
};

export function getManagedSchools(): ManagedSchool[] {
  return getFromLocalStorage<ManagedSchool[]>(SCHOOLS_STORAGE_KEY, initialManagedSchools);
}

export function addManagedSchool(newSchool: ManagedSchool): ManagedSchool {
  const schools = getManagedSchools();
  if (schools.some(s => s.npsn === newSchool.npsn)) {
    throw new Error('Sekolah dengan NPSN yang sama sudah ada.');
  }
  const updatedSchools = [...schools, newSchool];
  saveToLocalStorage(SCHOOLS_STORAGE_KEY, updatedSchools);
  return newSchool;
}

export function updateManagedSchool(updatedSchool: ManagedSchool): ManagedSchool | undefined {
  let schools = getManagedSchools();
  const index = schools.findIndex(s => s.npsn === updatedSchool.npsn);
  if (index !== -1) {
    schools[index] = updatedSchool;
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, schools);
    return updatedSchool;
  }
  return undefined;
}

export function deleteManagedSchool(npsn: string): boolean {
  let schools = getManagedSchools();
  const newSchools = schools.filter(s => s.npsn !== npsn);
  if (newSchools.length < schools.length) {
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, newSchools);
    return true;
  }
  return false;
}

// Ensure data is initialized on first load
if (typeof window !== 'undefined') {
  initializeSchools();
}
