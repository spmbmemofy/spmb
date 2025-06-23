
'use client';

import { getFromLocalStorage, saveToLocalStorage, type LoginCredentials, type RegistrationProgress } from './localStorage';
import { generateAllMockApplicants } from './mockData';
import type { Applicant, Jalur } from './types';
import { getSchoolById, getSchools } from './schoolService';

const APPLICANTS_STORAGE_KEY = 'allApplicantsData';

/**
 * Initializes the applicants data by creating an empty array if one doesn't exist.
 */
export function initializeApplicantsData(): void {
  const storedApplicants = getFromLocalStorage<Applicant[] | null>(APPLICANTS_STORAGE_KEY, null);
  if (storedApplicants === null) {
    const initialData = generateAllMockApplicants(); // This will be an empty array
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
    applicants[index] = updatedApplicant;
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, applicants);
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
    const updatedApplicant = { ...existingApplicant, ...applicantDataFromProgress };
    updateApplicant(updatedApplicant);
    return updatedApplicant;
  } else {
    const newApplicant: Applicant = {
      ...applicantDataFromProgress,
      id: `app-${creds.username}`,
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
    return true;
  }
  
  return false;
}
