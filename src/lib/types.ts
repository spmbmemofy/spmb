
export type SchoolSelection = {
  schoolId: string;
  major: string | null;
};

export type ApplicantStatus = "Terverifikasi" | "Menunggu Verifikasi" | "Berkas tidak sesuai";
export type Jalur = "Afirmasi" | "Mutasi" | "Prestasi" | "Domisili";
export type DocumentStatus = "valid" | "invalid" | null;

export interface Applicant {
  id: string;
  noRegistrasi: string;
  fullName: string;
  nisn: string;
  asalSekolahId: string;
  asalSekolahNama: string;
  sekolahTujuanId: string;
  sekolahTujuanNama: string;
  schoolSelections: SchoolSelection[];
  jalur: Jalur;
  statusVerifikasi: ApplicantStatus;
  documentStatuses?: Record<string, DocumentStatus>;
  rejectionReason?: string;
  peringkat?: number | null;
  semesterGrades: {
    semester1: number;
    semester2: number;
    semester3: number;
    semester4: number;
    semester5: number;
  };
  nilaiPrestasi?: number;
  nilaiTambahanPilihan?: number;
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
  address?: string;
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
  "Alamat"?: string;
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
