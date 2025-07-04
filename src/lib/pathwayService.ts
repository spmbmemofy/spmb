
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { Jalur } from './types';

const JALUR_STORAGE_KEY = 'allJalurData_v3';

const initialJalurData: Jalur[] = [
  { id: 'jalur-afirmasi', name: 'Afirmasi', tahapId: 'tahap-1', allowedJenjang: ['SMA', 'SMK'] },
  { id: 'jalur-mutasi', name: 'Mutasi', tahapId: 'tahap-1', allowedJenjang: ['SMA', 'SMK'] },
  { id: 'jalur-prestasi', name: 'Prestasi', tahapId: 'tahap-1', allowedJenjang: ['SMA', 'SMK'] },
  { id: 'jalur-domisili', name: 'Domisili', tahapId: 'tahap-2', allowedJenjang: ['SMA'] },
  { id: 'jalur-reguler-smk', name: 'Reguler SMK', tahapId: 'tahap-2', allowedJenjang: ['SMA', 'SMK'] },
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
