
'use client';

import { initializeUsers } from './userService';
import { initializeSchoolsData } from './schoolService';
import { initializeManagedApplicantsData } from './managedApplicantService';
import { initializeApplicantsData } from './applicantService';

export function initializeAllData() {
  if (typeof window !== 'undefined') {
    // This function now runs on every layout mount to ensure that
    // the application's data is a direct reflection of the initial
    // data in the source code, preventing inconsistencies from
    // old data in localStorage.
    initializeUsers();
    initializeSchoolsData();
    initializeManagedApplicantsData();
    initializeApplicantsData(); 
  }
}
