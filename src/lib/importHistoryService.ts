
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';

export interface ImportLog {
  id: string;
  schoolId: string;
  timestamp: string; // ISO String
  fileName: string;
  successCount: number;
  errorCount: number;
  errors: string[];
}

const HISTORY_STORAGE_KEY = 'importHistoryData_v1';

/**
 * Initializes the import history data in localStorage if it doesn't already exist.
 */
export const initializeImportHistory = (): void => {
  const existingHistory = getFromLocalStorage<ImportLog[]>(HISTORY_STORAGE_KEY, []);
  if (!Array.isArray(existingHistory)) {
    saveToLocalStorage(HISTORY_STORAGE_KEY, []);
  }
};

/**
 * Retrieves all import history logs for a specific school.
 * @param schoolId The ID of the school to retrieve history for.
 * @returns An array of import logs for the specified school, sorted by most recent first.
 */
export function getImportHistory(schoolId: string): ImportLog[] {
  const allHistory = getFromLocalStorage<ImportLog[]>(HISTORY_STORAGE_KEY, []);
  return allHistory
    .filter(log => log.schoolId === schoolId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Adds a new import log to the history.
 * @param newLog The log entry to add, without an ID.
 * @returns The newly created log entry with an ID.
 */
export function addImportLog(newLog: Omit<ImportLog, 'id'>): ImportLog {
  const allHistory = getFromLocalStorage<ImportLog[]>(HISTORY_STORAGE_KEY, []);
  const logWithId: ImportLog = {
    ...newLog,
    id: `log-${Date.now()}-${Math.random()}`
  };
  const updatedHistory = [...allHistory, logWithId];
  saveToLocalStorage(HISTORY_STORAGE_KEY, updatedHistory);
  return logWithId;
}
