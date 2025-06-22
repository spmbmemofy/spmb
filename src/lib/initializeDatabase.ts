'use client';

import { initializeUsers } from './userService';
import { initializeSchoolsData } from './schoolService';
import { initializeManagedApplicantsData } from './managedApplicantService';
import { getApplicants } from './applicantService';

let initialized = false;

export function initializeAllData() {
  if (typeof window !== 'undefined' && !initialized) {
    initializeUsers();
    initializeSchoolsData();
    initializeManagedApplicantsData();
    // This function also initializes the applicants data on its first call
    getApplicants(); 
    initialized = true;
  }
}
