
import { initialSchoolData, initialOriginSchoolData } from './schoolData';

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
}

const firstNames = ["Andi", "Bima", "Clara", "Dian", "Elang", "Fitri", "Gilang", "Hana", "Ivan", "Jasmine", "Kurnia", "Lina", "Mega", "Nadia", "Oscar", "Putri", "Rangga", "Sari", "Tegar", "Vina", "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko"];
const lastNames = ["Saputra", "Wijayanti", "Nugroho", "Lestari", "Prabowo", "Wati", "Setiawan", "Handoko", "Permatasari", "Maulana", "Santoso", "Hakim", "Effendi", "Siregar", "Putra", "Kusuma", "Wahyuni", "Saleh", "Abdullah", "Batubara"];
export const jalurOptionsPlain: Jalur[] = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
export const statusVerifikasiOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai"];

let allApplicants: Applicant[] | null = null;

export const generateAllMockApplicants = (): Applicant[] => {
    if (allApplicants) {
        return allApplicants;
    }

    const applicants: Applicant[] = [];
    let applicantIdCounter = 1;

    initialOriginSchoolData.forEach((originSchool) => {
        const numApplicants = originSchool.jumlahPendaftar;
        for (let i = 0; i < numApplicants; i++) {
            const destinationSchool = initialSchoolData[applicantIdCounter % initialSchoolData.length];
            const fullName = `${firstNames[applicantIdCounter % firstNames.length]} ${lastNames[i % lastNames.length]}`;
            const nisn = `00${String(10000000 + applicantIdCounter).padStart(8, '0')}`;
            
            applicants.push({
                id: `app-${applicantIdCounter}`,
                noRegistrasi: `REG2026-${String(applicantIdCounter).padStart(5, '0')}`,
                fullName,
                nisn,
                asalSekolahId: originSchool.id,
                asalSekolahNama: originSchool.namaSekolah,
                sekolahTujuanId: destinationSchool.id,
                sekolahTujuanNama: destinationSchool.namaSekolah,
                jalur: jalurOptionsPlain[applicantIdCounter % jalurOptionsPlain.length],
                statusVerifikasi: statusVerifikasiOptionsPlain[i % statusVerifikasiOptionsPlain.length],
                peringkat: null,
            });
            applicantIdCounter++;
        }
    });

    // Add ranking logic
    initialSchoolData.forEach(school => {
        jalurOptionsPlain.forEach(jalurName => {
            const verifiedApplicantsInJalur = applicants
              .filter(app => app.sekolahTujuanId === school.id && app.jalur === jalurName && app.statusVerifikasi === "Terverifikasi")
              .sort((a, b) => a.noRegistrasi.localeCompare(b.noRegistrasi));
      
            verifiedApplicantsInJalur.forEach((app, index) => {
              const originalApplicantIndex = applicants.findIndex(origApp => origApp.id === app.id);
              if (originalApplicantIndex !== -1) {
                applicants[originalApplicantIndex].peringkat = index + 1;
              }
            });
        });
    });
    
    allApplicants = applicants;
    return allApplicants;
};
