import React, { useState, useEffect } from 'react';
import { SkinHealthScore, SkinAssessment } from '../services/api';
import { Activity, ArrowRight, TrendingUp, Calendar, FileText, LayoutDashboard } from 'lucide-react';

interface ProfileIntelligenceCardProps {
  score: SkinHealthScore | null;
  assessment: SkinAssessment | null;
}

export const ProfileIntelligenceCard: React.FC<ProfileIntelligenceCardProps> = ({
  score,
  assessment,
}) => {
  const targetScore = score?.total_score ?? null;
  const completeness = assessment?.data_completeness ?? null;
  const lastDate = assessment?.created_at || score?.created_at;

  const [displayedScore, setDisplayedScore] = useState<number>(0);

  useEffect(() => {
    if (targetScore === null) return;
    let start = 0;
    const duration = 900;
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
  }, [targetScore]);

  // Gauge SVG Math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = targetScore !== null
    ? circumference - (displayedScore / 100) * circumference
    : circumference;

  const getTierInfo = (scoreVal: number | null) => {
    if (scoreVal === null) return { label: 'PENDING', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    if (scoreVal >= 80) return { label: 'OPTIMAL', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (scoreVal >= 65) return { label: 'BALANCED', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    return { label: 'ATTENTION NEEDED', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const tier = getTierInfo(targetScore);

  const formattedDate = lastDate
    ? new Date(lastDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not yet recorded';

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
              CLINICAL SCORING
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              YOUR SKIN INTELLIGENCE
            </h3>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Main Score & Gauge Row */}
      <div className="flex items-center justify-between gap-4 py-1">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Score Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#profileScoreGrad)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            <defs>
              <linearGradient id="profileScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00685f" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
          </svg>

          {/* Gauge Center Value */}
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-2xl font-black text-[#00685f] tracking-tight">
              {targetScore !== null ? displayedScore : '--'}
            </span>
            <span className="text-[9px] font-bold text-slate-400 -mt-1">/ 100</span>
          </div>
        </div>

        {/* Breakdown Summary Meta */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Completeness:</span>
            <span className="font-bold text-sky-700">
              {completeness !== null ? `${completeness}%` : '--'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Last Assessment:</span>
            <span className="font-bold text-slate-700 text-[11px]">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => (window.location.hash = 'dashboard')}
          className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
        >
          <LayoutDashboard size={13} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => (window.location.hash = 'reports')}
          className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
        >
          <FileText size={13} />
          <span>View Report</span>
        </button>
      </div>
    </div>
  );
};
