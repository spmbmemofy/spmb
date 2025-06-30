
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import { initialUsers, type User } from './userData';
import { deleteApplicantByNisn } from './applicantService';
import { deleteManagedApplicantByNisn } from './managedApplicantService';

const USERS_STORAGE_KEY = 'allUsersData_v3';

/**
 * Initializes the users data in localStorage if it doesn't already exist.
 */
export const initializeUsers = (): void => {
  const existingUsers = getFromLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  if (existingUsers.length === 0) {
    saveToLocalStorage(USERS_STORAGE_KEY, initialUsers);
  }
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
