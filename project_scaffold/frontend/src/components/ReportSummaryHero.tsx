import React, { useState, useEffect } from 'react';
import { SkinIntelligenceReport } from '../services/api';
import { Sparkles, TrendingUp, ShieldCheck, Activity, Brain } from 'lucide-react';

interface ReportSummaryHeroProps {
  report: SkinIntelligenceReport;
}

export const ReportSummaryHero: React.FC<ReportSummaryHeroProps> = ({ report }) => {
  const targetScore = report.overall_skin_health_score;
  const [displayedScore, setDisplayedScore] = useState<number>(0);

  // Animated count-up effect (matches SkinScoreCard pattern)
  useEffect(() => {
    let start = 0;
    const duration = 1200;
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

  // SVG Gauge Math (larger than hero — 74 radius in 170×170 viewBox)
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  const getTierInfo = (s: number) => {
    if (s >= 80) return {
      label: 'OPTIMAL TIER',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      arcColor: 'url(#heroGaugeGradient)',
      text: 'Your dermal health profile is in the optimal range. Barrier integrity is balanced and well-supported.',
    };
    if (s >= 65) return {
      label: 'BALANCED TIER',
      colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
      arcColor: 'url(#heroGaugeGradient)',
      text: 'Skin barrier condition is stable with moderate hydration and lifestyle improvement opportunities.',
    };
    return {
      label: 'ATTENTION NEEDED',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      arcColor: 'url(#heroGaugeGradientAmber)',
      text: 'Barrier stress detected. Prioritize nocturnal restoration, hydration, and UV protection.',
    };
  };

  const tier = getTierInfo(targetScore);

  const quickFactors = [
    { label: 'Skin Condition', icon: '✦', colorClass: 'text-teal-700' },
    { label: 'Lifestyle', icon: '♡', colorClass: 'text-rose-600' },
    { label: 'Sleep', icon: '◑', colorClass: 'text-indigo-600' },
    { label: 'Routine', icon: '✓', colorClass: 'text-emerald-600' },
    { label: 'Hydration', icon: '◈', colorClass: 'text-sky-600' },
  ];

  return (
    <div
      id="section-summary"
      className="report-section sample-card card-3d-interactive bg-gradient-to-br from-white via-slate-50/40 to-teal-50/30 border border-teal-100 shadow-md overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-[#00685f] rounded-xl shadow-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="section-label text-teal-700">Assessment Overview</span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 leading-tight">
              Clinical Assessment Summary
            </h2>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck size={13} />
          <span>Verified Engine Result</span>
        </span>
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Score Gauge ── */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-white to-teal-50/40 rounded-2xl border border-teal-100/80 shadow-sm">
          {/* SVG Circular Gauge */}
          <div className="relative flex items-center justify-center w-44 h-44">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160" aria-label={`Skin health score: ${targetScore} out of 100`}>
              <defs>
                <linearGradient id="heroGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00685f" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="heroGaugeGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <filter id="gaugeShadow">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(0,104,95,0.3)" />
                </filter>
              </defs>

              {/* Background ring */}
              <circle
                cx="80" cy="80" r={radius}
                stroke="#e2e8f0" strokeWidth="10"
                fill="transparent"
              />
              {/* Track ring (subtle) */}
              <circle
                cx="80" cy="80" r={radius}
                stroke="rgba(0,104,95,0.08)" strokeWidth="10"
                fill="transparent"
              />
              {/* Score arc */}
              <circle
                cx="80" cy="80" r={radius}
                stroke={tier.arcColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                filter="url(#gaugeShadow)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </svg>

            {/* Center score readout */}
            <div className="absolute text-center flex flex-col items-center score-reveal">
              <span className="text-4xl font-extrabold text-[#00685f] tracking-tight tabular-nums">
                {displayedScore}
              </span>
              <span className="text-xs font-bold text-slate-400 -mt-1">/ 100</span>
            </div>
          </div>

          {/* Tier badge */}
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border mt-3 ${tier.colorClass}`}>
            {tier.label}
          </span>

          {/* Trend indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 mt-2.5 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
            <TrendingUp size={13} className="text-teal-600" />
            <span>AI-Derived Score</span>
          </div>

          {/* Completeness + Confidence pills */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 text-center px-2 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completeness</div>
              <div className="text-sm font-extrabold text-slate-800">{report.data_completeness}%</div>
            </div>
            <div className="flex-1 text-center px-2 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Confidence</div>
              <div className="text-sm font-extrabold text-slate-800">{report.assessment_confidence}%</div>
            </div>
          </div>
        </div>

        {/* ── CENTER: Narrative Assessment ── */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          {/* Status card */}
          <div className="p-4 bg-white/90 rounded-xl border border-slate-200/80 shadow-sm flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={14} className="text-[#00685f]" />
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Dermal Status</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {tier.text}
            </p>
          </div>

          {/* Confidence explanation */}
          <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldCheck size={14} className="text-[#00685f]" />
              <span className="text-xs font-extrabold text-[#00685f] uppercase tracking-wider">Assessment Confidence</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {report.confidence_explanation ||
                'High clinical confidence based on your baseline skin profile, lifestyle telemetry, and active protocol adherence.'}
            </p>
          </div>

          {/* Quick factor chips */}
          <div className="p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Contributing Factors
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickFactors.map((f, i) => (
                <span key={i} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 ${f.colorClass}`}>
                  <span>{f.icon}</span>
                  <span className="text-slate-700">{f.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Factor Breakdown Bars ── */}
        <div className="lg:col-span-4 p-4 bg-white/90 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Factor Scores</span>
            <Activity size={14} className="text-teal-600" />
          </div>

          {report.score_breakdown && report.score_breakdown.length > 0 ? (
            <div className="space-y-3">
              {report.score_breakdown.map((b, idx) => {
                const percent = Math.min(Math.round((b.earned / b.max_possible) * 100), 100);
                const isHigh = percent >= 80;
                const isMid = percent >= 60;
                const barColor = isHigh
                  ? 'from-emerald-500 to-teal-500'
                  : isMid
                    ? 'from-[#00685f] to-teal-500'
                    : 'from-amber-400 to-orange-400';

                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[160px]">{b.label}</span>
                      <span className="text-[11px] font-extrabold text-[#00685f] shrink-0 ml-1">
                        {b.earned}<span className="text-slate-400 font-medium">/{b.max_possible}</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${barColor} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No score breakdown available.</p>
          )}

          {/* Total */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Score</span>
            <span className="text-xl font-extrabold text-[#00685f]">
              {targetScore}<span className="text-sm text-slate-400 font-semibold">/100</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
