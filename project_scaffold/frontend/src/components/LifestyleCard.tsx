import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';
import { StressLevel } from '../services/api';
import { HeartPulse, Check, AlertCircle, Save, Loader2, CheckCircle2 } from 'lucide-react';

const STRESS_LEVELS: { level: StressLevel; label: string; desc: string; color: string; border: string; bg: string }[] = [
  { level: 'LOW', label: 'Low Stress', desc: 'Calm, restorative baseline & optimal recovery', color: 'text-emerald-700', border: 'border-emerald-500', bg: 'bg-emerald-50/80' },
  { level: 'MODERATE', label: 'Moderate Stress', desc: 'Manageable daily pace with occasional spikes', color: 'text-amber-700', border: 'border-amber-500', bg: 'bg-amber-50/80' },
  { level: 'HIGH', label: 'High Stress', desc: 'Elevated stress & fatigue may affect recovery', color: 'text-rose-700', border: 'border-rose-400', bg: 'bg-rose-50/80' },
];

const PRESET_HABITS = [
  'Regular morning routine',
  'Consistent sleep schedule',
  'Daily exercise',
  'Balanced diet',
  'Adequate water intake',
];

export const LifestyleCard: React.FC = () => {
  const { lifestyle, saveLifestyle, loadingData } = useDashboard();
  const { showSuccess, showError } = useToast();

  const [stressLevel, setStressLevel] = useState<StressLevel>('MODERATE');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'Regular morning routine',
    'Adequate water intake',
  ]);

  const [saving, setSaving] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (lifestyle) {
      setStressLevel(lifestyle.stress_level || 'MODERATE');
      if (lifestyle.lifestyle_habits) {
        const parsed = lifestyle.lifestyle_habits.split(',').map((h) => h.trim()).filter(Boolean);
        if (parsed.length) setSelectedHabits(parsed);
      }
    }
  }, [lifestyle]);

  const handleToggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (!stressLevel) {
      setFieldError('Please select a stress level indicator.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        stress_level: stressLevel,
        lifestyle_habits: selectedHabits.join(', ') || undefined,
      };

      await saveLifestyle(payload);
      showSuccess('✓ Lifestyle & stress matrix updated successfully.');
    } catch (err: any) {
      const msg = err.message || 'Unable to update lifestyle data. Please try again.';
      setFieldError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingData && !lifestyle) {
    return (
      <div id="section-lifestyle" className="sample-card text-center py-10 text-slate-500 animate-pulse">
        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-rose-500" />
        <span>Loading lifestyle matrix...</span>
      </div>
    );
  }

  return (
    <div id="section-lifestyle" className="sample-card card-3d-interactive">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-0.5">
            <HeartPulse size={14} />
            <span>Wellness Matrix</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Lifestyle & Stress Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily lifestyle factors can influence your skin recovery and resilience.
          </p>
        </div>

        {lifestyle && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
            <CheckCircle2 size={13} />
            <span>Active Matrix</span>
          </span>
        )}
      </div>

      {fieldError && (
        <div className="field-error-alert mb-5" role="alert">
          <AlertCircle size={16} />
          <span>{fieldError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Stress Level 3 Large Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Current Stress Level <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>Stress Indicator:</span>
              <span className="text-[#00685f]">
                {stressLevel === 'LOW' ? '● Low' : stressLevel === 'MODERATE' ? '● Moderate' : '● High'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STRESS_LEVELS.map(({ level, label, desc, color, border, bg }) => {
              const selected = stressLevel === level;
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => setStressLevel(level)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    selected
                      ? `${bg} ${border} shadow-sm transform -translate-y-1`
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-extrabold ${selected ? color : 'text-slate-900'}`}>
                        {label}
                      </span>
                      {selected && (
                        <span className="p-0.5 bg-[#00685f] text-white rounded-full">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Habits Selectable Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Active Daily Habits
            </label>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_HABITS.map((habit) => {
              const isSelected = selectedHabits.includes(habit);
              return (
                <button
                  type="button"
                  key={habit}
                  onClick={() => handleToggleHabit(habit)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-rose-50/80 border-rose-400 text-rose-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span>{habit}</span>
                  </span>
                  {isSelected && <Check size={14} className="text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lifestyle Save Action Container */}
        <div className="p-4 bg-gradient-to-r from-rose-50/80 via-teal-50/40 to-white rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-900">💖 Stress & Habit Recovery Index</div>
            <div className="text-[11px] text-slate-600">Updating your stress matrix recalculates your recovery score contribution.</div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2 px-5 whitespace-nowrap shrink-0"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Lifestyle Matrix</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
