
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';

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
  majors?: string[];
  statusPendaftaran?: SchoolStatusPendaftaran;
  tahapPendaftaran?: number;
  jumlahPendaftar?: number; 
}

// Initial Data has been cleared to allow for a fresh simulation start.
const initialSchools: School[] = [
  {
    id: 'smpn1sambaliung30401888',
    npsn: '30401888',
    namaSekolah: 'SMPN 1 Sambaliung',
    jenjang: 'SMP',
    jenis: 'Negeri',
    alamat: 'Jl. Raya Sambaliung, Sambaliung, Berau',
    kecamatan: 'Kec. Sambaliung',
    telepon: '0554-2021888',
    akreditasi: 'B',
  }
];

const SCHOOLS_STORAGE_KEY = 'allSchoolsData_v2';

// Service Functions
export const initializeSchoolsData = (): void => {
  // This function now always overwrites existing data to ensure a clean state on session start.
  saveToLocalStorage(SCHOOLS_STORAGE_KEY, initialSchools);
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
