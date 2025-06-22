
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
