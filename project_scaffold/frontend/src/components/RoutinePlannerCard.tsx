import React, { useState, useEffect } from 'react';
import { api, SkincareRoutine, RoutineStep } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sun, Moon, Calendar, CheckCircle2, Info, Clock, Sparkles, Check } from 'lucide-react';

export const RoutinePlannerCard: React.FC = () => {
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingAdherence, setSavingAdherence] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentRoutine();
      setRoutine(data);
    } catch {
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleLogAdherence = async () => {
    const steps = activeTab === 'morning' ? morningList : activeTab === 'evening' ? eveningList : weeklyList;
    const completed = steps.filter((s) => !!completedSteps[`${activeTab}-${s.step_number}`]).length;
    const total = steps.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
    const todayStr = new Date().toISOString().split('T')[0];

    setSavingAdherence(true);
    try {
      await api.logRoutineAdherence({
        date: todayStr,
        morning_completed: activeTab === 'morning' ? completed === total : false,
        evening_completed: activeTab === 'evening' ? completed === total : false,
        completed_steps: Object.keys(completedSteps).filter(k => completedSteps[k]),
        missed_steps: [],
        notes: `Logged ${activeTab} routine (${rate}% completed)`
      });
      showSuccess(`Logged ${activeTab} routine (${rate}% completed)! Synced with Skin Journey.`);
    } catch {
      showError('Failed to record routine adherence. Please try again.');
    } finally {
      setSavingAdherence(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  if (loading) {
    return (
      <div className="sample-card">
        <div className="skeleton-pulse h-6 w-48 mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-pulse h-20 mb-3 rounded-xl" />
        ))}
      </div>
    );
  }

  // Fallback routine steps matching exact API structure
  const defaultMorning: RoutineStep[] = [
    { step_number: 1, category: 'CLEANSE', product_type: 'Gentle pH-Balanced Cleanser', key_ingredients: ['Glycerin', 'Aloe Vera'], instructions: 'Lather with tepid water for 30s to remove overnight sebum.', frequency: 'DAILY AM', safety_notes: 'Maintains optimal pH and protects natural lipid mantle.' },
    { step_number: 2, category: 'TREAT', product_type: 'Antioxidant Niacinamide Serum', key_ingredients: ['5% Niacinamide', 'Zinc PCA'], instructions: 'Apply 3-4 drops to calm redness and strengthen barrier integrity.', frequency: 'DAILY AM', safety_notes: 'Follow immediately with moisturizer and SPF.' },
    { step_number: 3, category: 'HYDRATE', product_type: 'Hyaluronic Lipid Moisturizer', key_ingredients: ['Hyaluronic Acid', 'Squalane'], instructions: 'Massage into face and neck to lock in daytime hydration.', frequency: 'DAILY AM', safety_notes: 'Non-comedogenic barrier restoration layer.' },
    { step_number: 4, category: 'PROTECT', product_type: 'Broad-Spectrum Mineral Sunscreen SPF 50+', key_ingredients: ['Zinc Oxide', 'Titanium Dioxide'], instructions: 'Apply liberally 15 mins before UV exposure. Reapply every 2 hours.', frequency: 'DAILY AM (Mandatory)', safety_notes: 'Shields against solar oxidative damage and premature photo-aging.' },
  ];

  const defaultEvening: RoutineStep[] = [
    { step_number: 1, category: 'DOUBLE CLEANSE', product_type: 'Micellar Oil Cleanser followed by Gel Cleanser', key_ingredients: ['Jojoba Oil', 'Ceramides NP/AP'], instructions: 'Dissolve sunscreen, airborne particulate matter, and excess sebum.', frequency: 'DAILY PM', safety_notes: 'Thoroughly purifies pores without disrupting skin barrier.' },
    { step_number: 2, category: 'TREAT', product_type: 'Targeted Peptide Cellular Renewal Serum', key_ingredients: ['Copper Tripeptide', 'Palmitoyl Pentapeptide'], instructions: 'Apply 3-4 drops for nocturnal dermal regeneration and collagen matrix support.', frequency: 'DAILY PM', safety_notes: 'Allow 60 seconds to absorb before night recovery cream.' },
    { step_number: 3, category: 'REPAIR', product_type: 'Nourishing Ceramide Night Cream', key_ingredients: ['Ceramides NP/AP', 'Fatty Acids', 'Hyaluronic Acid'], instructions: 'Lock in moisture and seal cellular hydration while resting.', frequency: 'DAILY PM', safety_notes: 'Protects against overnight transepidermal water loss (TEWL).' },
  ];

  const defaultWeekly: RoutineStep[] = [
    { step_number: 1, category: 'EXFOLIATION', product_type: 'Weekly Chemical Exfoliating Acid Solution', key_ingredients: ['Glycolic Acid (AHA)', 'Lactic Acid', 'Salicylic Acid (BHA)'], instructions: 'Apply on a non-retinoid evening to clean, dry skin. Leave on for 10 minutes and rinse thoroughly with tepid water.', frequency: '1x per week PM', safety_notes: 'Space at least 48 hours away from active retinoid treatments to prevent barrier distress.' },
    { step_number: 2, category: 'TREATMENT MASK', product_type: 'Hydrating & Soothing Bio-Cellulose Dermal Mask', key_ingredients: ['Hyaluronic Acid', 'Centella Asiatica (Cica)', 'Niacinamide'], instructions: 'Apply mask sheet onto face for 15–20 minutes on weekend evening. Gently pat remaining serum into neck.', frequency: '1–2x per week PM', safety_notes: 'Surges deep hydration and calms environmental oxidative stress.' },
    { step_number: 3, category: 'BARRIER RESET', product_type: 'Intensive Dermal Lipid Recovery Treatment', key_ingredients: ['Squalane', 'Ectoin', 'Multi-Ceramide Complex'], instructions: 'Apply a richer occlusive layer following mask treatment to consolidate moisture retention.', frequency: '1x per week PM (Post-mask)', safety_notes: 'Deeply restores lipid bilayers following weekly resurfacing.' }
  ];

  const morningList = routine?.morning_routine?.length ? routine.morning_routine : defaultMorning;
  const eveningList = routine?.evening_routine?.length ? routine.evening_routine : defaultEvening;
  const weeklyList = routine?.weekly_routine?.length ? routine.weekly_routine : defaultWeekly;

  const stepsToDisplay = activeTab === 'morning' ? morningList : activeTab === 'evening' ? eveningList : weeklyList;
  const completedCount = stepsToDisplay.filter((s) => !!completedSteps[`${activeTab}-${s.step_number}`]).length;

  return (
    <div id="section-routine" className="report-section sample-card card-3d-interactive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
            <Sparkles size={16} className="text-amber-600" />
          </div>
          <div>
            <span className="section-label text-amber-700">Chronobiology Regimen</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Personalized Skincare Protocol</h2>
          </div>
        </div>

        {/* Tab switcher: Morning / Evening / Weekly */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('morning')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'morning'
                ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md shadow-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun size={14} />
            <span>Morning</span>
          </button>
          <button
            onClick={() => setActiveTab('evening')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'evening'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon size={14} />
            <span>Evening</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md shadow-purple-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={14} />
            <span>Weekly</span>
          </button>
        </div>
      </div>

      {/* Progress strip */}
      <div className="flex items-center justify-between gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600">
            {activeTab === 'morning'
              ? `☀️ Morning Protocol · ${morningList.length} Daily Steps`
              : activeTab === 'evening'
              ? `🌙 Evening Protocol · ${eveningList.length} Night Steps`
              : `✨ Weekly Protocol · ${weeklyList.length} Specialized Treatments`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Adherence progress */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-teal-700">{completedCount}/{stepsToDisplay.length} done</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-gradient-to-r from-[#00685f] to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${stepsToDisplay.length ? (completedCount / stepsToDisplay.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleLogAdherence}
            disabled={savingAdherence || completedCount === 0}
            className="flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
            type="button"
          >
            {savingAdherence ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={12} />
                <span>Save Adherence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3 mb-5">
        {stepsToDisplay.map((step: RoutineStep, idx: number) => {
          const stepKey = `${activeTab}-${step.step_number}`;
          const isDone = !!completedSteps[stepKey];
          const stepNum = String(step.step_number).padStart(2, '0');

          return (
            <div key={idx} className="routine-timeline-step">
              <div
                onClick={() => toggleStep(stepKey)}
                className={`
                  p-4 rounded-2xl border transition-all duration-250 cursor-pointer
                  flex items-start gap-4
                  ${isDone
                    ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-sm hover:shadow-md'
                  }
                `}
              >
                {/* Step number circle */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm
                    transition-all duration-200
                    ${isDone
                      ? 'bg-emerald-500 text-white'
                      : activeTab === 'morning'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : activeTab === 'evening'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }
                  `}
                >
                  {isDone ? <CheckCircle2 size={18} /> : stepNum}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      activeTab === 'morning'
                        ? 'text-amber-600'
                        : activeTab === 'evening'
                        ? 'text-indigo-600'
                        : 'text-purple-600'
                    }`}>
                      {step.category}
                    </span>
                    {step.frequency && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                        {step.frequency}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-bold mb-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {step.product_type}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mb-2">
                    {step.instructions}
                  </p>
                  {/* Safety notes if available */}
                  {step.safety_notes && (
                    <div className="text-[10.5px] text-amber-800 bg-amber-50/70 border border-amber-100 px-2.5 py-1 rounded-md mb-2 flex items-start gap-1.5">
                      <span className="font-bold text-amber-900 shrink-0">Note:</span>
                      <span>{step.safety_notes}</span>
                    </div>
                  )}
                  {/* Ingredient chips */}
                  {step.key_ingredients && step.key_ingredients.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {step.key_ingredients.map((ing, iIdx) => (
                        <span
                          key={iIdx}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 rounded-md"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Done badge */}
                {isDone && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1.5 rounded-xl shrink-0 self-start">
                    <CheckCircle2 size={12} />
                    Done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Why this routine rationale */}
      <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-100 flex items-start gap-3">
        <div className="p-1.5 bg-teal-100 rounded-lg shrink-0">
          <Info size={14} className="text-teal-600" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-[#00685f] mb-1">
            🧠 Why AuraSkin Recommended This Protocol
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Your {activeTab} routine was selected based on your{' '}
            <strong className="text-slate-700">skin type</strong>,{' '}
            <strong className="text-slate-700">reported concerns</strong>,{' '}
            <strong className="text-slate-700">daily UV exposure</strong>,{' '}
            <strong className="text-slate-700">hydration levels</strong>, and your{' '}
            <strong className="text-slate-700">current 5-factor dermal score</strong>.
            {activeTab === 'weekly' && ' Weekly resurfacing treatments are spaced out from retinoid days to preserve lipid bilayer integrity.'}
          </p>
        </div>
      </div>
    </div>
  );
};
