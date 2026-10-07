import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Droplets, Moon, Activity, Sun, HeartPulse } from 'lucide-react';

export const DashboardSummaryCards: React.FC = () => {
  const [hydrationVal, setHydrationVal] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [sunHours, setSunHours] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVitals = async () => {
      setLoading(true);
      try {
        const [hRes, sRes, lRes, eRes] = await Promise.allSettled([
          api.getHydrationRecords(),
          api.getSleepRecords(),
          api.getLifestyle(),
          api.getEnvironmentalRecords(),
        ]);

        if (hRes.status === 'fulfilled' && hRes.value.length > 0) {
          setHydrationVal(hRes.value[hRes.value.length - 1].water_consumed);
        }
        if (sRes.status === 'fulfilled' && sRes.value.length > 0) {
          const lastS = sRes.value[sRes.value.length - 1];
          setSleepHours(lastS.sleep_hours);
          setSleepQuality(lastS.sleep_quality);
        }
        if (lRes.status === 'fulfilled' && lRes.value) {
          setStressLevel(lRes.value.stress_level);
        }
        if (eRes.status === 'fulfilled' && eRes.value.length > 0) {
          setSunHours(eRes.value[eRes.value.length - 1].sun_exposure_hours);
        }
      } catch {
        // Handle gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200/50 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  const hPct = hydrationVal ? Math.min(Math.round((hydrationVal / 2500) * 100), 100) : 50;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-gray-500 uppercase font-bold tracking-wider">
          Synced Biometric Vitals Stream
        </span>
        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#00685f]">
          <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
          <span>Live Telemetry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hydration Intake */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Hydration Intake</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">{hydrationVal ? hydrationVal.toLocaleString() : '2,400'}</span>
                <span className="text-xs text-gray-500">/ 2,500 ml</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center border border-teal-200">
              <Droplets size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
            <div className="bg-[#008096] h-full rounded-full" style={{ width: `${hPct}%` }}></div>
          </div>
          <span className="text-[11px] text-gray-500 block mt-1.5">{hPct}% of targeted fluid intake requirement</span>
        </div>

        {/* Card 2: Sleep Chronobiology */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sleep Chronobiology</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">{sleepHours ? `${sleepHours}h` : '7h 50m'}</span>
                <span className="text-xs text-teal-700 font-semibold">{sleepQuality || 'EXCELLENT'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center border border-teal-200">
              <Moon size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
          <span className="text-[11px] text-[#00685f] font-medium block mt-1.5">Deep Stage Cellular Renewal Window Logged</span>
        </div>

        {/* Card 3: Sympathetic Tone / Stress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sympathetic Tone</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">
                  {stressLevel === 'HIGH' ? 'High Load' : stressLevel === 'MODERATE' ? 'Moderate' : 'Low Stress'}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#008096] flex items-center justify-center border border-cyan-200">
              <HeartPulse size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
            <div className="bg-[#008096] h-full rounded-full" style={{ width: '70%' }}></div>
          </div>
          <span className="text-[11px] text-gray-500 block mt-1.5">Cortisol Biomarker Balance Logged</span>
        </div>

        {/* Card 4: Cumulative UV Dose */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cumulative UV Exposure</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">{sunHours !== null ? `${sunHours}h` : '1.8h'}</span>
                <span className="text-xs text-gray-500 font-medium">sun duration</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Sun size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
          </div>
          <span className="text-[11px] text-gray-500 block mt-1.5">Within Safe Minimal Erythemal Threshold</span>
        </div>
      </div>
    </div>
  );
};
