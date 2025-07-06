
'use client';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';
import type { SystemSettings } from './localStorage';

const SETTINGS_STORAGE_KEY = 'systemSettings_v1';

const initialSettings: SystemSettings = {
  isApplicantLoginLocked: false,
};

export const initializeSystemSettings = (): void => {
  const existingSettings = getFromLocalStorage<SystemSettings | null>(SETTINGS_STORAGE_KEY, null);
  if (existingSettings === null) {
    saveToLocalStorage(SETTINGS_STORAGE_KEY, initialSettings);
  }
};

export function getSystemSettings(): SystemSettings {
  return getFromLocalStorage<SystemSettings>(SETTINGS_STORAGE_KEY, initialSettings);
}

export function updateSystemSettings(newSettings: Partial<SystemSettings>): void {
  const currentSettings = getSystemSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  saveToLocalStorage(SETTINGS_STORAGE_KEY, updatedSettings);
}
