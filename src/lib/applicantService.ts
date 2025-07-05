
'use client';

import { getFromLocalStorage, saveToLocalStorage, type LoginCredentials, type RegistrationProgress } from './localStorage';
import { generateAllMockApplicants, jalurOptionsPlain } from './mockData';
import type { Applicant, ActivityEvent } from './types';
import { getSchoolById, getSchools, type School } from './schoolService';
import { getUsers } from './userService';

const APPLICANTS_STORAGE_KEY = 'allApplicantsData_v1';

function getApplicantRT(applicant: Applicant): string | null {
    if (!applicant.rtRw) return null;
    // handles "RT 01/RW 02", "01/02", "RT 1", "1"
    return applicant.rtRw.split('/')[0].replace(/rt/i, '').trim();
}

export function isPriority(applicant: Applicant, school: School): boolean {
    if (applicant.jalur !== 'Domisili' || !school.priorityDomiciles || school.priorityDomiciles.length === 0 || !applicant.village) {
        return false;
    }

    const priorityRule = school.priorityDomiciles.find(p => p.village === applicant.village);
    if (!priorityRule) {
        return false;
    }

    // If rts array is empty, it means the whole village is priority.
    if (priorityRule.rts.length === 0) {
        return true;
    }
    
    // Otherwise, check if applicant's RT is in the priority list.
    const applicantRT = getApplicantRT(applicant);
    if (!applicantRT) {
        return false; // Cannot determine RT, so not priority.
    }

    return priorityRule.rts.includes(applicantRT);
}


/**
 * Implements a cascading placement algorithm (Boston mechanism).
 * Iterates through each choice priority, attempting to place applicants
 * in their highest possible choice based on score and available quota.
 */
function recalculateAllRanks(): void {
    const allApplicantsData = getApplicants();
    const allSchoolsData = getSchools();

    // 1. Reset ranks and placement for all applicants before starting.
    const applicantMap = new Map(allApplicantsData.map(app => [app.id, { ...app, peringkat: null, diterimaDiSekolahId: null }]));

    // 2. Initialize quota usage tracker for all schools and pathways.
    const quotaUsage: Record<string, number> = {}; // Key: "schoolId-jalur" or "schoolId-majorName-jalur"
    allSchoolsData.forEach(school => {
        if (school.jenjang === 'SMA' && school.jalurKuota) {
            Object.keys(school.jalurKuota).forEach(jalur => {
                const key = `${school.id}-${jalur}`;
                quotaUsage[key] = 0;
            });
        } else if (school.jenjang === 'SMK' && school.majors) {
            school.majors.forEach(major => {
                Object.keys(major.quota).forEach(jalur => {
                    const key = `${school.id}-${major.name}-${jalur}`;
                    quotaUsage[key] = 0;
                });
            });
        }
    });

    // 3. Get a list of applicants who are eligible for ranking.
    let applicantsToProcess = Array.from(applicantMap.values()).filter(
        app => app.statusVerifikasi === 'Terverifikasi' && app.schoolSelections && app.schoolSelections.length > 0
    );

    const calculateScore = (applicant: Applicant, isFirstChoice: boolean): number => {
        const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
        const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
        const nilaiTambahan = isFirstChoice ? 25 : 0;
        return totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
    };

    const maxChoices = Math.max(0, ...applicantsToProcess.map(app => app.schoolSelections.length));

    // 4. Iterate through each choice priority level (1st choice, 2nd choice, etc.).
    for (let choiceIndex = 0; choiceIndex < maxChoices; choiceIndex++) {
        // Group remaining applicants by the school, major (if any), and pathway.
        const applicationsByGroup: Record<string, Applicant[]> = {};

        for (const applicant of applicantsToProcess) {
            const selection = applicant.schoolSelections[choiceIndex];
            if (!selection) continue;

            const school = allSchoolsData.find(s => s.id === selection.schoolId);
            if (!school) continue;

            const groupId = school.jenjang === 'SMK'
                ? `${selection.schoolId}-${selection.major}-${applicant.jalur}`
                : `${selection.schoolId}-${applicant.jalur}`;
            
            if (!applicationsByGroup[groupId]) {
                applicationsByGroup[groupId] = [];
            }
            applicationsByGroup[groupId].push(applicant);
        }

        // 5. For each group, sort by score and attempt to place them.
        for (const groupId in applicationsByGroup) {
            const groupApplicants = applicationsByGroup[groupId];
            const [schoolId, majorOrJalur, jalurIfSmk] = groupId.split('-');
            
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school) continue;
            
            const isSmk = school.jenjang === 'SMK';
            const jalur = isSmk ? jalurIfSmk : majorOrJalur;
            const majorName = isSmk ? majorOrJalur : null;
            
            // Sort applicants by domicile priority, then by score.
            groupApplicants.sort((a, b) => {
                // Only apply priority for Domisili pathway
                if (jalur.toLowerCase() === 'domisili') {
                    const isAPriority = isPriority(a, school);
                    const isBPriority = isPriority(b, school);
                    if (isAPriority && !isBPriority) return -1; // a comes first
                    if (!isAPriority && isBPriority) return 1;  // b comes first
                }
    
                // If priority is the same (or not Domisili pathway), sort by score
                return calculateScore(b, choiceIndex === 0) - calculateScore(a, choiceIndex === 0);
            });

            let pathwayQuota = 0;
            const pathwayKey = jalur.toLowerCase() as 'afirmasi' | 'mutasi' | 'prestasi' | 'domisili';
            
            if (isSmk && majorName) {
                const majorData = school.majors?.find(m => m.name === majorName);
                if (majorData) {
                    pathwayQuota = majorData.quota[pathwayKey] ?? 0;
                }
            } else if (!isSmk && school.jalurKuota) {
                pathwayQuota = school.jalurKuota[pathwayKey] ?? 0;
            }

            const usageKey = isSmk ? `${schoolId}-${majorName}-${jalur}` : `${schoolId}-${jalur}`;

            for (const applicant of groupApplicants) {
                let currentUsage = quotaUsage[usageKey] || 0;
                if (currentUsage < pathwayQuota) {
                    currentUsage++;
                    quotaUsage[usageKey] = currentUsage;

                    const placedApplicant = applicantMap.get(applicant.id);
                    if (placedApplicant) {
                        placedApplicant.peringkat = currentUsage;
                        placedApplicant.diterimaDiSekolahId = schoolId;
                    }
                }
            }
        }
        
        // 6. Prepare for the next round with only the applicants who haven't been placed yet.
        applicantsToProcess = applicantsToProcess.filter(app => !applicantMap.get(app.id)?.diterimaDiSekolahId);
        if (applicantsToProcess.length === 0) break;
    }

    // 7. Save the final results.
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, Array.from(applicantMap.values()));
}


/**
 * Initializes the applicants data in localStorage if it doesn't already exist.
 */
export function initializeApplicantsData(): void {
  const existingData = getFromLocalStorage<Applicant[]>(APPLICANTS_STORAGE_KEY, []);
  if (existingData.length === 0) {
    const initialData = generateAllMockApplicants();
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, initialData);
  }
}

/**
 * Gets all applicants from localStorage.
 * @returns An array of all applicants.
 */
export function getApplicants(): Applicant[] {
  return getFromLocalStorage<Applicant[]>(APPLICANTS_STORAGE_KEY, []);
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
    const oldStatus = applicants[index].statusVerifikasi;
    const oldPrestasi = applicants[index].nilaiPrestasi;
    
    applicants[index] = updatedApplicant;
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, applicants);
    
    const statusChanged = oldStatus !== updatedApplicant.statusVerifikasi && (oldStatus === 'Terverifikasi' || updatedApplicant.statusVerifikasi === 'Terverifikasi');
    const prestasiChanged = updatedApplicant.jalur === 'Prestasi' && oldPrestasi !== updatedApplicant.nilaiPrestasi;

    if(statusChanged || prestasiChanged) {
        recalculateAllRanks();
    }
  } else {
    console.error("Applicant not found for update");
  }
}

/**
 * Creates or updates an applicant record after they complete the registration flow.
 * @param progress The registration progress object from localStorage.
 * @param creds The login credentials of the current user.
 * @returns The created or updated applicant object.
 */
export function createOrUpdateApplicantFromRegistration(progress: RegistrationProgress, creds: LoginCredentials): Applicant {
  if (!progress.biodata || !progress.pathway || !progress.schoolSelections) {
    throw new Error("Data pendaftaran tidak lengkap untuk disubmit.");
  }

  const applicants = getApplicants();
  
  // Check if this NISN is already used by another system user.
  const allUsers = getUsers();
  const conflictingUser = allUsers.find(u => u.username.toLowerCase() === creds.username!.toLowerCase() && u.role !== 'applicant');
  if (conflictingUser) {
      throw new Error(`NISN ${creds.username} sudah terdaftar sebagai pengguna sistem (${conflictingUser.role}). Harap hubungi administrator.`);
  }
  
  // Find an existing application, including those marked 'Dibatalkan'
  const existingApplicant = applicants.find(a => a.nisn === creds.username);
  
  const allSchools = getSchools();
  const originSchool = allSchools.find(s => s.namaSekolah === progress.biodata!.previousSchool);
  const submissionTime = new Date().toISOString();

  const applicantDataFromProgress = {
    fullName: progress.biodata.fullName,
    nisn: progress.biodata.nisn,
    asalSekolahId: originSchool?.id || 'unknown-origin',
    asalSekolahNama: progress.biodata.previousSchool,
    sekolahTujuanId: progress.schoolSelections[0].schoolId,
    sekolahTujuanNama: getSchoolById(progress.schoolSelections[0].schoolId)?.namaSekolah || 'Unknown Destination',
    schoolSelections: progress.schoolSelections,
    jalur: progress.pathway,
    statusVerifikasi: 'Menunggu Verifikasi' as const,
    submissionTimestamp: submissionTime,
    rejectionReason: undefined,
    documentStatuses: {},
    peringkat: null,
    diterimaDiSekolahId: null,
    nilaiPrestasi: undefined,
    nilaiTambahanPilihan: 0,
    
    // Detailed biodata
    nik: progress.biodata.nik,
    placeOfBirth: progress.biodata.placeOfBirth,
    dateOfBirth: progress.biodata.dateOfBirth,
    gender: progress.biodata.gender,
    religion: progress.biodata.religion,
    streetName: progress.biodata.streetName,
    rtRw: progress.biodata.rtRw,
    village: progress.biodata.village,
    subdistrict: progress.biodata.subdistrict,
    district: progress.biodata.district,
    province: progress.biodata.province,
    fatherName: progress.biodata.fatherName,
    fatherDateOfBirth: progress.biodata.fatherDateOfBirth,
    fatherOccupation: progress.biodata.fatherOccupation,
    fatherIncome: progress.biodata.fatherIncome,
    motherName: progress.biodata.motherName,
    motherDateOfBirth: progress.biodata.motherDateOfBirth,
    motherOccupation: progress.biodata.motherOccupation,
    motherIncome: progress.biodata.motherIncome,
    guardianName: progress.biodata.guardianName,
    contactNumber: progress.biodata.contactNumber,
    profilePhotoDataUri: progress.profilePhotoDataUri,
    semesterGrades: progress.biodata.semesterGrades,
  };

  if (existingApplicant) {
    const updatedApplicant = { ...existingApplicant, ...applicantDataFromProgress, activityHistory: [
      ...(existingApplicant.activityHistory || []),
      { type: 'REGISTRATION_COMPLETED', timestamp: submissionTime, actor: progress.biodata.fullName },
    ]};
    updateApplicant(updatedApplicant);
    return updatedApplicant;
  } else {
    const newApplicant: Applicant = {
      ...applicantDataFromProgress,
      id: `app-${creds.username}`,
      semesterGrades: progress.biodata.semesterGrades,
      activityHistory: [
        { type: 'REGISTRATION_COMPLETED', timestamp: submissionTime, actor: progress.biodata.fullName },
      ]
    };
    const updatedApplicants = [...applicants, newApplicant];
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, updatedApplicants);
    return newApplicant;
  }
}

/**
 * Withdraws an application by setting its status to "Dibatalkan".
 * This preserves the applicant's history but allows them to re-register.
 * @param applicantId The ID of the applicant withdrawing.
 */
export function withdrawApplication(applicantId: string): void {
  const applicant = getApplicantById(applicantId);
  if (!applicant) {
    throw new Error("Pendaftar tidak ditemukan untuk dibatalkan.");
  }
  
  if (applicant.statusVerifikasi === 'Terverifikasi') {
    throw new Error("Tidak dapat membatalkan pendaftaran yang sudah terverifikasi.");
  }

  const newEvent: ActivityEvent = {
    type: 'APPLICATION_WITHDRAWN',
    timestamp: new Date().toISOString(),
    actor: applicant.fullName,
    details: 'Pendaftar mencabut berkas untuk mendaftar ulang.',
  };
  
  const updatedApplicant: Applicant = {
    ...applicant,
    statusVerifikasi: "Dibatalkan",
    // Reset fields to allow re-registration to overwrite them
    peringkat: null,
    diterimaDiSekolahId: null,
    activityHistory: [...(applicant.activityHistory || []), newEvent],
  };

  updateApplicant(updatedApplicant);
  recalculateAllRanks();
}

/**
 * Deletes an applicant from the list based on their NISN.
 * This is a hard delete, primarily for admin purposes.
 * @param nisn The NISN of the applicant to delete.
 * @returns True if an applicant was deleted, false otherwise.
 */
export function deleteApplicantByNisn(nisn: string): boolean {
  let applicants = getApplicants();
  const initialLength = applicants.length;
  const updatedApplicants = applicants.filter(app => app.nisn !== nisn);
  
  if (updatedApplicants.length < initialLength) {
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, updatedApplicants);
    recalculateAllRanks();
    return true;
  }
  
  return false;
}
