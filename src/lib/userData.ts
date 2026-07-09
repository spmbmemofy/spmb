
export type UserRole = 'applicant' | 'admin' | 'verifikator' | 'smp_operator' | 'superadmin' | 'headmaster' | 'branch_admin';

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
// The superadmin is now hardcoded in the userService and is no longer part of initial localStorage data.
export const initialUsers: User[] = [];

export const roleDisplayNames: Record<UserRole, string> = {
  applicant: "Pendaftar",
  verifikator: "Verifikator",
  smp_operator: "Operator SMP",
  headmaster: "Kepala Sekolah",
  admin: "Admin",
  superadmin: "Superadmin",
  branch_admin: "Admin Cabang",
};

export const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    superadmin: "destructive",
    admin: "default",
    branch_admin: "default",
    verifikator: "secondary",
    headmaster: "outline",
    smp_operator: "outline",
    applicant: "outline",
};
