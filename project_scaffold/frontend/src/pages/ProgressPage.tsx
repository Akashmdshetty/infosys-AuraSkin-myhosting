import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, CheckCircle2, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Sparkles, RefreshCw, Layers, Plus, Clock, ShieldCheck,
  Award, Activity, Target
} from 'lucide-react';
import {
  api, ProgressRecord, RoutineAdherenceRecord,
  ProgressTrendsResponse, BeforeAfterComparisonResponse
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProgressPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [trends, setTrends] = useState<ProgressTrendsResponse | null>(null);
  const [comparison, setComparison] = useState<BeforeAfterComparisonResponse | null>(null);
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [adherenceLogs, setAdherenceLogs] = useState<RoutineAdherenceRecord[]>([]);

  // Log adherence state
  const [morningDone, setMorningDone] = useState<boolean>(true);
  const [eveningDone, setEveningDone] = useState<boolean>(true);
  const [weeklyDone, setWeeklyDone] = useState<boolean>(false);
  const [adherenceNotes, setAdherenceNotes] = useState<string>('');
  const [savingAdherence, setSavingAdherence] = useState<boolean>(false);

  // Snapshot state
  const [snapshotNotes, setSnapshotNotes] = useState<string>('');
  const [savingSnapshot, setSavingSnapshot] = useState<boolean>(false);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [trendsRes, compRes, histRes, adhRes] = await Promise.all([
        api.getProgressTrends(),
        api.getBeforeAfterComparison(),
        api.getProgressHistory(),
        api.getRoutineAdherence(14)
      ]);
      setTrends(trendsRes);
      setComparison(compRes);
      setHistory(histRes);
      setAdherenceLogs(adhRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load progress tracking metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const handleSaveAdherence = async () => {
    try {
      setSavingAdherence(true);
      const completedList = [
        ...(morningDone ? ['morning-complete'] : []),
        ...(eveningDone ? ['evening-complete'] : []),
        ...(weeklyDone ? ['weekly-complete'] : [])
      ];
      const noteDetails = adherenceNotes || `Logged ${[morningDone && 'Morning', eveningDone && 'Evening', weeklyDone && 'Weekly Treatment'].filter(Boolean).join(' + ') || 'Routine'}`;
      await api.logRoutineAdherence({
        morning_completed: morningDone,
        evening_completed: eveningDone,
        completed_steps: completedList,
        notes: noteDetails
      });
      showToast('Routine adherence recorded!', 'success');
      setAdherenceNotes('');
      fetchProgressData();
    } catch (err: any) {
      showToast(err.message || 'Failed to log adherence', 'error');
    } finally {
      setSavingAdherence(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setSavingSnapshot(true);
      await api.createProgressSnapshot({
        notes: snapshotNotes || 'Skin progress snapshot.'
      });
      showToast('New clinical progress snapshot saved!', 'success');
      setSnapshotNotes('');
      fetchProgressData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create progress snapshot', 'error');
    } finally {
      setSavingSnapshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 mb-3">
                <TrendingUp className="w-3.5 h-3.5" /> Longitudinal Skin Progress & Analytics
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Clinical Skin Health Journey
              </h1>
              <p className="mt-2 text-teal-100 max-w-2xl text-sm sm:text-base">
                Track your 5-factor AuraScore evolution, verify daily routine consistency, and inspect clinical Before / After improvements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateSnapshot}
                disabled={savingSnapshot}
                className="px-5 py-2.5 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-teal-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                {savingSnapshot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log Progress Snapshot
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 text-sm">Calculating longitudinal analytics...</p>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            {trends && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Overall Score Trajectory */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progression</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{trends.overall_change}</span>
                    <span className={`inline-flex items-center text-xs font-bold ${
                      trends.trend === 'improving' ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {trends.trend === 'improving' ? <ArrowUpRight className="w-4 h-4" /> : null}
                      {trends.trend.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Week-over-week multi-factor score velocity</p>
                </div>

                {/* Routine Adherence */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Routine Consistency</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-teal-800">
                      {(trends.recent_adherence_rate * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{trends.routine_adherence_change}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">14-day AM/PM stepped regimen adherence</p>
                </div>

                {/* Hydration Health */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hydration Velocity</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-cyan-800">{trends.hydration_change}</span>
                    <span className="text-xs font-bold text-cyan-600">Dynamic</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Stratum corneum moisture retention</p>
                </div>

                {/* Sleep Restorative Index */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sleep Recovery</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-900">{trends.sleep_change}</span>
                    <span className="text-xs font-bold text-indigo-600">Restorative</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Nocturnal cellular repair efficiency</p>
                </div>
              </div>
            )}

            {/* Drivers of Progress vs Needs Attention */}
            {trends && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> What Is Driving Your Progress?
                  </h3>
                  <div className="space-y-2">
                    {trends.major_improvements.map((imp, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-950 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" /> Key Dermal Health Priorities
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-100 rounded-2xl text-xs text-amber-950 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Maintain mandatory daily broad-spectrum SPF 50+ to protect lipid barrier</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-teal-50/70 border border-teal-100 rounded-2xl text-xs text-teal-950 font-medium">
                      <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Consistent evening double-cleansing prevents microcomedone accumulation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Before / After Clinical Comparison Section */}
            {comparison && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-600" /> Longitudinal Before / After Assessment Comparison
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Baseline ({comparison.baseline_date}) vs Current Assessment ({comparison.current_date})
                    </p>
                  </div>

                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    comparison.overall_status === 'IMPROVED'
                      ? 'bg-emerald-100 text-emerald-900'
                      : comparison.overall_status === 'DECLINED'
                      ? 'bg-rose-100 text-rose-900'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {comparison.overall_status}
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs font-medium text-teal-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>{comparison.clinical_summary}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Dermal Dimension</th>
                        <th className="p-3">Baseline</th>
                        <th className="p-3">Current</th>
                        <th className="p-3">Delta</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Clinical Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparison.metrics.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{m.metric_name}</td>
                          <td className="p-3 font-semibold text-slate-600">{m.baseline_value.toFixed(0)}</td>
                          <td className="p-3 font-extrabold text-teal-900">{m.current_value.toFixed(0)}</td>
                          <td className="p-3 font-bold text-slate-800">{m.change_percentage}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              m.status === 'IMPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'DECLINED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 leading-relaxed">{m.interpretation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Routine Adherence Tracker & Logging */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Daily Logger Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" /> Daily Routine Check-in
                </h3>
                <p className="text-xs text-slate-500">
                  Log today's morning and evening routine completion to maintain consistency scores.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={morningDone}
                      onChange={e => setMorningDone(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Morning AM Routine</div>
                      <div className="text-[11px] text-slate-500">Cleanser · Antioxidant Serum · Hydrator · SPF 50+</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={eveningDone}
                      onChange={e => setEveningDone(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Evening PM Routine</div>
                      <div className="text-[11px] text-slate-500">Double Cleanse · Active Serum · Lipid Recovery Cream</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-200 cursor-pointer hover:bg-purple-100/60 transition">
                    <input
                      type="checkbox"
                      checked={weeklyDone}
                      onChange={e => setWeeklyDone(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-purple-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <span>Weekly Treatment / Mask</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-200/80 text-purple-800 rounded">1–2x/week</span>
                      </div>
                      <div className="text-[11px] text-purple-700">Chemical Exfoliation (AHA/BHA) or Bio-Cellulose Mask</div>
                    </div>
                  </label>

                  <input
                    type="text"
                    placeholder="Optional notes (e.g. skin felt calm, no redness)..."
                    value={adherenceNotes}
                    onChange={e => setAdherenceNotes(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />

                  <button
                    onClick={handleSaveAdherence}
                    disabled={savingAdherence}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    {savingAdherence ? 'Recording...' : 'Log Routine Adherence'}
                  </button>
                </div>
              </div>

              {/* Recent Adherence History List */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" /> Recent Adherence Log
                </h3>
                <div className="space-y-2 max-h-[260px] overflow-y-auto divide-y divide-slate-100">
                  {adherenceLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No adherence logs yet. Complete your first check-in above.</p>
                  ) : (
                    adherenceLogs.map(log => (
                      <div key={log.id} className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{log.date}</span>
                          <p className="text-[11px] text-slate-500">{log.notes || 'Routine completed'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.adherence_rate === 1.0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {(log.adherence_rate * 100).toFixed(0)}% Adherence
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
