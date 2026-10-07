import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';
import { SleepQuality } from '../services/api';
import { Activity, Droplets, Moon, Sun, Plus, CheckCircle2 } from 'lucide-react';

export const TrackersCard: React.FC = () => {
  const {
    sleepRecords,
    hydrationRecords,
    environmentalRecords,
    addHydrationRecord,
    addSleepRecord,
    addEnvironmentalRecord,
  } = useDashboard();
  const { showSuccess, showError } = useToast();

  const latestHydration = hydrationRecords[0]?.water_consumed ?? 2400;
  const latestSleep = sleepRecords[0]?.sleep_hours ?? 8;
  const latestSleepQuality = sleepRecords[0]?.sleep_quality ?? 'GOOD';
  const latestSun = environmentalRecords[0]?.sun_exposure_hours ?? 2;

  // Form states
  const [waterAmount, setWaterAmount] = useState<number>(latestHydration);
  const [sleepHours, setSleepHours] = useState<number>(latestSleep);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(latestSleepQuality);
  const [sunHours, setSunHours] = useState<number>(latestSun);

  const [loadingHydration, setLoadingHydration] = useState<boolean>(false);
  const [loadingSleep, setLoadingSleep] = useState<boolean>(false);
  const [loadingSun, setLoadingSun] = useState<boolean>(false);

  const hydrationTargetPercent = Math.round((latestHydration / 3000) * 100);

  // Submit Handlers
  const handleLogHydration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (waterAmount <= 0) {
      showError('Please enter a valid water amount in ml.');
      return;
    }
    setLoadingHydration(true);
    try {
      await addHydrationRecord({ water_consumed: Number(waterAmount) });
      showSuccess(`Logged ${waterAmount} ml water intake!`);
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to log hydration record.');
    } finally {
      setLoadingHydration(false);
    }
  };

  const handleLogSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sleepHours < 0 || sleepHours > 24) {
      showError('Please enter sleep duration between 0 and 24 hours.');
      return;
    }
    setLoadingSleep(true);
    try {
      await addSleepRecord({
        sleep_hours: Number(sleepHours),
        sleep_quality: sleepQuality,
      });
      showSuccess(`Logged ${sleepHours} hours of sleep (${sleepQuality})!`);
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to log sleep record.');
    } finally {
      setLoadingSleep(false);
    }
  };

  const handleLogSun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sunHours < 0 || sunHours > 24) {
      showError('Please enter sun exposure duration between 0 and 24 hours.');
      return;
    }
    setLoadingSun(true);
    try {
      await addEnvironmentalRecord({ sun_exposure_hours: Number(sunHours) });
      showSuccess(`Logged ${sunHours} hours of sun exposure!`);
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to log sun exposure record.');
    } finally {
      setLoadingSun(false);
    }
  };

  const getSunLevelTag = (hrs: number) => {
    if (hrs <= 1) return { label: 'Low Exposure', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (hrs <= 3) return { label: 'Moderate Exposure', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'High UV Exposure', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const sunTag = getSunLevelTag(latestSun);

  return (
    <div id="section-trackers" className="sample-card card-3d-interactive">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-0.5">
            <Activity size={14} />
            <span>Daily Telemetry</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Daily Biometric Telemetry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Today's measurements help AuraSkin understand your current skin environment.
          </p>
        </div>
      </div>

      {/* 3 Interactive Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 💧 Hydration Reporting Card */}
        <form
          onSubmit={handleLogHydration}
          className="p-5 bg-gradient-to-b from-blue-50/60 to-white rounded-2xl border border-blue-100/90 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-blue-500 text-white rounded-lg">
                  <Droplets size={16} />
                </div>
                <span>Hydration</span>
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                {hydrationTargetPercent}% Target
              </span>
            </div>

            {/* Animated Water Level Visual */}
            <div className="p-3 bg-white rounded-xl border border-blue-100 mb-4 text-center">
              <div className="text-3xl font-extrabold text-blue-950">{latestHydration} ml</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Daily Target: 3000 ml</div>
              <div className="w-full bg-blue-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(hydrationTargetPercent, 100)}%` }}
                />
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">Water Consumed (ml)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={waterAmount}
              onChange={(e) => setWaterAmount(Number(e.target.value))}
              className="w-full text-xs mb-3"
              placeholder="e.g. 2500"
              required
            />

            <div className="flex gap-1.5 mb-4 flex-wrap">
              {[250, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setWaterAmount((prev) => prev + amount)}
                  className="px-2.5 py-1 text-xs font-bold bg-blue-100/80 text-blue-800 rounded-lg hover:bg-blue-200/80 border border-blue-200 transition-all flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>{amount} ml</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingHydration}
            className="btn-primary w-full py-2 text-xs justify-center"
          >
            {loadingHydration ? 'Logging...' : 'Log Hydration'}
          </button>
        </form>

        {/* 😴 Sleep Reporting Card */}
        <form
          onSubmit={handleLogSleep}
          className="p-5 bg-gradient-to-b from-indigo-50/60 to-white rounded-2xl border border-indigo-100/90 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Moon size={16} />
                </div>
                <span>Sleep Restoration</span>
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                {latestSleepQuality}
              </span>
            </div>

            {/* Circular Sleep Indicator Visual */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 mb-4 text-center">
              <div className="text-3xl font-extrabold text-indigo-950">{latestSleep} hrs</div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                Restorative Sleep Quality: {latestSleepQuality}
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Duration (hrs)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full text-xs mb-3"
              placeholder="e.g. 8.0"
              required
            />

            <label className="block text-xs font-bold text-slate-700 mb-1">Sleep Quality</label>
            <select
              value={sleepQuality}
              onChange={(e) => setSleepQuality(e.target.value as SleepQuality)}
              className="w-full text-xs mb-4"
            >
              <option value="POOR">Poor (Frequent Wakeups)</option>
              <option value="FAIR">Fair (Slightly Restless)</option>
              <option value="GOOD">Good (Restful Sleep)</option>
              <option value="EXCELLENT">Excellent (Deep & Refreshing)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingSleep}
            className="btn-primary w-full py-2 text-xs justify-center"
          >
            {loadingSleep ? 'Logging...' : 'Log Sleep'}
          </button>
        </form>

        {/* ☀️ Sun Exposure Reporting Card */}
        <form
          onSubmit={handleLogSun}
          className="p-5 bg-gradient-to-b from-amber-50/60 to-white rounded-2xl border border-amber-100/90 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <Sun size={16} />
                </div>
                <span>Sun Exposure</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${sunTag.color}`}>
                {sunTag.label}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-100 mb-4 text-center">
              <div className="text-3xl font-extrabold text-amber-950">{latestSun} hrs</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Outdoor UV Exposure</div>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">Sun Exposure (hrs)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
              className="w-full text-xs mb-3"
              placeholder="e.g. 2.0"
              required
            />

            <div className="flex gap-1.5 mb-4 flex-wrap">
              {[0.5, 1, 2, 4].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setSunHours(hrs)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    sunHours === hrs
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-100/80 text-amber-800 border-amber-200 hover:bg-amber-200'
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingSun}
            className="btn-primary w-full py-2 text-xs justify-center"
          >
            {loadingSun ? 'Logging...' : 'Log Sun Exposure'}
          </button>
        </form>
      </div>
    </div>
  );
};
