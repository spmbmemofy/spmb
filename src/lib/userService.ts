
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import { initialUsers, type User } from './userData';
import { deleteApplicantByNisn } from './applicantService';
import { deleteManagedApplicantByNisn } from './managedApplicantService';

const USERS_STORAGE_KEY = 'allUsersData_v5';

const superAdminAccount: User = {
  id: 'superadmin-01',
  username: 'superadmin',
  password: 'password123',
  role: 'superadmin',
  fullName: 'Super Administrator',
};

const branchAdminAccount: User = {
  id: 'branchadmin-01',
  username: 'branchadmin',
  password: 'password123',
  role: 'branch_admin',
  fullName: 'Admin Cabang Dinas',
};


/**
 * Initializes the users data in localStorage if it doesn't already exist.
 * The superadmin account is not stored in localStorage and is always present.
 */
export const initializeUsers = (): void => {
  const existingUsers = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  if (existingUsers.length === 0 && initialUsers.length > 0) {
    saveToLocalStorage(USERS_STORAGE_KEY, initialUsers);
  }
};

export function getUsers(): User[] {
  const storedUsers = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  // Ensure the superadmin and branchadmin are always present and not duplicated if somehow in storage.
  const otherUsers = storedUsers.filter(u => u.username !== superAdminAccount.username && u.username !== branchAdminAccount.username);
  return [superAdminAccount, branchAdminAccount, ...otherUsers];
}

export function addUser(newUser: Omit<User, 'id'>): User {
  if (newUser.username.toLowerCase() === superAdminAccount.username) {
      throw new Error('Tidak dapat membuat pengguna dengan username "superadmin".');
  }
  const users = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    throw new Error('Pengguna dengan username yang sama sudah ada.');
  }
  const userWithId: User = { ...newUser, id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
  const updatedUsers = [...users, userWithId];
  saveToLocalStorage(USERS_STORAGE_KEY, updatedUsers);
  return userWithId;
}

export function updateUser(updatedUser: User): User | undefined {
  if (updatedUser.id === superAdminAccount.id) {
    throw new Error("Pengguna superadmin tidak dapat diubah.");
  }

  let users = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    // Check for username uniqueness if username is being changed
    if (updatedUser.username && updatedUser.username.toLowerCase() !== users[index].username.toLowerCase()) {
      if (users.some(u => u.username.toLowerCase() === updatedUser.username.toLowerCase() && u.id !== updatedUser.id)) {
        throw new Error('Pengguna dengan username yang sama sudah ada.');
      }
    }
    // If password is not provided or empty, keep the old one
    if (!updatedUser.password) {
      updatedUser.password = users[index].password;
    }
    users[index] = updatedUser;
    saveToLocalStorage(USERS_STORAGE_KEY, users);
    return updatedUser;
  }
  return undefined;
}

export function deleteUser(userId: string): boolean {
  if (userId === superAdminAccount.id) {
    return false; // Prevent superadmin deletion
  }

  let users = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  const userToDelete = users.find(u => u.id === userId);

  if (!userToDelete) {
      return false;
  }

  // If the user is an applicant, also delete their associated data.
  if (userToDelete.role === 'applicant') {
      deleteApplicantByNisn(userToDelete.username);
      deleteManagedApplicantByNisn(userToDelete.username);
  }

  const newUsers = users.filter(u => u.id !== userId);
  if (newUsers.length < users.length) {
    saveToLocalStorage(USERS_STORAGE_KEY, newUsers);
    return true;
  }

  return false;
}

/**
 * Deletes all users (headmasters) associated with a given school NPSN.
 */
export function deleteUsersByNpsn(npsn: string): number {
  let users = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  const initialLength = users.length;
  const newUsers = users.filter(u => u.npsn !== npsn);
  if (newUsers.length < initialLength) {
    saveToLocalStorage(USERS_STORAGE_KEY, newUsers);
  }
  return initialLength - newUsers.length;
}

