
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { Jalur } from './types';

const JALUR_STORAGE_KEY = 'allJalurData_v2';

const now = new Date();
// Define stage end/start times clearly
const tahap1EndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
const tahap2EndDate = new Date(tahap1EndDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 2 weeks from now

const initialJalurData: Jalur[] = [
  // Tahap 1
  { id: 'jalur-afirmasi', name: 'Afirmasi', tahapPendaftaran: 1, startDate: now.toISOString(), endDate: tahap1EndDate.toISOString(), allowedJenjang: ['SMA', 'SMK'] },
  { id: 'jalur-mutasi', name: 'Mutasi', tahapPendaftaran: 1, startDate: now.toISOString(), endDate: tahap1EndDate.toISOString(), allowedJenjang: ['SMA', 'SMK'] },
  
  // Tahap 2
  { id: 'jalur-prestasi', name: 'Prestasi', tahapPendaftaran: 2, startDate: tahap1EndDate.toISOString(), endDate: tahap2EndDate.toISOString(), allowedJenjang: ['SMA', 'SMK'] },
  { id: 'jalur-domisili', name: 'Domisili', tahapPendaftaran: 2, startDate: tahap1EndDate.toISOString(), endDate: tahap2EndDate.toISOString(), allowedJenjang: ['SMA', 'SMK'] },
];


export const initializeJalurData = (): void => {
  const existingData = getFromLocalStorage<Jalur[]>(JALUR_STORAGE_KEY, []);
  if (existingData.length === 0) {
    saveToLocalStorage(JALUR_STORAGE_KEY, initialJalurData);
  }
};

export function getJalur(): Jalur[] {
  return getFromLocalStorage<Jalur[]>(JALUR_STORAGE_KEY, []);
}

export function addJalur(newJalur: Omit<Jalur, 'id'>): Jalur {
  const jalurList = getJalur();
  if (jalurList.some(j => j.name.toLowerCase() === newJalur.name.toLowerCase())) {
    throw new Error('Jalur dengan nama yang sama sudah ada.');
  }
  const jalurWithId: Jalur = {
    ...newJalur,
    id: `jalur-${Date.now()}`
  };
  const updatedJalur = [...jalurList, jalurWithId];
  saveToLocalStorage(JALUR_STORAGE_KEY, updatedJalur);
  return jalurWithId;
}

export function updateJalur(updatedJalur: Jalur): Jalur | undefined {
  let jalurList = getJalur();
  const index = jalurList.findIndex(j => j.id === updatedJalur.id);
  if (index !== -1) {
    if (jalurList.some(j => j.name.toLowerCase() === updatedJalur.name.toLowerCase() && j.id !== updatedJalur.id)) {
      throw new Error('Jalur dengan nama yang sama sudah ada.');
    }
    jalurList[index] = updatedJalur;
    saveToLocalStorage(JALUR_STORAGE_KEY, jalurList);
    return updatedJalur;
  }
  return undefined;
}

export function deleteJalur(jalurId: string): boolean {
  let jalurList = getJalur();
  const newJalurList = jalurList.filter(j => j.id !== jalurId);
  if (newJalurList.length < jalurList.length) {
    saveToLocalStorage(JALUR_STORAGE_KEY, newJalurList);
    return true;
  }
  return false;
}
