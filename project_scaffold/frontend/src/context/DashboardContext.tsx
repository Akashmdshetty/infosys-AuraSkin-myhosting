import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  api,
  SkinProfile,
  LifestyleProfile,
  SleepRecord,
  HydrationRecord,
  EnvironmentalExposure,
  SkinType,
  StressLevel,
  SleepQuality,
} from '../services/api';
import { useAuth } from './AuthContext';

interface DashboardContextType {
  skinProfile: SkinProfile | null;
  lifestyle: LifestyleProfile | null;
  sleepRecords: SleepRecord[];
  hydrationRecords: HydrationRecord[];
  environmentalRecords: EnvironmentalExposure[];
  loadingData: boolean;

  fetchSkinProfile: () => Promise<SkinProfile | null>;
  saveSkinProfile: (data: {
    skin_type: SkinType;
    skin_concerns?: string[];
    allergies?: string;
    sensitivities?: string;
  }) => Promise<SkinProfile>;

  fetchLifestyle: () => Promise<LifestyleProfile | null>;
  saveLifestyle: (data: {
    stress_level: StressLevel;
    lifestyle_habits?: string;
  }) => Promise<LifestyleProfile>;

  fetchSleepRecords: () => Promise<SleepRecord[]>;
  addSleepRecord: (data: {
    sleep_hours: number;
    sleep_quality: SleepQuality;
  }) => Promise<SleepRecord>;

  fetchHydrationRecords: () => Promise<HydrationRecord[]>;
  addHydrationRecord: (data: {
    water_consumed: number;
    humidity?: number | null;
  }) => Promise<HydrationRecord>;

  fetchEnvironmentalRecords: () => Promise<EnvironmentalExposure[]>;
  addEnvironmentalRecord: (data: {
    sun_exposure_hours: number;
  }) => Promise<EnvironmentalExposure>;

  refreshAll: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [skinProfile, setSkinProfile] = useState<SkinProfile | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleProfile | null>(null);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [hydrationRecords, setHydrationRecords] = useState<HydrationRecord[]>([]);
  const [environmentalRecords, setEnvironmentalRecords] = useState<EnvironmentalExposure[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const fetchSkinProfile = useCallback(async (): Promise<SkinProfile | null> => {
    try {
      const data = await api.getSkinProfile();
      setSkinProfile(data);
      return data;
    } catch {
      setSkinProfile(null);
      return null;
    }
  }, []);

  const fetchLifestyle = useCallback(async (): Promise<LifestyleProfile | null> => {
    try {
      const data = await api.getLifestyle();
      setLifestyle(data);
      return data;
    } catch {
      setLifestyle(null);
      return null;
    }
  }, []);

  const fetchSleepRecords = useCallback(async (): Promise<SleepRecord[]> => {
    try {
      const data = await api.getSleepRecords();
      const sorted = [...data].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      setSleepRecords(sorted);
      return sorted;
    } catch {
      setSleepRecords([]);
      return [];
    }
  }, []);

  const fetchHydrationRecords = useCallback(async (): Promise<HydrationRecord[]> => {
    try {
      const data = await api.getHydrationRecords();
      const sorted = [...data].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      setHydrationRecords(sorted);
      return sorted;
    } catch {
      setHydrationRecords([]);
      return [];
    }
  }, []);

  const fetchEnvironmentalRecords = useCallback(async (): Promise<EnvironmentalExposure[]> => {
    try {
      const data = await api.getEnvironmentalRecords();
      const sorted = [...data].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      setEnvironmentalRecords(sorted);
      return sorted;
    } catch {
      setEnvironmentalRecords([]);
      return [];
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      await Promise.all([
        fetchSkinProfile(),
        fetchLifestyle(),
        fetchSleepRecords(),
        fetchHydrationRecords(),
        fetchEnvironmentalRecords(),
      ]);
    } finally {
      setLoadingData(false);
    }
  }, [
    isAuthenticated,
    fetchSkinProfile,
    fetchLifestyle,
    fetchSleepRecords,
    fetchHydrationRecords,
    fetchEnvironmentalRecords,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setSkinProfile(null);
      setLifestyle(null);
      setSleepRecords([]);
      setHydrationRecords([]);
      setEnvironmentalRecords([]);
    }
  }, [isAuthenticated, user?.id, refreshAll]);

  const saveSkinProfile = async (data: {
    skin_type: SkinType;
    skin_concerns?: string[];
    allergies?: string;
    sensitivities?: string;
  }): Promise<SkinProfile> => {
    let result: SkinProfile;
    if (skinProfile) {
      result = await api.updateSkinProfile(data);
    } else {
      result = await api.createSkinProfile(data);
    }
    setSkinProfile(result);
    return result;
  };

  const saveLifestyle = async (data: {
    stress_level: StressLevel;
    lifestyle_habits?: string;
  }): Promise<LifestyleProfile> => {
    let result: LifestyleProfile;
    if (lifestyle) {
      result = await api.updateLifestyle(data);
    } else {
      result = await api.createLifestyle(data);
    }
    setLifestyle(result);
    return result;
  };

  const addSleepRecord = async (data: {
    sleep_hours: number;
    sleep_quality: SleepQuality;
  }): Promise<SleepRecord> => {
    const created = await api.createSleepRecord(data);
    setSleepRecords((prev) => [created, ...prev]);
    return created;
  };

  const addHydrationRecord = async (data: {
    water_consumed: number;
    humidity?: number | null;
  }): Promise<HydrationRecord> => {
    const created = await api.createHydrationRecord(data);
    setHydrationRecords((prev) => [created, ...prev]);
    return created;
  };

  const addEnvironmentalRecord = async (data: {
    sun_exposure_hours: number;
  }): Promise<EnvironmentalExposure> => {
    const created = await api.createEnvironmentalRecord(data);
    setEnvironmentalRecords((prev) => [created, ...prev]);
    return created;
  };

  return (
    <DashboardContext.Provider
      value={{
        skinProfile,
        lifestyle,
        sleepRecords,
        hydrationRecords,
        environmentalRecords,
        loadingData,
        fetchSkinProfile,
        saveSkinProfile,
        fetchLifestyle,
        saveLifestyle,
        fetchSleepRecords,
        addSleepRecord,
        fetchHydrationRecords,
        addHydrationRecord,
        fetchEnvironmentalRecords,
        addEnvironmentalRecord,
        refreshAll,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
