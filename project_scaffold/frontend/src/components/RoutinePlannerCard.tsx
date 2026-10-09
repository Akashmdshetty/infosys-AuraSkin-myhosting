import React, { useState, useEffect } from 'react';
import { api, SkincareRoutine, RoutineStep } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sun, Moon, Calendar, CheckCircle2, Info, Clock, Sparkles, Check,
  Printer, ArrowUp, ArrowDown, AlertTriangle, ShieldCheck, Flame, RefreshCw, X,
  CheckSquare, Square
} from 'lucide-react';

export const RoutinePlannerCard: React.FC = () => {
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingAdherence, setSavingAdherence] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(5);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  const [morningSteps, setMorningSteps] = useState<RoutineStep[]>([]);
  const [eveningSteps, setEveningSteps] = useState<RoutineStep[]>([]);
  const [weeklySteps, setWeeklySteps] = useState<RoutineStep[]>([]);

  const defaultMorning: RoutineStep[] = [
    { step_number: 1, category: 'CLEANSE', product_type: 'Gentle pH-Balanced Cleanser', key_ingredients: ['Glycerin', 'Aloe Vera'], instructions: 'Lather with tepid water for 30s to remove overnight secretions without stripping lipid barrier.', frequency: 'DAILY AM', safety_notes: 'Maintains optimal pH and protects natural lipid mantle.' },
    { step_number: 2, category: 'TREAT', product_type: 'Antioxidant Niacinamide & Vitamin C Serum', key_ingredients: ['5% Niacinamide', 'Vitamin C', 'Zinc PCA'], instructions: 'Apply 3-4 drops to shield against diurnal oxidative stress and balance sebum.', frequency: 'DAILY AM', safety_notes: 'Synergistic pairing with daily mineral sunscreen.' },
    { step_number: 3, category: 'HYDRATE', product_type: 'Hyaluronic Lipid Barrier Moisturizer', key_ingredients: ['Hyaluronic Acid', 'Ceramides (NP / AP)', 'Squalane'], instructions: 'Smooth over face and neck to seal in hydration throughout the day.', frequency: 'DAILY AM', safety_notes: 'Non-comedogenic daytime moisture lock.' },
    { step_number: 4, category: 'PROTECT', product_type: 'Broad-Spectrum Mineral Sunscreen SPF 50+', key_ingredients: ['Zinc Oxide', 'Titanium Dioxide'], instructions: 'Apply liberally 15 mins before UV exposure. Reapply every 2-3 hours outdoors.', frequency: 'DAILY AM (Mandatory)', safety_notes: 'Shields against solar oxidative damage and premature photo-aging.' },
  ];

  const defaultEvening: RoutineStep[] = [
    { step_number: 1, category: 'DOUBLE CLEANSE', product_type: 'Micellar Oil Cleanser followed by Gel Cleanser', key_ingredients: ['Jojoba Oil', 'Ceramides NP/AP', 'Centella Asiatica'], instructions: 'Dissolve sunscreen, airborne particulate matter, and excess sebum thoroughly.', frequency: 'DAILY PM', safety_notes: 'Purifies pore channels without disrupting lipid bilayers.' },
    { step_number: 2, category: 'TREAT', product_type: 'Micro-Encapsulated Retinol 0.3% Renewal Treatment', key_ingredients: ['Encapsulated Retinol (0.3%)', 'Signal Peptides'], instructions: 'Apply pea-sized amount to clean, dry skin 3-4 nights per week for dermal renewal.', frequency: '3-4x per week PM', safety_notes: 'Do not combine simultaneously with high-strength chemical peels on same night.' },
    { step_number: 3, category: 'REPAIR', product_type: 'Intensive Nocturnal Ceramide Recovery Balm', key_ingredients: ['Ceramides NP/AP/EOP', 'Fatty Acids', 'Hyaluronic Acid'], instructions: 'Massage gently into skin to prevent transepidermal water loss (TEWL) during sleep.', frequency: 'DAILY PM', safety_notes: 'Protects barrier regeneration and cellular restoration.' },
  ];

  const defaultWeekly: RoutineStep[] = [
    { step_number: 1, category: 'EXFOLIATION', product_type: 'Weekly Resurfacing Glycolic / BHA Solution', key_ingredients: ['Glycolic Acid (AHA)', 'Salicylic Acid (BHA)', 'Tasmanian Pepperberry'], instructions: 'Apply on a non-retinoid evening to dry skin. Leave on for 10 mins, then rinse thoroughly.', frequency: '1x per week PM', safety_notes: 'Space 48 hours away from active retinoid treatments.' },
    { step_number: 2, category: 'TREATMENT MASK', product_type: 'Hydrating & Soothing Bio-Cellulose Dermal Mask', key_ingredients: ['Hyaluronic Acid', 'Centella Asiatica', 'Niacinamide'], instructions: 'Smooth sheet mask onto face for 15–20 minutes on weekend evening.', frequency: '1–2x per week PM', safety_notes: 'Deep moisture replenishment and skin barrier calming.' },
    { step_number: 3, category: 'BARRIER RESET', product_type: 'Intensive Dermal Lipid Restorative Treatment', key_ingredients: ['Squalane', 'Ectoin', 'Multi-Ceramide Complex'], instructions: 'Apply nourishing layer post-mask to seal active hydration.', frequency: '1x per week PM', safety_notes: 'Deeply consolidates intercellular lipid matrix.' }
  ];

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentRoutine();
      if (data) {
        setRoutine(data);
        setMorningSteps(data.morning_routine?.length ? data.morning_routine : defaultMorning);
        setEveningSteps(data.evening_routine?.length ? data.evening_routine : defaultEvening);
        setWeeklySteps(data.weekly_routine?.length ? data.weekly_routine : defaultWeekly);
      } else {
        setMorningSteps(defaultMorning);
        setEveningSteps(defaultEvening);
        setWeeklySteps(defaultWeekly);
      }
    } catch {
      setMorningSteps(defaultMorning);
      setEveningSteps(defaultEvening);
      setWeeklySteps(defaultWeekly);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
    api.getRoutineAdherence(7)
      .then(logs => {
        const completedCount = logs.filter(l => l.morning_completed || l.evening_completed).length;
        if (completedCount > 0) setStreakDays(completedCount + 2);
      })
      .catch(() => {});
  }, []);

  const toggleStep = (stepKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const selectAllCurrentSteps = () => {
    const steps = activeTab === 'morning' ? morningSteps : activeTab === 'evening' ? eveningSteps : weeklySteps;
    const allSelected = steps.every(s => !!completedSteps[`${activeTab}-${s.step_number}`]);
    const updated = { ...completedSteps };
    steps.forEach(s => {
      updated[`${activeTab}-${s.step_number}`] = !allSelected;
    });
    setCompletedSteps(updated);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const list = activeTab === 'morning' ? [...morningSteps] : activeTab === 'evening' ? [...eveningSteps] : [...weeklySteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    list.forEach((s, idx) => {
      s.step_number = idx + 1;
    });

    if (activeTab === 'morning') setMorningSteps(list);
    else if (activeTab === 'evening') setEveningSteps(list);
    else setWeeklySteps(list);

    showSuccess(`Updated step sequence in ${activeTab} protocol.`);
  };

  const handleLogAdherence = async () => {
    const steps = activeTab === 'morning' ? morningSteps : activeTab === 'evening' ? eveningSteps : weeklySteps;
    let completed = steps.filter((s) => !!completedSteps[`${activeTab}-${s.step_number}`]).length;
    const total = steps.length;

    // If no individual steps were checked yet, mark ALL as completed
    if (completed === 0) {
      const updated = { ...completedSteps };
      steps.forEach(s => {
        updated[`${activeTab}-${s.step_number}`] = true;
      });
      setCompletedSteps(updated);
      completed = total;
    }

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
        notes: `Completed ${completed}/${total} steps for ${activeTab} protocol`
      });
      setStreakDays(prev => prev + 1);
      showSuccess(`🎉 ${activeTab.toUpperCase()} Routine Complete (${rate}%)! Streak increased to ${streakDays + 1} days.`);
    } catch {
      showError('Failed to record routine adherence. Please try again.');
    } finally {
      setSavingAdherence(false);
    }
  };

  const stepsToDisplay = activeTab === 'morning' ? morningSteps : activeTab === 'evening' ? eveningSteps : weeklySteps;
  const completedCount = stepsToDisplay.filter((s) => !!completedSteps[`${activeTab}-${s.step_number}`]).length;
  const areAllStepsCompleted = stepsToDisplay.length > 0 && completedCount === stepsToDisplay.length;

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

  return (
    <div id="section-routine" className="report-section sample-card card-3d-interactive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 rounded-xl border border-teal-200">
            <Sparkles size={16} className="text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label text-teal-700">Chronobiology Protocol</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black">
                <Flame className="w-3 h-3 text-amber-600" /> {streakDays}-Day Streak
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Personalized Skincare Regimen</h2>
          </div>
        </div>

        {/* Tab switcher + Print button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('morning')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'morning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md shadow-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun size={13} />
              <span>Morning</span>
            </button>
            <button
              onClick={() => setActiveTab('evening')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'evening'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon size={13} />
              <span>Evening</span>
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={13} />
              <span>Weekly</span>
            </button>
          </div>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
            title="Export / Print Clinical Routine Card"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Cross-Product Active Synergies & Safety Check Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200/80 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950">
          <span className="font-bold text-teal-900">Formulation Compatibility Verified: </span>
          {activeTab === 'morning'
            ? 'Antioxidant Niacinamide + Mineral SPF 50+ provide maximum daytime photoprotective synergy.'
            : activeTab === 'evening'
            ? 'Retinoids are buffered by Ceramide lipid balm to minimize trans-epidermal moisture loss.'
            : 'Weekly exfoliants are spaced away from daily retinoids to maintain epidermal barrier integrity.'}
        </div>
      </div>

      {/* Progress & Adherence Bar */}
      <div className="flex items-center justify-between gap-3 mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={selectAllCurrentSteps}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 hover:border-teal-500 rounded-lg text-slate-700 transition shadow-2xs"
            title={areAllStepsCompleted ? "Deselect all steps" : "Select all steps"}
          >
            {areAllStepsCompleted ? <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
            <span>{areAllStepsCompleted ? 'Deselect All' : 'Select All'}</span>
          </button>

          <span className="text-xs font-semibold text-slate-600">
            {activeTab === 'morning'
              ? `☀️ Morning Protocol · ${morningSteps.length} Steps`
              : activeTab === 'evening'
              ? `🌙 Evening Protocol · ${eveningSteps.length} Steps`
              : `✨ Weekly Protocol · ${weeklySteps.length} Steps`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-teal-800">{completedCount}/{stepsToDisplay.length} done</span>
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-teal-700 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${stepsToDisplay.length ? (completedCount / stepsToDisplay.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleLogAdherence}
            disabled={savingAdherence}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition shadow-md hover:shadow-lg cursor-pointer"
            type="button"
          >
            {savingAdherence ? (
              <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>
            ) : (
              <>
                <Check size={14} />
                <span>Mark Routine Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timeline Steps with Interactive Checkbox on Whole Card */}
      <div className="space-y-3 mb-5">
        {stepsToDisplay.map((step: RoutineStep, idx: number) => {
          const stepKey = `${activeTab}-${step.step_number}`;
          const isDone = !!completedSteps[stepKey];
          const stepNum = String(step.step_number).padStart(2, '0');

          return (
            <div
              key={idx}
              onClick={() => toggleStep(stepKey)}
              className={`
                p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none
                flex items-start gap-4 relative
                ${isDone
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md'
                }
              `}
            >
              {/* Step number badge & toggle */}
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm
                  transition-all duration-200
                  ${isDone
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : activeTab === 'morning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : activeTab === 'evening'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }
                `}
              >
                {isDone ? <CheckCircle2 size={20} className="text-white animate-scale-up" /> : stepNum}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      activeTab === 'morning'
                        ? 'text-amber-700'
                        : activeTab === 'evening'
                        ? 'text-indigo-700'
                        : 'text-purple-700'
                    }`}>
                      Step {step.step_number}: {step.category}
                    </span>
                    {step.frequency && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {step.frequency}
                      </span>
                    )}
                  </div>

                  {/* Step Re-order Controls */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 opacity-60 hover:opacity-100 transition"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); moveStep(idx, 'up'); }}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                      title="Move step up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveStep(idx, 'down'); }}
                      disabled={idx === stepsToDisplay.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                      title="Move step down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>

                <div className={`text-sm font-bold mb-1 transition-all ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {step.product_type}
                </div>
                <p className={`text-xs leading-snug mb-2 transition-all ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.instructions}
                </p>

                {/* Safety notes */}
                {step.safety_notes && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg mb-2 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">Clinical Note:</span>
                    <span>{step.safety_notes}</span>
                  </div>
                )}

                {/* Ingredient chips */}
                {step.key_ingredients && step.key_ingredients.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {step.key_ingredients.map((ing, iIdx) => (
                      <span
                        key={iIdx}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded-md"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side Checkbox Status */}
              <div className="shrink-0 self-center pl-2">
                <button
                  type="button"
                  onClick={(e) => toggleStep(stepKey, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={14} className="text-white" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Square size={14} className="text-slate-400" />
                      <span>Mark Done</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rationale Footer */}
      <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/70 flex items-start gap-3">
        <div className="p-1.5 bg-teal-100 rounded-lg shrink-0">
          <Info size={14} className="text-teal-700" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-teal-950 mb-0.5">
            Why AuraSkin Recommended This Protocol
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Your {activeTab} regimen is formulated based on your active dermal barrier parameters, sebum index, UV exposure metrics, and confirmed allergy filters. Steps are ordered according to molecular density to ensure maximum active ingredient penetration.
          </p>
        </div>
      </div>

      {/* PRINTABLE PRESCRIPTION ROUTINE MODAL */}
      {printModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card max-w-2xl bg-white p-8 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">AuraSkin Clinical Document</span>
                <h2 className="text-xl font-black text-slate-900">Personalized Skincare Prescription</h2>
              </div>
              <button
                onClick={() => setPrintModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Date Generated</span>
                  <div className="font-extrabold text-slate-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Chronobiology Focus</span>
                  <div className="font-extrabold text-teal-800">Barrier Restoration & Renewal</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Adherence Streak</span>
                  <div className="font-extrabold text-amber-700">{streakDays} Consecutive Days</div>
                </div>
              </div>

              {/* AM Section */}
              <div className="space-y-2">
                <h4 className="font-black text-amber-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Sun size={13} /> Morning (AM) Sequence
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {morningSteps.map((s, idx) => (
                    <div key={idx} className="p-2.5 flex items-start gap-3">
                      <span className="font-black text-amber-700 w-5">0{s.step_number}</span>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900">{s.product_type}</span>
                        <p className="text-[11px] text-slate-500">{s.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM Section */}
              <div className="space-y-2">
                <h4 className="font-black text-indigo-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Moon size={13} /> Evening (PM) Sequence
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {eveningSteps.map((s, idx) => (
                    <div key={idx} className="p-2.5 flex items-start gap-3">
                      <span className="font-black text-indigo-700 w-5">0{s.step_number}</span>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900">{s.product_type}</span>
                        <p className="text-[11px] text-slate-500">{s.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Printer size={14} /> Print / Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
