
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
// Only a single superadmin is created by default for system access.
export const initialUsers: User[] = [
  {
    id: 'superadmin-01',
    username: 'superadmin',
    password: 'password123',
    role: 'superadmin',
    fullName: 'Super Administrator',
  },
  {
    id: 'smp-sambaliung-01',
    username: 'operatorsmpn1sbl',
    password: 'password123',
    role: 'smp_operator',
    fullName: 'Operator SMPN 1 Sambaliung',
    npsn: '30401888',
  },
  {
    id: 'applicant-kusnadi-01',
    username: '0078901234',
    password: 'password123',
    role: 'applicant',
    fullName: 'Muhammad Kusnadi',
  },
];

export const roleDisplayNames: Record<UserRole, string> = {
  applicant: "Pendaftar",
  verifikator: "Verifikator",
  smp_operator: "Operator SMP",
  headmaster: "Kepala Sekolah",
  admin: "Admin",
  superadmin: "Superadmin",
};

export const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    superadmin: "destructive",
    admin: "default",
    verifikator: "secondary",
    headmaster: "outline",
    smp_operator: "outline",
    applicant: "outline",
};
