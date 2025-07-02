
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { Tahap } from './types';
import { getJalur } from './pathwayService';

const STAGES_STORAGE_KEY = 'allStagesData_v1';

const now = new Date();
const tahap1EndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
const tahap2StartDate = new Date(tahap1EndDate.getTime() + 1000); // Start immediately after
const tahap2EndDate = new Date(tahap2StartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week duration

const initialStages: Tahap[] = [
  { 
    id: 'tahap-1', 
    name: 'Tahap 1', 
    startDate: now.toISOString(), 
    endDate: tahap1EndDate.toISOString(),
    announcementContent: '<h3>Pengumuman Tahap 1 Belum Tersedia</h3><p>Silakan periksa kembali nanti.</p>',
    isAnnouncementPublished: false
  },
  { 
    id: 'tahap-2', 
    name: 'Tahap 2', 
    startDate: tahap2StartDate.toISOString(), 
    endDate: tahap2EndDate.toISOString(),
    announcementContent: '<h3>Pengumuman Tahap 2 Belum Tersedia</h3><p>Silakan periksa kembali nanti.</p>',
    isAnnouncementPublished: false
  },
];

export const initializeStagesData = (): void => {
  const existingData = getFromLocalStorage<Tahap[]>(STAGES_STORAGE_KEY, []);
  if (existingData.length === 0) {
    saveToLocalStorage(STAGES_STORAGE_KEY, initialStages);
  }
};

export function getStages(): Tahap[] {
  return getFromLocalStorage<Tahap[]>(STAGES_STORAGE_KEY, []);
}

export function addStage(newStage: Omit<Tahap, 'id' | 'announcementContent' | 'isAnnouncementPublished'>): Tahap {
  const stages = getStages();
  if (stages.some(s => s.name.toLowerCase() === newStage.name.toLowerCase())) {
    throw new Error('Tahap dengan nama yang sama sudah ada.');
  }
  const stageWithId: Tahap = {
    ...newStage,
    id: `tahap-${Date.now()}`,
    announcementContent: '',
    isAnnouncementPublished: false,
  };
  const updatedStages = [...stages, stageWithId];
  saveToLocalStorage(STAGES_STORAGE_KEY, updatedStages);
  return stageWithId;
}

export function updateStage(updatedStage: Tahap): Tahap | undefined {
  let stages = getStages();
  const index = stages.findIndex(s => s.id === updatedStage.id);
  if (index !== -1) {
    if (stages.some(s => s.name.toLowerCase() === updatedStage.name.toLowerCase() && s.id !== updatedStage.id)) {
      throw new Error('Tahap dengan nama yang sama sudah ada.');
    }
    stages[index] = updatedStage;
    saveToLocalStorage(STAGES_STORAGE_KEY, stages);
    return updatedStage;
  }
  return undefined;
}

export function deleteStage(stageId: string): boolean {
  let stages = getStages();
  const pathways = getJalur();
  
  if (pathways.some(p => p.tahapId === stageId)) {
    throw new Error('Tidak dapat menghapus tahap yang masih digunakan oleh jalur pendaftaran.');
  }

  const newStages = stages.filter(s => s.id !== stageId);
  if (newStages.length < stages.length) {
    saveToLocalStorage(STAGES_STORAGE_KEY, newStages);
    return true;
  }
  return false;
}
