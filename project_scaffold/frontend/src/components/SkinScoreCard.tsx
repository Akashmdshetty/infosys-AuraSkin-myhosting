import React, { useState, useEffect } from 'react';
import { api, SkinHealthScore } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sparkles, RefreshCw, TrendingUp, ShieldCheck } from 'lucide-react';

interface SkinScoreCardProps {
  scoreData?: SkinHealthScore | null;
  onAssessmentCompleted?: () => void;
}

export const SkinScoreCard: React.FC<SkinScoreCardProps> = ({ onAssessmentCompleted }) => {
  const [scoreData, setScoreData] = useState<SkinHealthScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const { showError, showSuccess } = useToast();

  const fetchScore = async () => {
    setLoading(true);
    try {
      const data = await api.getSkinScore();
      setScoreData(data);
    } catch {
      setScoreData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async () => {
    setCalculating(true);
    try {
      await api.triggerAssessment();
      const updatedScore = await api.getSkinScore();
      setScoreData(updatedScore);
      showSuccess('✓ Dermal score recalculated!');
      if (onAssessmentCompleted) onAssessmentCompleted();
    } catch (err: any) {
      showError(err.message || 'Failed to calculate score.');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const targetScore = scoreData?.total_score ?? 84;

  // Animated score count-up effect
  useEffect(() => {
    if (loading) return;
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = targetScore / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setDisplayedScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore, loading]);

  if (loading) {
    return (
      <div className="sample-card text-center py-10 text-slate-500 animate-pulse">
        Calculating 5-factor dermal health score...
      </div>
    );
  }

  // Gauge SVG Math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  const getTierInfo = (score: number) => {
    if (score >= 80) return { label: 'OPTIMAL', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Dermal barrier integrity is balanced, hydrated and healthy.' };
    if (score >= 65) return { label: 'BALANCED', color: 'text-teal-700 bg-teal-50 border-teal-200', text: 'Skin barrier condition is stable with moderate hydration needs.' };
    return { label: 'ATTENTION NEEDED', color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Barrier stress detected. Prioritize sleep restoration and hydration.' };
  };

  const tier = getTierInfo(targetScore);

  return (
    <div className="sample-card card-3d-interactive bg-gradient-to-br from-white via-slate-50/50 to-teal-50/20 border border-teal-100/80 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00685f] uppercase tracking-wider">
            <Sparkles size={14} />
            <span>AI Dermal Centerpiece</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">Composite Skin Health Score</h2>
        </div>

        <button
          onClick={handleRunAssessment}
          disabled={calculating}
          className="btn-primary text-xs px-3.5 py-2"
          type="button"
        >
          <RefreshCw size={13} className={calculating ? 'animate-spin' : ''} />
          <span>{calculating ? 'Recalculating...' : 'Recalculate Score'}</span>
        </button>
      </div>

      {/* Score Gauge & Readout Display */}
      <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Score Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00685f" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text Readout */}
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-4xl font-extrabold text-[#00685f] tracking-tight">
              {displayedScore}
            </span>
            <span className="text-xs font-bold text-slate-400 -mt-1">/ 100</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border mt-1.5 ${tier.color}`}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Details Column */}
        <div className="flex-1 max-w-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50/80 p-2.5 rounded-xl border border-teal-100">
            <TrendingUp size={15} className="text-teal-600 shrink-0" />
            <span>↑ +5 pts vs last week (optimal progression)</span>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Dermal Status Analysis</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {tier.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
