import React from 'react';
import { Sparkles, Shield, Droplets, Moon, Sun, Heart } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const DermalOrbVisual: React.FC = () => {
  const { skinProfile, lifestyle, sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  return (
    <div className="sample-card card-3d-interactive overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white border border-teal-800/80 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Dermal Intelligence Orb
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-900/80 text-teal-200 border border-teal-700">
          5-Node Telemetry Cluster
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Floating Translucent Dermal Orb */}
        <div className="relative flex items-center justify-center w-36 h-36 shrink-0">
          <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-sky-400/20 animate-pulse-glow" />

          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-2">
              <Shield size={22} className="text-teal-400 mb-0.5" />
              <span className="text-[11px] font-extrabold text-teal-100 uppercase tracking-tight">
                {skinProfile?.skin_type || 'PROFILE'}
              </span>
              <span className="text-[9px] text-teal-300/80">Telemetry Active</span>
            </div>
          </div>
        </div>

        {/* 5-Node Telemetry Status Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold w-full">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-teal-300">
            <Sparkles size={13} />
            <span>Profile: {skinProfile ? '✓ Set' : 'Pending'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-rose-300">
            <Heart size={13} />
            <span>Lifestyle: {lifestyle ? '✓ Set' : 'Pending'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-sky-300">
            <Droplets size={13} />
            <span>Hydration: {hydrationRecords.length ? '✓ Logged' : 'Pending'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-indigo-300">
            <Moon size={13} />
            <span>Sleep: {sleepRecords.length ? '✓ Logged' : 'Pending'}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 col-span-2 text-amber-300 justify-center">
            <Sun size={13} />
            <span>UV Load: {environmentalRecords.length ? '✓ Logged' : 'Pending'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
