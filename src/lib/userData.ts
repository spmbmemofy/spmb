
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
// All initial user data has been cleared to allow for a fresh simulation start.
export const initialUsers: User[] = [];
