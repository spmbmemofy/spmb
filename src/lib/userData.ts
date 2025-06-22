
export type UserRole = 'applicant' | 'admin' | 'verifikator' | 'smp_operator' | 'superadmin' | 'headmaster';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}

// In a real application, this data would come from a secure database.
// Passwords should NEVER be stored in plaintext. This is for demonstration only.
const users: User[] = [
  // Pendaftar
  { id: 'user-1', username: '0056789123', password: 'password123', role: 'applicant', fullName: 'Muhammad Rizky Pratama' },
  { id: 'user-2', username: '0012345678', password: 'password123', role: 'applicant', fullName: 'Budi Santoso' },

  // Verifikator
  { id: 'user-3', username: 'verifikator_sman4', password: 'password123', role: 'verifikator', fullName: 'Ahmad Syahputra, S.Kom' },
  { id: 'user-4', username: 'verifikator_smkn1', password: 'password123', role: 'verifikator', fullName: 'Siti Aminah, S.Pd' },

  // Operator SMP
  { id: 'user-5', username: 'operator_smpn1', password: 'password123', role: 'smp_operator', fullName: 'Operator SMPN 1' },

  // Kepala Sekolah
  { id: 'user-6', username: 'kepsek_sman4', password: 'password123', role: 'headmaster', fullName: 'Dr. Retno Wulandari, M.Pd' },
  
  // Admin
  { id: 'user-7', username: 'admin_disdik', password: 'password123', role: 'admin', fullName: 'Admin Disdik' },

  // Superadmin
  { id: 'user-8', username: 'superadmin', password: 'password123', role: 'superadmin', fullName: 'Super Admin' },
];

/**
 * Finds a user by their username.
 * In a real app, this would be a database query.
 * @param username The username to search for.
 * @returns The user object or undefined if not found.
 */
export function findUserByUsername(username: string): User | undefined {
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
}
