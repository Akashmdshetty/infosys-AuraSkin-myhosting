import React from 'react';
import { ParticleBackground } from './ParticleBackground';
import { Database, Sparkles, Activity } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const DataEntryHeader: React.FC = () => {
  const { skinProfile, lifestyle, sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  let completedCount = 0;
  if (skinProfile) completedCount++;
  if (lifestyle) completedCount++;
  if (sleepRecords.length > 0) completedCount++;
  if (hydrationRecords.length > 0) completedCount++;
  if (environmentalRecords.length > 0) completedCount++;

  const completionPercentage = Math.round((completedCount / 5) * 100);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-sky-50/40 rounded-2xl border border-teal-100 p-6 md:p-8 mb-6 shadow-sm">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100/60 border border-teal-200/80 rounded-full text-xs font-bold text-[#00685f] uppercase tracking-wider mb-2 backdrop-blur-sm">
            <Database size={13} className="text-teal-600" />
            <span>Data & Biometric Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Data Entry & Daily Logs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-xl">
            Update your skin profile and daily telemetry to improve the accuracy of your dermal health assessment.
          </p>
        </div>

        {/* Telemetry Status Visual */}
        <div className="flex items-center gap-3">
          <div className="p-4 bg-white/90 border border-slate-200/80 rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-3">
            <div className="p-2.5 bg-[#00685f] text-white rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telemetry Completeness</div>
              <div className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span>{completionPercentage}% Complete</span>
                <Activity size={14} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
