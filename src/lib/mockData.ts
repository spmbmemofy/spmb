
import { initialSchoolData, initialOriginSchoolData } from './schoolData';
import type { Applicant, Jalur, ApplicantStatus } from '@/lib/types';

const firstNames = ["Andi", "Bima", "Clara", "Dian", "Elang", "Fitri", "Gilang", "Hana", "Ivan", "Jasmine", "Kurnia", "Lina", "Mega", "Nadia", "Oscar", "Putri", "Rangga", "Sari", "Tegar", "Vina", "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko"];
const lastNames = ["Saputra", "Wijayanti", "Nugroho", "Lestari", "Prabowo", "Wati", "Setiawan", "Handoko", "Permatasari", "Maulana", "Santoso", "Hakim", "Effendi", "Siregar", "Putra", "Kusuma", "Wahyuni", "Saleh", "Abdullah", "Batubara"];
export const jalurOptionsPlain: Jalur[] = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
export const statusVerifikasiOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai"];

export const generateAllMockApplicants = (): Applicant[] => {
    const applicants: Applicant[] = [];
    let applicantIdCounter = 1;

    initialOriginSchoolData.forEach((originSchool) => {
        const numApplicants = originSchool.jumlahPendaftar;
        for (let i = 0; i < numApplicants; i++) {
            const destinationSchool = initialSchoolData[applicantIdCounter % initialSchoolData.length];
            const fullName = `${firstNames[applicantIdCounter % firstNames.length]} ${lastNames[i % lastNames.length]}`;
            const nisn = `00${String(10000000 + applicantIdCounter).padStart(8, '0')}`;
            const jalur = jalurOptionsPlain[applicantIdCounter % jalurOptionsPlain.length];

            const semesterGrades = {
                semester1: parseFloat((Math.random() * (95 - 80) + 80).toFixed(2)),
                semester2: parseFloat((Math.random() * (95 - 80) + 80).toFixed(2)),
                semester3: parseFloat((Math.random() * (95 - 80) + 80).toFixed(2)),
                semester4: parseFloat((Math.random() * (95 - 80) + 80).toFixed(2)),
                semester5: parseFloat((Math.random() * (95 - 80) + 80).toFixed(2)),
            };
            
            const nilaiPrestasi = jalur === 'Prestasi' ? parseFloat((Math.random() * (15 - 5) + 5).toFixed(2)) : undefined;

            applicants.push({
                id: `app-${applicantIdCounter}`,
                noRegistrasi: nisn,
                fullName,
                nisn,
                asalSekolahId: originSchool.id,
                asalSekolahNama: originSchool.namaSekolah,
                sekolahTujuanId: destinationSchool.id,
                sekolahTujuanNama: destinationSchool.namaSekolah,
                jalur,
                statusVerifikasi: statusVerifikasiOptionsPlain[i % statusVerifikasiOptionsPlain.length],
                peringkat: null,
                semesterGrades,
                nilaiPrestasi,
                nilaiTambahanPilihan: 0,
            });
            applicantIdCounter++;
        }
    });

    // Ensure the first few applicants represent all pathways for predictable testing/demo
    if (applicants.length >= jalurOptionsPlain.length) {
        jalurOptionsPlain.forEach((jalur, index) => {
            applicants[index].jalur = jalur;
            if (jalur === 'Prestasi') {
                if (!applicants[index].nilaiPrestasi) {
                    applicants[index].nilaiPrestasi = parseFloat((Math.random() * (15 - 5) + 5).toFixed(2));
                }
            } else {
                applicants[index].nilaiPrestasi = undefined;
            }
        });
    }


    // Add ranking logic
    initialSchoolData.forEach(school => {
        jalurOptionsPlain.forEach(jalurName => {
            const verifiedApplicantsInJalur = applicants
              .filter(app => app.sekolahTujuanId === school.id && app.jalur === jalurName && app.statusVerifikasi === "Terverifikasi")
              .map(app => {
                  const totalNilaiRapor = Object.values(app.semesterGrades).reduce((a, b) => a + b, 0);
                  const nilaiPrestasi = app.jalur === 'Prestasi' ? (app.nilaiPrestasi || 0) : 0;
                  // The check for first choice school is now inside the component, but let's simulate it here for ranking
                  const nilaiTambahan = 25; // Assuming for this ranking context, all are first choice for simplicity
                  const totalNilai = totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
                  return { ...app, totalNilai };
              })
              .sort((a, b) => b.totalNilai - a.totalNilai); 
      
            verifiedApplicantsInJalur.forEach((appWithScore, index) => {
              const originalApplicantIndex = applicants.findIndex(origApp => origApp.id === appWithScore.id);
              if (originalApplicantIndex !== -1) {
                applicants[originalApplicantIndex].peringkat = index + 1;
                applicants[originalApplicantIndex].nilaiTambahanPilihan = 25; // Mark that they got the bonus
              }
            });
        });
    });
    
    return applicants;
};
