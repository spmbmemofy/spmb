
import type { SchoolJenjang } from './schoolService';

export type SchoolSelection = {
  schoolId: string;
  major: string | null;
};

export type ApplicantStatus = "Terverifikasi" | "Menunggu Verifikasi" | "Berkas tidak sesuai";
export type DocumentStatus = "valid" | "invalid" | null;

export interface Tahap {
  id: string;
  name: string;
  startDate: string; // ISO String for datetime
  endDate: string; // ISO String for datetime
  isAnnouncementPublished?: boolean;
}

export interface Jalur {
  id:string;
  name: string;
  tahapId: string;
  allowedJenjang: SchoolJenjang[];
}

export interface ActivityEvent {
  type: 'REGISTRATION_COMPLETED' | 'VERIFICATION_REJECTED' | 'FILES_RESUBMITTED' | 'VERIFICATION_APPROVED' | 'VERIFICATION_CANCELLED' | 'REGISTRATION_WITHDRAWN';
  timestamp: string; // ISO string
  actor: string; // e.g., 'Pendaftar' or verifier's name
  details?: string; // e.g., rejection reason
}

export interface Major {
  id: string;
  name: string;
  quota: {
    afirmasi: number;
    mutasi: number;
    prestasi: number;
    domisili: number;
  };
  berkasPendukung?: string;
}

export interface PriorityDomicile {
  village: string;
  rts: string[]; // Empty array means the whole village is priority
}

export interface Applicant {
  id: string;
  fullName: string;
  nisn: string;
  asalSekolahId: string;
  asalSekolahNama: string;
  sekolahTujuanId: string;
  sekolahTujuanNama: string;
  schoolSelections: SchoolSelection[];
  jalur: string;
  statusVerifikasi: ApplicantStatus;
  documentStatuses?: Record<string, DocumentStatus>;
  rejectionReason?: string;
  peringkat: number | null;
  diterimaDiSekolahId?: string | null;
  semesterGrades: {
    semester1: number;
    semester2: number;
    semester3: number;
    semester4: number;
    semester5: number;
  };
  nilaiPrestasi?: number;
  nilaiTambahanPilihan?: number;

  // Added biodata fields
  nik?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  streetName?: string;
  rtRw?: string;
  village?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  fatherName?: string;
  fatherDateOfBirth?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName?: string;
  motherDateOfBirth?: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  contactNumber?: string;
  profilePhotoDataUri?: string;

  // Verification details
  verifiedBy?: string;
  verificationTimestamp?: string;
  activityHistory: ActivityEvent[];
  submissionTimestamp?: string;
  latitude?: number;
  longitude?: number;
}

export type SortKey = keyof Applicant | 'no';
export type SortDirection = "ascending" | "descending";

export interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

export interface ManagedApplicant {
  id: string;
  fullName: string;
  nisn: string;
  nik?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender: 'Laki-laki' | 'Perempuan';
  religion?: string;
  contactNumber?: string;
  streetName?: string;
  rtRw?: string;
  village?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  asalSekolahId: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName?: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  semesterGrades: {
    semester1: number;
    semester2: number;
    semester3: number;
    semester4: number;
    semester5: number;
  };
}

export interface ExcelRow {
  "Nama Lengkap": string;
  "NISN": string;
  "NIK"?: string;
  "Tempat Lahir"?: string;
  "Tanggal Lahir"?: string;
  "Jenis Kelamin": "Laki-laki" | "Perempuan";
  "Agama"?: string;
  "No. Kontak"?: string;
  "Nama Jalan & No. Rumah"?: string;
  "RT/RW"?: string;
  "Kelurahan/Desa"?: string;
  "Kecamatan"?: string;
  "Kabupaten/Kota"?: string;
  "Provinsi"?: string;
  "Nama Ayah"?: string;
  "Pekerjaan Ayah"?: string;
  "Penghasilan Ayah"?: string;
  "Nama Ibu"?: string;
  "Pekerjaan Ibu"?: string;
  "Penghasilan Ibu"?: string;
  "Nama Wali"?: string;
  "Nilai Semester 1": number;
  "Nilai Semester 2": number;
  "Nilai Semester 3": number;
  "Nilai Semester 4": number;
  "Nilai Semester 5": number;
}
