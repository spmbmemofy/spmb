'use client';

import { initializeUsers } from './userService';
import { initializeSchoolsData } from './schoolService';
import { initializeManagedApplicantsData } from './managedApplicantService';
import { initializeApplicantsData } from './applicantService';

let initialized = false;

export function initializeAllData() {
  if (typeof window !== 'undefined' && !initialized) {
    initializeUsers();
    initializeSchoolsData();
    initializeManagedApplicantsData();
    // This function now explicitly initializes/resets the applicants data
    initializeApplicantsData(); 
    initialized = true;
  }
}
