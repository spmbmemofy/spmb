
import { getSchools } from './schoolService';
import type { Applicant, ApplicantStatus, SchoolSelection } from '@/lib/types';

const firstNames = ["Andi", "Bima", "Clara", "Dian", "Elang", "Fitri", "Gilang", "Hana", "Ivan", "Jasmine", "Kurnia", "Lina", "Mega", "Nadia", "Oscar", "Putri", "Rangga", "Sari", "Tegar", "Vina", "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko"];
const lastNames = ["Saputra", "Wijayanti", "Nugroho", "Lestari", "Prabowo", "Wati", "Setiawan", "Handoko", "Permatasari", "Maulana", "Santoso", "Hakim", "Effendi", "Siregar", "Putra", "Kusuma", "Wahyuni", "Saleh", "Abdullah", "Batubara"];
export const statusVerifikasiOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai", "Dibatalkan"];

const prestasiScoreOptions = Array.from({ length: (85 - 30) / 5 + 1 }, (_, i) => 30 + i * 5);
const getRandomPrestasiScore = () => prestasiScoreOptions[Math.floor(Math.random() * prestasiScoreOptions.length)];

export const generateAllMockApplicants = (): Applicant[] => {
    // Return an empty array to ensure no mock applicants are created by default.
    // This provides a clean slate for testing and development.
    return [];
};
