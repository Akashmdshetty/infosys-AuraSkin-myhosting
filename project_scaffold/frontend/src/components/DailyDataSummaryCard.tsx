import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Activity, Droplets, Moon, Sun } from 'lucide-react';

export const DailyDataSummaryCard: React.FC = () => {
  const { sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  const latestHydration = hydrationRecords[0]?.water_consumed ?? 2400;
  const latestSleep = sleepRecords[0]?.sleep_hours ?? 8;
  const latestSun = environmentalRecords[0]?.sun_exposure_hours ?? 2;

  const hydrationPercent = Math.min(Math.round((latestHydration / 3000) * 100), 150);
  const sleepPercent = Math.min(Math.round((latestSleep / 8) * 100), 125);
  const sunPercent = Math.min(Math.round((latestSun / 4) * 100), 100);

  return (
    <div className="sample-card card-3d-interactive">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-teal-50 text-[#00685f] rounded-lg border border-teal-100">
          <Activity size={16} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Telemetry Status</span>
          <h3 className="text-base font-bold text-slate-900">Today's Data Summary</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Hydration bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5 text-blue-900">
              <Droplets size={14} className="text-blue-500" /> Hydration Level
            </span>
            <span className="text-blue-700">{hydrationPercent}% ({latestHydration} ml)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(hydrationPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Sleep bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5 text-indigo-900">
              <Moon size={14} className="text-indigo-500" /> Sleep Recovery
            </span>
            <span className="text-indigo-700">{sleepPercent}% ({latestSleep} hrs)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(sleepPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* UV Exposure bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5 text-amber-900">
              <Sun size={14} className="text-amber-500" /> Solar Exposure Load
            </span>
            <span className="text-amber-700">{sunPercent}% ({latestSun} hrs)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${sunPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
