
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import { initialUsers, type User } from './userData';
import { deleteApplicantByNisn } from './applicantService';
import { deleteManagedApplicantByNisn } from './managedApplicantService';

const USERS_STORAGE_KEY = 'allUsersData_v2';

/**
 * Initializes the users data.
 * This now overwrites existing data to ensure consistency with the current codebase's initial state upon starting a session.
 */
export const initializeUsers = (): void => {
  saveToLocalStorage(USERS_STORAGE_KEY, initialUsers);
};

export function getUsers(): User[] {
  return getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
}

export function addUser(newUser: Omit<User, 'id'>): User {
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    throw new Error('Pengguna dengan username yang sama sudah ada.');
  }
  const userWithId: User = { ...newUser, id: `user-${Date.now()}` };
  const updatedUsers = [...users, userWithId];
  saveToLocalStorage(USERS_STORAGE_KEY, updatedUsers);
  return userWithId;
}

export function updateUser(updatedUser: User): User | undefined {
  let users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
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
  let users = getUsers();
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
