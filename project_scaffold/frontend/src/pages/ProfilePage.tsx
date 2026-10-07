import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  SkinProfile,
  LifestyleProfile,
  SleepRecord,
  HydrationRecord,
  EnvironmentalExposure,
  SkinHealthScore,
  SkinAssessment,
} from '../services/api';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileHeroCard } from '../components/ProfileHeroCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { ProfileDermalCard } from '../components/ProfileDermalCard';
import { ProfileIntelligenceCard } from '../components/ProfileIntelligenceCard';
import { ProfileTelemetryCard } from '../components/ProfileTelemetryCard';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { ProfileAccountCard } from '../components/ProfileAccountCard';
import { ProfileQuickActions } from '../components/ProfileQuickActions';
import { Lock, AlertTriangle, RefreshCw } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showError } = useToast();

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [skinProfile, setSkinProfile] = useState<SkinProfile | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleProfile | null>(null);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [hydrationRecords, setHydrationRecords] = useState<HydrationRecord[]>([]);
  const [environmentalRecords, setEnvironmentalRecords] = useState<EnvironmentalExposure[]>([]);
  const [score, setScore] = useState<SkinHealthScore | null>(null);
  const [assessment, setAssessment] = useState<SkinAssessment | null>(null);

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        skinRes,
        lifeRes,
        sleepRes,
        hydraRes,
        envRes,
        scoreRes,
        assessRes,
      ] = await Promise.allSettled([
        api.getSkinProfile(),
        api.getLifestyle(),
        api.getSleepRecords(),
        api.getHydrationRecords(),
        api.getEnvironmentalRecords(),
        api.getSkinScore(),
        api.getLatestAssessment(),
      ]);

      if (skinRes.status === 'fulfilled') setSkinProfile(skinRes.value);
      if (lifeRes.status === 'fulfilled') setLifestyle(lifeRes.value);
      if (sleepRes.status === 'fulfilled') {
        const sorted = [...sleepRes.value].sort(
          (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        setSleepRecords(sorted);
      }
      if (hydraRes.status === 'fulfilled') {
        const sorted = [...hydraRes.value].sort(
          (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        setHydrationRecords(sorted);
      }
      if (envRes.status === 'fulfilled') {
        const sorted = [...envRes.value].sort(
          (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        setEnvironmentalRecords(sorted);
      }
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value);
      if (assessRes.status === 'fulfilled') setAssessment(assessRes.value);
    } catch (err: any) {
      setError(err?.message || 'Unable to load complete profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, loadProfileData]);

  if (!user) {
    return (
      <div className="sample-card card-3d-interactive bg-white/95 max-w-lg mx-auto my-12 p-8 text-center rounded-2xl border border-slate-200 shadow-lg animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200/60 shadow-2xs">
          <Lock size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Please log in or create an account to manage your personal dermal profile and skin intelligence settings.
        </p>
      </div>
    );
  }

  const hasTelemetry =
    hydrationRecords.length > 0 || sleepRecords.length > 0 || environmentalRecords.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. Page Header with Particle Background & 3D Profile Orb */}
      <ProfileHeader onOpenEdit={() => setEditModalOpen(true)} />

      {/* Error state if failed */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadProfileData}
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 shrink-0"
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Profile Identity Hero Card */}
      <ProfileHeroCard user={user} onOpenEdit={() => setEditModalOpen(true)} />

      {/* 3. Dermal Profile & Skin Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileDermalCard skinProfile={skinProfile} />
        <ProfileIntelligenceCard score={score} assessment={assessment} />
      </div>

      {/* 4. Recent Telemetry & Profile Completion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileTelemetryCard
          hydrationRecords={hydrationRecords}
          sleepRecords={sleepRecords}
          environmentalRecords={environmentalRecords}
        />
        <ProfileCompletionCard
          hasSkinProfile={!!skinProfile}
          hasLifestyle={!!lifestyle}
          hasTelemetry={hasTelemetry}
          hasAssessment={!!assessment || !!score}
        />
      </div>

      {/* 5. Account Info & Security */}
      <ProfileAccountCard user={user} />

      {/* 6. Quick Actions Navigation Shortcuts */}
      <ProfileQuickActions />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onProfileUpdated={refreshUser}
      />
    </div>
  );
};
