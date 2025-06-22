
import { initialSchoolData, initialOriginSchoolData } from './schoolData';
import type { Applicant, Jalur, ApplicantStatus, SchoolSelection } from '@/lib/types';

const firstNames = ["Andi", "Bima", "Clara", "Dian", "Elang", "Fitri", "Gilang", "Hana", "Ivan", "Jasmine", "Kurnia", "Lina", "Mega", "Nadia", "Oscar", "Putri", "Rangga", "Sari", "Tegar", "Vina", "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko"];
const lastNames = ["Saputra", "Wijayanti", "Nugroho", "Lestari", "Prabowo", "Wati", "Setiawan", "Handoko", "Permatasari", "Maulana", "Santoso", "Hakim", "Effendi", "Siregar", "Putra", "Kusuma", "Wahyuni", "Saleh", "Abdullah", "Batubara"];
export const jalurOptionsPlain: Jalur[] = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
export const statusVerifikasiOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai"];

const prestasiScoreOptions = Array.from({ length: (85 - 30) / 5 + 1 }, (_, i) => 30 + i * 5);
const getRandomPrestasiScore = () => prestasiScoreOptions[Math.floor(Math.random() * prestasiScoreOptions.length)];

export const generateAllMockApplicants = (): Applicant[] => {
    const applicants: Applicant[] = [];
    
    // Create our specific test user for the correction flow
    const testUserDestinationSchool = initialSchoolData.find(s => s.id === 'sman4berau') || initialSchoolData[0];
    const testUserOriginSchool = initialOriginSchoolData[0];
    const testUserSelections: SchoolSelection[] = [
        { schoolId: testUserDestinationSchool.id, major: null },
        { schoolId: initialSchoolData[1].id, major: "Teknik Komputer dan Jaringan" }
    ];
    
    applicants.push({
        id: 'app-0056789123',
        noRegistrasi: '0056789123',
        fullName: 'Muhammad Rizky Pratama',
        nisn: '0056789123',
        asalSekolahId: testUserOriginSchool.id,
        asalSekolahNama: testUserOriginSchool.namaSekolah,
        sekolahTujuanId: testUserDestinationSchool.id,
        sekolahTujuanNama: testUserDestinationSchool.namaSekolah,
        schoolSelections: testUserSelections,
        jalur: 'Domisili',
        statusVerifikasi: 'Berkas tidak sesuai',
        rejectionReason: 'Foto Kartu Keluarga (KK) buram dan tidak terbaca. Harap unggah ulang file yang lebih jelas.',
        documentStatuses: {
            'kk': 'invalid',
            'akta': 'valid',
            'skl': 'valid',
            'rapor_gabungan': 'valid',
        },
        peringkat: null,
        semesterGrades: {
            semester1: 86.50, semester2: 89.20, semester3: 91.00,
            semester4: 88.75, semester5: 93.10,
        },
        nilaiPrestasi: undefined,
        nilaiTambahanPilihan: 25,
    });


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
            
            const nilaiPrestasi = jalur === 'Prestasi' ? getRandomPrestasiScore() : undefined;

            const numSelections = Math.floor(Math.random() * 3) + 1;
            const schoolSelections: SchoolSelection[] = [];
            const availableSchools = [...initialSchoolData];

            const firstChoiceSchool = destinationSchool;
            let firstChoiceMajor: string | null = null;
            if (firstChoiceSchool.type === 'SMK' && firstChoiceSchool.majors && firstChoiceSchool.majors.length > 0) {
                firstChoiceMajor = firstChoiceSchool.majors[Math.floor(Math.random() * firstChoiceSchool.majors.length)];
            }
            schoolSelections.push({ schoolId: firstChoiceSchool.id, major: firstChoiceMajor });
            let schoolIndex = availableSchools.findIndex(s => s.id === firstChoiceSchool.id);
            if (schoolIndex > -1) availableSchools.splice(schoolIndex, 1);


            for (let j = 1; j < numSelections && availableSchools.length > 0; j++) {
                const nextSchoolIndex = Math.floor(Math.random() * availableSchools.length);
                const nextSchool = availableSchools[nextSchoolIndex];
                let nextMajor: string | null = null;
                if (nextSchool.type === 'SMK' && nextSchool.majors && nextSchool.majors.length > 0) {
                    nextMajor = nextSchool.majors[Math.floor(Math.random() * nextSchool.majors.length)];
                }
                schoolSelections.push({ schoolId: nextSchool.id, major: nextMajor });
                availableSchools.splice(nextSchoolIndex, 1);
            }

            applicants.push({
                id: `app-${applicantIdCounter}`,
                noRegistrasi: nisn,
                fullName,
                nisn,
                asalSekolahId: originSchool.id,
                asalSekolahNama: originSchool.namaSekolah,
                sekolahTujuanId: destinationSchool.id,
                sekolahTujuanNama: destinationSchool.namaSekolah,
                schoolSelections: schoolSelections,
                documentStatuses: {},
                jalur,
                statusVerifikasi: statusVerifikasiOptionsPlain[i % statusVerifikasiOptionsPlain.length],
                rejectionReason: undefined,
                peringkat: null,
                semesterGrades,
                nilaiPrestasi,
                nilaiTambahanPilihan: 0,
            });
            applicantIdCounter++;
        }
    });

    if (applicants.length >= jalurOptionsPlain.length) {
        jalurOptionsPlain.forEach((jalur, index) => {
            const targetIndex = index + 1; // Skip the test user
            if (applicants[targetIndex]) {
                 applicants[targetIndex].jalur = jalur;
                if (jalur === 'Prestasi') {
                    if (!applicants[targetIndex].nilaiPrestasi) {
                        applicants[targetIndex].nilaiPrestasi = getRandomPrestasiScore();
                    }
                } else {
                    applicants[targetIndex].nilaiPrestasi = undefined;
                }
            }
        });
    }

    initialSchoolData.forEach(school => {
        jalurOptionsPlain.forEach(jalurName => {
            const verifiedApplicantsInJalur = applicants
              .filter(app => app.sekolahTujuanId === school.id && app.jalur === jalurName && app.statusVerifikasi === "Terverifikasi")
              .map(app => {
                  const totalNilaiRapor = Object.values(app.semesterGrades).reduce((a, b) => a + b, 0);
                  const nilaiPrestasi = app.jalur === 'Prestasi' ? (app.nilaiPrestasi || 0) : 0;
                  const nilaiTambahan = 25;
                  const totalNilai = totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
                  return { ...app, totalNilai };
              })
              .sort((a, b) => b.totalNilai - a.totalNilai); 
      
            verifiedApplicantsInJalur.forEach((appWithScore, index) => {
              const originalApplicantIndex = applicants.findIndex(origApp => origApp.id === appWithScore.id);
              if (originalApplicantIndex !== -1) {
                applicants[originalApplicantIndex].peringkat = index + 1;
                applicants[originalApplicantIndex].nilaiTambahanPilihan = 25;
              }
            });
        });
    });
    
    const VERIFIER_SCHOOL_ID = "sman4berau";
    const verifierSchoolApplicants = applicants.filter(app => app.sekolahTujuanId === VERIFIER_SCHOOL_ID);
    
    if (verifierSchoolApplicants.length >= jalurOptionsPlain.length) {
        jalurOptionsPlain.forEach((requiredJalur, index) => {
            if (verifierSchoolApplicants[index]) {
                const applicantToChange = verifierSchoolApplicants[index];
                const originalApplicantIndex = applicants.findIndex(app => app.id === applicantToChange.id);

                if (originalApplicantIndex !== -1) {
                    applicants[originalApplicantIndex].jalur = requiredJalur;

                    if (requiredJalur === 'Prestasi' && !applicants[originalApplicantIndex].nilaiPrestasi) {
                        applicants[originalApplicantIndex].nilaiPrestasi = getRandomPrestasiScore();
                    } else if (requiredJalur !== 'Prestasi') {
                        applicants[originalApplicantIndex].nilaiPrestasi = undefined;
                    }
                }
            }
        });
    }

    return applicants;
};
