
export type ApplicantStatus = "Terverifikasi" | "Menunggu Verifikasi" | "Berkas tidak sesuai";
export type Jalur = "Afirmasi" | "Mutasi" | "Prestasi" | "Domisili";

export interface Applicant {
  id: string;
  noRegistrasi: string;
  fullName: string;
  nisn: string;
  asalSekolahId: string;
  asalSekolahNama: string;
  sekolahTujuanId: string;
  sekolahTujuanNama: string;
  jalur: Jalur;
  statusVerifikasi: ApplicantStatus;
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
