
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

// Initial Data
const initialSchools: School[] = [
  // SMPs (Origin Schools)
  { id: "smpn1tanjungredeb", npsn: '30401918', namaSekolah: 'SMP Negeri 1 Tanjung Redeb', jenjang: 'SMP', jenis: 'Negeri', alamat: 'Jl. M. I. Swadji, Tanjung Redeb', kecamatan: 'Kec. Tanjung Redeb', telepon: '0554-21111', akreditasi: 'A' },
  { id: "smpn2telukbayur", npsn: '30401878', namaSekolah: 'SMP Negeri 2 Teluk Bayur', jenjang: 'SMP', jenis: 'Negeri', alamat: 'Jl. Poros Labanan, Teluk Bayur', kecamatan: 'Kec. Teluk Bayur', telepon: '0554-21112', akreditasi: 'B' },
  { id: "mtsalkholil", npsn: '69753308', namaSekolah: 'MTs Al-Kholil', jenjang: 'SMP', jenis: 'Swasta', alamat: 'Jl. H. Isa III, Karang Ambun', kecamatan: 'Kec. Tanjung Redeb', telepon: '0554-21113', akreditasi: 'A' },

  // SMAs / SMKs (Destination Schools)
  {
    id: "sman1tanjungredeb", npsn: '30401827', namaSekolah: "SMA Negeri 1 Tanjung Redeb", jenjang: 'SMA', jenis: 'Negeri',
    alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Berau", kecamatan: "Kec. Tanjung Redeb", telepon: "0554-21045", akreditasi: "A",
    wilayah: '1', kuota: 266, jalurKuota: { afirmasi: 56, mutasi: 14, prestasi: 84, domisili: 112 }, majors: [],
    statusPendaftaran: "Buka", tahapPendaftaran: 1,
  },
  {
    id: "smkn1berau", npsn: '30401828', namaSekolah: "SMK Negeri 1 Berau", jenjang: 'SMK', jenis: 'Negeri',
    alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Berau", kecamatan: "Kec. Tanjung Redeb", telepon: "0554-21098", akreditasi: "A",
    wilayah: '1', kuota: 304, jalurKuota: { afirmasi: 61, mutasi: 15, prestasi: 91, domisili: 137 },
    majors: ["Teknik Komputer dan Jaringan", "Akuntansi dan Keuangan Lembaga", "Otomatisasi dan Tata Kelola Perkantoran", "Bisnis Daring dan Pemasaran"],
    statusPendaftaran: "Buka", tahapPendaftaran: 1,
  },
  {
    id: "sman4berau", npsn: '30404228', namaSekolah: "SMA Negeri 4 Berau", jenjang: 'SMA', jenis: 'Negeri',
    alamat: "Jl. Poros Labanan, Labanan Makmur, Teluk Bayur, Berau", kecamatan: "Kec. Teluk Bayur", telepon: "0554-25001", akreditasi: "B",
    wilayah: '2', kuota: 200, jalurKuota: { afirmasi: 40, mutasi: 10, prestasi: 60, domisili: 90 }, majors: [],
    statusPendaftaran: "Buka", tahapPendaftaran: 1,
  },
];

const SCHOOLS_STORAGE_KEY = 'allSchoolsData_v2';

// Service Functions
const initializeSchoolsData = (): School[] => {
  const storedSchools = getFromLocalStorage<School[] | null>(SCHOOLS_STORAGE_KEY, null);
  if (!storedSchools || storedSchools.length === 0) {
    saveToLocalStorage(SCHOOLS_STORAGE_KEY, initialSchools);
    return initialSchools;
  }
  return storedSchools;
};

export function getSchools(): School[] {
  return getFromLocalStorage<School[]>(SCHOOLS_STORAGE_KEY, initialSchools);
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

// Ensure data is initialized on first load
if (typeof window !== 'undefined') {
  initializeSchoolsData();
}
