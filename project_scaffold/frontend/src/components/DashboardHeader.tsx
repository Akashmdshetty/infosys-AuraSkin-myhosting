import React from 'react';
import { ParticleBackground } from './ParticleBackground';
import { Sparkles, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';

interface DashboardHeaderProps {
  onNavigateToDataEntry?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNavigateToDataEntry }) => {
  const { user } = useAuth();
  const { skinProfile, lifestyle, sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  // Calculate actual completion percentage from backend data
  let completedSections = 0;
  if (skinProfile) completedSections++;
  if (lifestyle) completedSections++;
  if (sleepRecords.length > 0) completedSections++;
  if (hydrationRecords.length > 0) completedSections++;
  if (environmentalRecords.length > 0) completedSections++;

  const completionPercentage = Math.round((completedSections / 5) * 100);

  // Date formatting
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/30 to-sky-50/30 rounded-2xl border border-teal-100 p-6 md:p-8 mb-6 shadow-sm">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100/60 border border-teal-200/80 rounded-full text-xs font-bold text-[#00685f] uppercase tracking-wider mb-2 backdrop-blur-sm">
            <Sparkles size={13} className="text-teal-600" />
            <span>AI Dermal Health Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Devika'} 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-xl">
            Here's your personalized skin intelligence overview, chronobiology metrics, and daily dermal telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Today's Date Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/90 border border-slate-200/80 rounded-xl shadow-xs backdrop-blur-md text-xs font-semibold text-slate-700">
            <Calendar size={14} className="text-teal-600" />
            <span>{todayFormatted}</span>
          </div>

          {/* Assessment Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/90 border border-slate-200/80 rounded-xl shadow-xs backdrop-blur-md text-xs font-semibold text-slate-700">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Live Assessment</span>
          </div>

          {/* Profile Completion Pill */}
          <button
            onClick={onNavigateToDataEntry}
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <Activity size={14} />
            <span>{completionPercentage}% Profile Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
