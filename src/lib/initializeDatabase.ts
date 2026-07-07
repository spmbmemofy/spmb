
'use client';

import { initializeUsers } from './userService';
import { initializeSchoolsData } from './schoolService';
import { initializeManagedApplicantsData } from './managedApplicantService';
import { initializeApplicantsData } from './applicantService';
import { initializeJalurData } from './pathwayService';
import { initializeStagesData } from './stageService';
import { initializeSystemSettings } from './systemSettingsService';
import { initializeImportHistory } from './importHistoryService';

export function initializeAllData() {
  if (typeof window !== 'undefined') {
    initializeUsers();
    initializeSchoolsData();
    initializeManagedApplicantsData();
    initializeApplicantsData(); 
    initializeJalurData();
    initializeStagesData();
    initializeSystemSettings();
    initializeImportHistory();
  }
}
