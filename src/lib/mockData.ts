
import { getSchools } from './schoolService';
import type { Applicant, Jalur, ApplicantStatus, SchoolSelection } from '@/lib/types';

const firstNames = ["Andi", "Bima", "Clara", "Dian", "Elang", "Fitri", "Gilang", "Hana", "Ivan", "Jasmine", "Kurnia", "Lina", "Mega", "Nadia", "Oscar", "Putri", "Rangga", "Sari", "Tegar", "Vina", "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko"];
const lastNames = ["Saputra", "Wijayanti", "Nugroho", "Lestari", "Prabowo", "Wati", "Setiawan", "Handoko", "Permatasari", "Maulana", "Santoso", "Hakim", "Effendi", "Siregar", "Putra", "Kusuma", "Wahyuni", "Saleh", "Abdullah", "Batubara"];
export const jalurOptionsPlain: Jalur[] = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
export const statusVerifikasiOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai"];

const prestasiScoreOptions = Array.from({ length: (85 - 30) / 5 + 1 }, (_, i) => 30 + i * 5);
const getRandomPrestasiScore = () => prestasiScoreOptions[Math.floor(Math.random() * prestasiScoreOptions.length)];

export const generateAllMockApplicants = (): Applicant[] => {
    const schools = getSchools();
    const smpSchools = schools.filter(s => s.jenjang === 'SMP');
    const destinationSchools = schools.filter(s => s.jenjang !== 'SMP');

    if (smpSchools.length === 0 || destinationSchools.length === 0) {
        // Cannot generate applicants if there are no schools, which can happen if localStorage is cleared.
        return [];
    }
    
    const applicants: Applicant[] = [
        {
            id: 'app-0023456789',
            noRegistrasi: 'PMB2026-0002',
            fullName: 'Bunga Citra Lestari',
            nisn: '0023456789',
            asalSekolahId: smpSchools[0].id,
            asalSekolahNama: smpSchools[0].namaSekolah,
            sekolahTujuanId: destinationSchools.find(s => s.jenjang === 'SMK')?.id || destinationSchools[0].id,
            sekolahTujuanNama: destinationSchools.find(s => s.jenjang === 'SMK')?.namaSekolah || destinationSchools[0].namaSekolah,
            schoolSelections: [{ schoolId: destinationSchools.find(s => s.jenjang === 'SMK')?.id || destinationSchools[0].id, major: 'Teknik Komputer dan Jaringan' }],
            jalur: 'Domisili',
            statusVerifikasi: 'Menunggu Verifikasi',
            semesterGrades: { semester1: 85, semester2: 86, semester3: 87, semester4: 88, semester5: 89 },
            documentStatuses: {},
            activityHistory: [
                { type: 'REGISTRATION_COMPLETED', timestamp: new Date().toISOString(), actor: 'Bunga Citra Lestari' }
            ],
            nik: '6403024508080002',
            placeOfBirth: 'Tanjung Redeb',
            dateOfBirth: '2008-08-05',
            gender: 'Perempuan',
        }
    ];

    return applicants;
};
