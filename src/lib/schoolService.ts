
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { Major } from './types';

// Type Definitions
export type SchoolJenjang = 'SMP' | 'SMA' | 'SMK';
export type SchoolJenis = 'Negeri' | 'Swasta';
export type SchoolAkreditasi = "A" | "B" | "C" | "Belum Terakreditasi";
export type SchoolStatusPendaftaran = "Buka" | "Tutup" | "Segera Penuh";

export interface School {
  id: string;
  npsn: string;
  namaSekolah: string;
  jenjang: SchoolJenjang;
  jenis: SchoolJenis;
  alamat: string;
  kecamatan: string;
  telepon: string;
  akreditasi: SchoolAkreditasi;
  wilayah?: string;
  kuota?: number;
  jalurKuota?: { afirmasi: number; mutasi: number; prestasi: number; domisili: number; };
  majors?: Major[];
  statusPendaftaran?: SchoolStatusPendaftaran;
  tahapId?: string;
  jumlahPendaftar?: number; 
  allowedGenders?: ('Laki-laki' | 'Perempuan')[];
  allowedReligions?: string[];
  allowedVillages?: string[];
}

// All initial data has been removed to provide a clean slate.
const initialSchools: School[] = [];


const SCHOOLS_STORAGE_KEY = 'allSchoolsData_v7';

// Service Functions
/**
 * Initializes the schools data in localStorage if it doesn't already exist.
 */
export const initializeSchoolsData = (): void => {
  const existingSchools = getFromLocalStorage<School[]>(SCHOOLS_STORAGE_KEY, []);
  if (existingSchools.length === 0) {
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, initialSchools);
  }
};

export function getSchools(): School[] {
  return getFromLocalStorage<School[]>(SCHOOLS_STORAGE_KEY, []);
}

export function getSchoolById(id: string): School | undefined {
    return getSchools().find(s => s.id === id);
}

export function getSchoolByNPSN(npsn: string): School | undefined {
    return getSchools().find(s => s.npsn === npsn);
}

export function addSchool(newSchool: Omit<School, 'id'>): School {
  const schools = getSchools();
  if (schools.some(s => s.npsn === newSchool.npsn)) {
    throw new Error('Sekolah dengan NPSN yang sama sudah ada.');
  }
  const schoolWithId: School = { 
    ...newSchool, 
    id: newSchool.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '') + newSchool.npsn
  };
  const updatedSchools = [...schools, schoolWithId];
  saveToLocalStorage(SCHOOLS_STORAGE_KEY, updatedSchools);
  return schoolWithId;
}

export function updateSchool(updatedSchool: School): School | undefined {
  let schools = getSchools();
  const index = schools.findIndex(s => s.id === updatedSchool.id);
  if (index !== -1) {
    schools[index] = updatedSchool;
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, schools);
    return updatedSchool;
  }
  return undefined;
}

export function deleteSchool(schoolId: string): boolean {
  let schools = getSchools();
  const newSchools = schools.filter(s => s.id !== schoolId);
  if (newSchools.length < schools.length) {
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, newSchools);
    return true;
  }
  return false;
}
