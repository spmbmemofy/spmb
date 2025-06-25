
'use client';

import { getFromLocalStorage, saveToLocalStorage, type LoginCredentials, type RegistrationProgress } from './localStorage';
import { generateAllMockApplicants, jalurOptionsPlain } from './mockData';
import type { Applicant, Jalur } from './types';
import { getSchoolById, getSchools, type School } from './schoolService';
import { getUsers } from './userService';

const APPLICANTS_STORAGE_KEY = 'allApplicantsData_v3';

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
    const quotaUsage: Record<string, Record<Jalur, number>> = {};
    allSchoolsData.forEach(school => {
        if (school.jalurKuota) {
            quotaUsage[school.id] = { Afirmasi: 0, Mutasi: 0, Prestasi: 0, Domisili: 0 };
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
        // Group remaining applicants by the school and pathway they are applying to in this round.
        const applicationsByGroup: Record<string, Applicant[]> = {}; // Key: "schoolId-jalur"

        for (const applicant of applicantsToProcess) {
            const selection = applicant.schoolSelections[choiceIndex];
            if (!selection) continue;

            const groupId = `${selection.schoolId}-${applicant.jalur}`;
            if (!applicationsByGroup[groupId]) {
                applicationsByGroup[groupId] = [];
            }
            applicationsByGroup[groupId].push(applicant);
        }

        // 5. For each group, sort by score and attempt to place them.
        for (const groupId in applicationsByGroup) {
            const [schoolId, jalur] = groupId.split('-');
            const school = allSchoolsData.find(s => s.id === schoolId);
            if (!school || !school.jalurKuota) continue;

            const groupApplicants = applicationsByGroup[groupId];

            // Sort applicants by score. The +25 bonus is only for the first choice round.
            groupApplicants.sort((a, b) => calculateScore(b, choiceIndex === 0) - calculateScore(a, choiceIndex === 0));

            const pathwayKey = jalur.toLowerCase() as keyof typeof school.jalurKuota;
            const pathwayQuota = school.jalurKuota[pathwayKey] ?? 0;
            
            for (const applicant of groupApplicants) {
                let currentUsage = quotaUsage[schoolId][jalur as Jalur];
                if (currentUsage < pathwayQuota) {
                    currentUsage++;
                    quotaUsage[schoolId][jalur as Jalur] = currentUsage;

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
        if (applicantsToProcess.length === 0) break; // Exit early if everyone is placed.
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
  
  const existingApplicant = applicants.find(a => a.nisn === creds.username);
  const allSchools = getSchools();
  const originSchool = allSchools.find(s => s.namaSekolah === progress.biodata!.previousSchool);

  const applicantDataFromProgress = {
    noRegistrasi: creds.username!,
    fullName: progress.biodata.fullName,
    nisn: progress.biodata.nisn,
    asalSekolahId: originSchool?.id || 'unknown-origin',
    asalSekolahNama: progress.biodata.previousSchool,
    sekolahTujuanId: progress.schoolSelections[0].schoolId,
    sekolahTujuanNama: getSchoolById(progress.schoolSelections[0].schoolId)?.namaSekolah || 'Unknown Destination',
    schoolSelections: progress.schoolSelections,
    jalur: progress.pathway as Jalur,
    semesterGrades: progress.biodata.semesterGrades,
    statusVerifikasi: 'Menunggu Verifikasi' as const,
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
  };

  if (existingApplicant) {
    const updatedApplicant = { ...existingApplicant, ...applicantDataFromProgress, activityHistory: [
      ...(existingApplicant.activityHistory || []),
      { type: 'REGISTRATION_COMPLETED', timestamp: new Date().toISOString(), actor: progress.biodata.fullName },
    ]};
    updateApplicant(updatedApplicant);
    return updatedApplicant;
  } else {
    const newApplicant: Applicant = {
      ...applicantDataFromProgress,
      id: `app-${creds.username}`,
      activityHistory: [
        { type: 'REGISTRATION_COMPLETED', timestamp: new Date().toISOString(), actor: progress.biodata.fullName },
      ]
    };
    const updatedApplicants = [...applicants, newApplicant];
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, updatedApplicants);
    return newApplicant;
  }
}

/**
 * Deletes an applicant from the list based on their NISN.
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
