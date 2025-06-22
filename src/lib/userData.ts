
export type UserRole = 'applicant' | 'admin' | 'verifikator' | 'smp_operator' | 'superadmin' | 'headmaster';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  npsn?: string;
  namaSekolah?: string;
}

// In a real application, this data would come from a secure database.
// Passwords should NEVER be stored in plaintext. This is for demonstration only.
export const initialUsers: User[] = [
  // Pendaftar
  { id: 'user-1', username: '0056789123', password: 'password123', role: 'applicant', fullName: 'Muhammad Rizky Pratama' },
  { id: 'user-2', username: '0012345678', password: 'password123', role: 'applicant', fullName: 'Budi Santoso' },

  // Verifikator
  { id: 'user-3', username: 'verifikator_sman4', password: 'password123', role: 'verifikator', fullName: 'Ahmad Syahputra, S.Kom', npsn: '30401831', namaSekolah: 'SMA Negeri 4 Berau' },
  { id: 'user-4', username: 'verifikator_smkn1', password: 'password123', role: 'verifikator', fullName: 'Siti Aminah, S.Pd', npsn: '30401828', namaSekolah: 'SMK Negeri 1 Berau' },

  // Operator SMP
  { id: 'user-5', username: 'operator_smpn1', password: 'password123', role: 'smp_operator', fullName: 'Operator SMPN 1', npsn: '30401918', namaSekolah: 'SMP Negeri 1 Tanjung Redeb' },
  { id: 'user-10', username: 'operator_smpn2', password: 'password123', role: 'smp_operator', fullName: 'Operator SMPN 2', npsn: '30401878', namaSekolah: 'SMP Negeri 2 Teluk Bayur' },


  // Kepala Sekolah
  { id: 'user-6', username: 'kepsek_sman4', password: 'password123', role: 'headmaster', fullName: 'Dr. Retno Wulandari, M.Pd', npsn: '30401831', namaSekolah: 'SMA Negeri 4 Berau' },
  { id: 'user-9', username: 'kepsek_smkn1', password: 'password123', role: 'headmaster', fullName: 'Drs. H. Susilo, M.M.', npsn: '30401828', namaSekolah: 'SMK Negeri 1 Berau' },
  
  // Admin
  { id: 'user-7', username: 'admin_disdik', password: 'password123', role: 'admin', fullName: 'Admin Disdik' },

  // Superadmin
  { id: 'user-8', username: 'superadmin', password: 'password123', role: 'superadmin', fullName: 'Super Admin' },
];
