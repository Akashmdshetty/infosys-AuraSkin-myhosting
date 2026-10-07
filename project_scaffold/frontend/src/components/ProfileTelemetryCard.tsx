import React from 'react';
import { SleepRecord, HydrationRecord, EnvironmentalExposure } from '../services/api';
import { Droplets, Moon, Sun, ArrowRight, Activity, Clock } from 'lucide-react';

interface ProfileTelemetryCardProps {
  hydrationRecords: HydrationRecord[];
  sleepRecords: SleepRecord[];
  environmentalRecords: EnvironmentalExposure[];
}

export const ProfileTelemetryCard: React.FC<ProfileTelemetryCardProps> = ({
  hydrationRecords,
  sleepRecords,
  environmentalRecords,
}) => {
  const latestHydration = hydrationRecords.length > 0 ? hydrationRecords[0] : null;
  const latestSleep = sleepRecords.length > 0 ? sleepRecords[0] : null;
  const latestSun = environmentalRecords.length > 0 ? environmentalRecords[0] : null;

  const hasAnyTelemetry = !!(latestHydration || latestSleep || latestSun);

  const handleNavigateDataEntry = () => {
    window.location.hash = 'data-entry';
  };

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
            <Activity size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block">
              DAILY LOGS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              RECENT SKIN TELEMETRY
            </h3>
          </div>
        </div>

        {hasAnyTelemetry && (
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Clock size={11} className="text-teal-600" />
            Live Synced
          </span>
        )}
      </div>

      {hasAnyTelemetry ? (
        <div className="space-y-3">
          {/* 3 Telemetry Pillars */}
          <div className="grid grid-cols-3 gap-3">
            {/* Hydration */}
            <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 text-center">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-1">
                <Droplets size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Hydration
              </span>
              <span className="text-sm font-black text-cyan-900 mt-0.5 block">
                {latestHydration ? `${latestHydration.water_consumed} L` : '--'}
              </span>
            </div>

            {/* Sleep */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-1">
                <Moon size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Sleep
              </span>
              <span className="text-sm font-black text-indigo-900 mt-0.5 block">
                {latestSleep ? `${latestSleep.sleep_hours} hrs` : '--'}
              </span>
            </div>

            {/* UV Exposure */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1">
                <Sun size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                UV Sun
              </span>
              <span className="text-sm font-black text-amber-900 mt-0.5 block">
                {latestSun ? `${latestSun.sun_exposure_hours} hrs` : '--'}
              </span>
            </div>
          </div>

          {/* Historical Logs Info */}
          <div className="text-[11px] text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Logged Entries:</span>
            <span className="font-bold text-slate-700">
              {hydrationRecords.length} Hydration • {sleepRecords.length} Sleep • {environmentalRecords.length} UV
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-6 px-3 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <Droplets size={28} className="text-cyan-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">No Recent Telemetry</h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
            Record your daily water consumption, sleep duration, and UV exposure to refine your composite score.
          </p>
        </div>
      )}

      {/* Action */}
      <button
        type="button"
        onClick={handleNavigateDataEntry}
        className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-2xs group"
      >
        <span>Update Daily Logs</span>
        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
