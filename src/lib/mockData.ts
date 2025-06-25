
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
            id: 'app-0012345678',
            noRegistrasi: 'PMB2026-0001',
            fullName: 'M. Insan Kamil',
            nisn: '0012345678',
            asalSekolahId: smpSchools[0].id,
            asalSekolahNama: smpSchools[0].namaSekolah,
            sekolahTujuanId: destinationSchools[0].id,
            sekolahTujuanNama: destinationSchools[0].namaSekolah,
            schoolSelections: [{ schoolId: destinationSchools[0].id, major: null }],
            jalur: 'Prestasi',
            statusVerifikasi: 'Terverifikasi',
            semesterGrades: { semester1: 88, semester2: 89, semester3: 90, semester4: 91, semester5: 92 },
            nilaiPrestasi: 50,
            documentStatuses: {
                biodata: 'valid',
                nilai_rapor: 'valid',
                kk: 'valid',
                akta: 'valid',
                skl: 'valid',
                rapor_gabungan: 'valid',
                sertifikat_prestasi: 'valid',
                sk_prestasi: 'valid',
            },
            verifiedBy: 'Ahmad Dahlan',
            verificationTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            activityHistory: [
                { type: 'REGISTRATION_COMPLETED', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), actor: 'M. Insan Kamil' },
                { type: 'VERIFICATION_APPROVED', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), actor: 'Ahmad Dahlan' }
            ],
            nik: '6403011203080001',
            placeOfBirth: 'Samarinda',
            dateOfBirth: '2008-03-12',
            gender: 'Laki-laki',
            religion: 'Islam',
            streetName: 'Jl. Pahlawan No. 1',
            rtRw: 'RT 01 RW 01',
            village: 'Kel. Gayam',
            subdistrict: 'Kec. Tanjung Redeb',
            district: 'Kabupaten Berau',
            province: 'Kalimantan Timur',
            contactNumber: '081234567890',
            profilePhotoDataUri: 'https://placehold.co/128x160.png',
        },
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
