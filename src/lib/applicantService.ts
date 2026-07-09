
'use client';

import { getFromLocalStorage, saveToLocalStorage, type LoginCredentials, type RegistrationProgress } from './localStorage';
import { generateAllMockApplicants } from './mockData';
import type { Applicant, ActivityEvent } from './types';
import { getSchoolById, getSchools, type School } from './schoolService';
import { getUsers } from './userService';
import { getJalur } from './pathwayService';
import { getStages } from './stageService';

const APPLICANTS_STORAGE_KEY = 'allApplicantsData_v1';

function getApplicantRT(applicant: Applicant): string | null {
    if (!applicant.rtRw) return null;
    const match = applicant.rtRw.replace(/rt/i, '').match(/\d+/);
    return match ? parseInt(match[0], 10).toString() : null;
}

export function isPriority(applicant: Applicant, school: School): boolean {
    if (applicant.jalur !== 'Domisili' || !school.priorityDomiciles || school.priorityDomiciles.length === 0 || !applicant.village) {
        return false;
    }

    const priorityRule = school.priorityDomiciles.find(p => p.village === applicant.village);
    if (!priorityRule) {
        return false;
    }

    if (priorityRule.rts.length === 0) {
        return true;
    }
    
    const applicantRT = getApplicantRT(applicant);
    if (!applicantRT) {
        return false;
    }

    const normalizeRT = (rtStr: string | undefined): string | null => {
        if (!rtStr) return null;
        const match = rtStr.replace(/rt/i, '').match(/\d+/);
        return match ? parseInt(match[0], 10).toString() : null;
    };

    const normalizedSchoolRts = priorityRule.rts.map(rt => normalizeRT(rt)).filter(Boolean);

    return normalizedSchoolRts.includes(applicantRT);
}

export function calculateApplicantScore(applicant: Applicant, schoolId: string): number {
    const allJalur = getJalur();
    const allStages = getStages();
    
    const applicantJalur = allJalur.find(j => j.name === applicant.jalur);
    if (!applicantJalur) {
        const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
        const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
        return totalNilaiRapor + nilaiPrestasi;
    }
    
    const applicantStage = allStages.find(s => s.id === applicantJalur.tahapId);
    
    const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
    const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
    
    let nilaiTambahan = 0;
    const isFirstChoice = applicant.schoolSelections && applicant.schoolSelections[0]?.schoolId === schoolId;
    
    if (isFirstChoice && applicantStage && applicantStage.name === 'Tahap 1') {
        nilaiTambahan = 25;
    }
    
    return totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
}

export function initializeApplicantsData(): void {
  const existingData = getFromLocalStorage<Applicant[]>(APPLICANTS_STORAGE_KEY, []);
  if (existingData.length === 0) {
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, []);
  }
}

export function getApplicants(): Applicant[] {
  return getFromLocalStorage<Applicant[]>(APPLICANTS_STORAGE_KEY, []);
}

export function getApplicantById(id: string): Applicant | undefined {
  const applicants = getApplicants();
  return applicants.find(app => app.id === id);
}

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
        // Ranks should be recalculated here in a full implementation
    }
  }
}

export function createOrUpdateApplicantFromRegistration(progress: RegistrationProgress, creds: LoginCredentials): Applicant {
  if (!progress.biodata || !progress.pathway || !progress.schoolSelections) {
    throw new Error("Data pendaftaran tidak lengkap untuk disubmit.");
  }

  const applicants = getApplicants();
  const submissionTime = new Date().toISOString();
  const allSchools = getSchools();
  const originSchool = allSchools.find(s => s.namaSekolah === progress.biodata!.previousSchool);

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
    nilaiPrestasi: progress.pathway === 'Prestasi' && progress.achievements && progress.achievements.length > 0
      ? Math.max(...progress.achievements.map((a: any) => a.score || 0))
      : 0,
    nilaiTambahanPilihan: (progress.schoolSelections && progress.schoolSelections.length > 0) ? 25 : 0,
    
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
    achievements: progress.achievements,
  };

  const existingApplicant = applicants.find(a => a.nisn === creds.username);

  if (existingApplicant) {
    const updatedApplicant = { ...existingApplicant, ...applicantDataFromProgress, id: existingApplicant.nisn, activityHistory: [
      ...(existingApplicant.activityHistory || []),
      { type: 'REGISTRATION_COMPLETED', timestamp: submissionTime, actor: progress.biodata.fullName },
    ]};
    updateApplicant(updatedApplicant);
    return updatedApplicant;
  } else {
    const newApplicant: Applicant = {
      ...applicantDataFromProgress,
      id: progress.biodata.nisn,
      activityHistory: [
        { type: 'REGISTRATION_COMPLETED', timestamp: submissionTime, actor: progress.biodata.fullName },
      ]
    };
    const updatedApplicants = [...applicants, newApplicant];
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, updatedApplicants);
    return newApplicant;
  }
}

export function withdrawApplication(applicantId: string): void {
  const applicant = getApplicantById(applicantId);
  if (!applicant) throw new Error("Pendaftar tidak ditemukan.");
  
  const newEvent: ActivityEvent = {
    type: 'APPLICATION_WITHDRAWN',
    timestamp: new Date().toISOString(),
    actor: applicant.fullName,
    details: 'Pendaftar mencabut berkas pendaftaran.',
  };
  
  const updatedApplicant: Applicant = {
    ...applicant,
    statusVerifikasi: "Dibatalkan",
    peringkat: null,
    diterimaDiSekolahId: null,
    activityHistory: [...(applicant.activityHistory || []), newEvent],
  };

  updateApplicant(updatedApplicant);
}

export function deleteApplicantById(applicantId: string): boolean {
  let applicants = getApplicants();
  const initialLength = applicants.length;
  const updatedApplicants = applicants.filter(app => app.id !== applicantId);
  if (updatedApplicants.length < initialLength) {
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, updatedApplicants);
    return true;
  }
  return false;
}

export function deleteApplicantByNisn(nisn: string): boolean {
  let applicants = getApplicants();
  const initialLength = applicants.length;
  const newApplicants = applicants.filter(app => app.nisn !== nisn);
  if (newApplicants.length < applicants.length) {
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, newApplicants);
    return true;
  }
  return false;
}

/**
 * Deletes all applicants who have the given school as one of their selections.
 * Returns the count of deleted applicants.
 */
export function deleteApplicantsBySchoolId(schoolId: string): number {
  let applicants = getApplicants();
  const initialLength = applicants.length;
  const remaining = applicants.filter(app =>
    app.sekolahTujuanId !== schoolId &&
    !(app.schoolSelections || []).some(sel => sel.schoolId === schoolId)
  );
  if (remaining.length < initialLength) {
    saveToLocalStorage(APPLICANTS_STORAGE_KEY, remaining);
  }
  return initialLength - remaining.length;
}

