export interface AchievementConfig {
  active: boolean;
  scores: Record<string, number>;
}

export interface AchievementSettings {
  rapor: AchievementConfig;
  tka: AchievementConfig;
  osis: AchievementConfig;
  lomba_official: AchievementConfig;
  lomba_other: AchievementConfig;
  tahfidz: AchievementConfig;
  non_islam: AchievementConfig;
  pramuka_beregu: AchievementConfig;
  pramuka_garuda: AchievementConfig;
  buku: AchievementConfig;
}

const LOCAL_STORAGE_KEY = 'admissionPortal_achievementSettings';

const defaultSettings: AchievementSettings = {
  rapor: {
    active: true,
    scores: {
      vii_juara_1: 40,
      vii_juara_2: 35,
      vii_juara_3: 30,
      viii_juara_1: 50,
      viii_juara_2: 45,
      viii_juara_3: 40,
      ix_juara_1: 60,
      ix_juara_2: 55,
      ix_juara_3: 50,
    }
  },
  tka: {
    active: true,
    scores: {
      peringkat_1: 65,
      peringkat_2: 60,
      peringkat_3: 55,
    }
  },
  osis: {
    active: true,
    scores: {
      ketua: 55
    }
  },
  lomba_official: {
    active: true,
    scores: {
      internasional_juara_1: 100,
      internasional_juara_2: 95,
      internasional_juara_3: 90,
      nasional_juara_1: 85,
      nasional_juara_2: 80,
      nasional_juara_3: 75,
      provinsi_juara_1: 70,
      provinsi_juara_2: 65,
      provinsi_juara_3: 60,
      kabupaten_juara_1: 55,
      kabupaten_juara_2: 50,
      kabupaten_juara_3: 45,
    }
  },
  lomba_other: {
    active: true,
    scores: {
      internasional_juara_1: 80,
      internasional_juara_2: 75,
      internasional_juara_3: 70,
      nasional_juara_1: 65,
      nasional_juara_2: 60,
      nasional_juara_3: 55,
      provinsi_juara_1: 50,
      provinsi_juara_2: 45,
      provinsi_juara_3: 40,
    }
  },
  tahfidz: {
    active: true,
    scores: {
      juz_1: 35,
      juz_2: 45,
      juz_3: 55,
      juz_4: 65,
      juz_5: 75,
      juz_6: 85,
      juz_7: 95,
      juz_8: 100,
    }
  },
  non_islam: {
    active: true,
    scores: {
      kabupaten_juara_1: 15,
      kabupaten_juara_2: 10,
      kabupaten_juara_3: 5,
      provinsi_juara_1: 30,
      provinsi_juara_2: 25,
      provinsi_juara_3: 20,
      nasional_juara_1: 45,
      nasional_juara_2: 40,
      nasional_juara_3: 35,
    }
  },
  pramuka_beregu: {
    active: true,
    scores: {
      kwarcab_juara_1: 45,
      kwarcab_juara_2: 35,
      kwarcab_juara_3: 25,
      kwarda_juara_1: 60,
      kwarda_juara_2: 50,
      kwarda_juara_3: 45,
      kwarnas_juara_1: 75,
      kwarnas_juara_2: 65,
      kwarnas_juara_3: 55,
    }
  },
  pramuka_garuda: {
    active: true,
    scores: {
      rakit: 20,
      terap: 30,
      garuda: 40,
    }
  },
  buku: {
    active: true,
    scores: {
      isbn: 50
    }
  }
};

export function getAchievementSettings(): AchievementSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  try {
    const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      // Save default
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    // Deep merge to ensure all keys exist
    const parsed = JSON.parse(data);
    const merged = { ...defaultSettings };
    (Object.keys(defaultSettings) as Array<keyof AchievementSettings>).forEach(key => {
      if (parsed[key]) {
        merged[key] = {
          active: parsed[key].active !== undefined ? parsed[key].active : defaultSettings[key].active,
          scores: { ...defaultSettings[key].scores, ...parsed[key].scores }
        };
      }
    });
    return merged;
  } catch (e) {
    console.error('Error loading achievement settings:', e);
    return defaultSettings;
  }
}

export function saveAchievementSettings(settings: AchievementSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving achievement settings:', e);
  }
}

export function resetAchievementSettings(): AchievementSettings {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (e) {
      console.error('Error resetting achievement settings:', e);
    }
  }
  return defaultSettings;
}
