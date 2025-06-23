
export type UserRole = 'applicant' | 'admin' | 'verifikator' | 'smp_operator' | 'superadmin' | 'headmaster';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  npsn?: string;
}

// In a real application, this data would come from a secure database.
// Passwords should NEVER be stored in plaintext. This is for demonstration only.
// Applicant users have been removed to allow for a clean simulation start.
export const initialUsers: User[] = [
  // Verifikator
  { id: 'user-3', username: 'verifikator_sman4', password: 'password123', role: 'verifikator', fullName: 'Ahmad Syahputra, S.Kom', npsn: '30404228' },
  { id: 'user-4', username: 'verifikator_smkn1', password: 'password123', role: 'verifikator', fullName: 'Siti Aminah, S.Pd', npsn: '30401828' },

  // Operator SMP
  { id: 'user-5', username: 'operator_smpn1', password: 'password123', role: 'smp_operator', fullName: 'Operator SMPN 1', npsn: '30401918' },
  { id: 'user-10', username: 'operator_smpn2', password: 'password123', role: 'smp_operator', fullName: 'Operator SMPN 2', npsn: '30401878' },


  // Kepala Sekolah
  { id: 'user-6', username: 'kepsek_sman4', password: 'password123', role: 'headmaster', fullName: 'Dr. Retno Wulandari, M.Pd', npsn: '30404228' },
  { id: 'user-9', username: 'kepsek_smkn1', password: 'password123', role: 'headmaster', fullName: 'Drs. H. Susilo, M.M.', npsn: '30401828' },
  
  // Admin
  { id: 'user-7', username: 'admin_disdik', password: 'password123', role: 'admin', fullName: 'Admin Disdik' },

  // Superadmin
  { id: 'user-8', username: 'superadmin', password: 'password123', role: 'superadmin', fullName: 'Super Admin' },
];
