
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import { generateAllMockApplicants } from './mockData';
import type { Applicant } from './types';

const APPLICANTS_STORAGE_KEY = 'allApplicantsData';

/**
 * Gets all applicants.
 * If data exists in localStorage, it returns that. Otherwise, it generates
 * new mock data, saves it to localStorage, and then returns it.
 * @returns An array of all applicants.
 */
export function getApplicants(): Applicant[] {
  let applicants = getFromLocalStorage<Applicant[] | null>(APPLICANTS_STORAGE_KEY, null);
  if (!applicants) {
    applicants = generateAllMockApplicants();
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, applicants);
  }
  return applicants;
}

/**
 * Finds a single applicant by their ID from the list.
 * @param id The ID of the applicant to find.
 * @returns The applicant object or undefined if not found.
 */
export function getApplicantById(id: string): Applicant | undefined {
  const applicants = getApplicants();
  return applicants.find(app => app.id === id);
}

/**
 * Updates an applicant's data in the localStorage list.
 * @param updatedApplicant The applicant object with updated information.
 */
export function updateApplicant(updatedApplicant: Applicant): void {
  let applicants = getApplicants();
  const index = applicants.findIndex(app => app.id === updatedApplicant.id);
  if (index !== -1) {
    applicants[index] = updatedApplicant;
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, applicants);
  } else {
    console.error("Applicant not found for update");
  }
}
