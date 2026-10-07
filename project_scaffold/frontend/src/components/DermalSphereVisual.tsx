import React from 'react';
import { ShieldCheck, Droplets, Sun, Sparkles } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const DermalSphereVisual: React.FC = () => {
  const { skinProfile, hydrationRecords, environmentalRecords } = useDashboard();

  const skinType = skinProfile?.skin_type || 'NORMAL';
  const latestWater = hydrationRecords[0]?.water_consumed ?? 2400;
  const latestSun = environmentalRecords[0]?.sun_exposure_hours ?? 2;

  const hydrationLevelPercent = Math.min(Math.round((latestWater / 3000) * 100), 100);

  return (
    <div className="sample-card card-3d-interactive overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Dermal Matrix Layer Visual
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-900/80 text-teal-200 border border-teal-700">
          Conceptual Barrier Model
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Animated Dermal Sphere Ring */}
        <div className="relative flex items-center justify-center w-36 h-36 shrink-0">
          {/* Outer glowing orbital ring */}
          <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-sky-400/20 animate-pulse-glow" />

          {/* Dermal Layer Core Sphere */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-700 via-emerald-600 to-sky-400 p-0.5 shadow-lg shadow-teal-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-2">
              <ShieldCheck size={22} className="text-teal-400 mb-0.5" />
              <span className="text-[11px] font-extrabold text-teal-100 uppercase tracking-tight">
                {skinType}
              </span>
              <span className="text-[9px] text-teal-300/80">Barrier Active</span>
            </div>
          </div>
        </div>

        {/* Matrix Indicators */}
        <div className="flex-1 space-y-3 text-xs w-full">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets size={15} className="text-sky-400" />
              <span className="text-slate-200 font-semibold">Epidermal Hydration</span>
            </div>
            <span className="font-extrabold text-sky-400">{hydrationLevelPercent}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun size={15} className="text-amber-400" />
              <span className="text-slate-200 font-semibold">Solar Exposure Load</span>
            </div>
            <span className="font-extrabold text-amber-400">{latestSun} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
