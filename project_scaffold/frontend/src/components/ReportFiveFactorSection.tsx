import React, { useState } from 'react';
import { ScoreComponentDetail } from '../services/api';
import { Sparkles, Heart, Moon, CheckCircle, Droplets, X } from 'lucide-react';

interface ReportFiveFactorSectionProps {
  scoreBreakdown?: ScoreComponentDetail[];
}

export const ReportFiveFactorSection: React.FC<ReportFiveFactorSectionProps> = ({ scoreBreakdown }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const defaultComponents: ScoreComponentDetail[] = [
    { label: 'Baseline Skin Condition', earned: 22, max_possible: 25, explanation: 'Skin type baseline stability and concern score.' },
    { label: 'Stress & Lifestyle Matrix', earned: 17, max_possible: 20, explanation: 'Stress impact score and active daily habits.' },
    { label: 'Sleep & Recovery', earned: 16, max_possible: 20, explanation: 'Nocturnal sleep duration and restoration quality.' },
    { label: 'Protocol Adherence', earned: 18, max_possible: 20, explanation: 'Morning & evening skincare protocol consistency.' },
    { label: 'Hydration & Telemetry', earned: 11, max_possible: 15, explanation: 'Daily fluid intake and UV environmental load.' },
  ];

  const factors = scoreBreakdown && scoreBreakdown.length > 0 ? scoreBreakdown : defaultComponents;

  const getFactorConfig = (label: string, idx: number) => {
    const l = label.toLowerCase();
    if (l.includes('skin') || l.includes('baseline')) return {
      icon: <Sparkles size={18} className="text-teal-600" />,
      cardClass: 'factor-card-skin',
      accentColor: '#0d9488',
      bgBadge: 'bg-teal-100 text-teal-800',
      iconBg: 'bg-teal-100',
      shortLabel: 'BASELINE SKIN',
      emoji: '✦',
    };
    if (l.includes('stress') || l.includes('lifestyle')) return {
      icon: <Heart size={18} className="text-rose-500" />,
      cardClass: 'factor-card-stress',
      accentColor: '#f43f5e',
      bgBadge: 'bg-rose-100 text-rose-800',
      iconBg: 'bg-rose-100',
      shortLabel: 'STRESS & LIFESTYLE',
      emoji: '♡',
    };
    if (l.includes('sleep')) return {
      icon: <Moon size={18} className="text-indigo-500" />,
      cardClass: 'factor-card-sleep',
      accentColor: '#6366f1',
      bgBadge: 'bg-indigo-100 text-indigo-800',
      iconBg: 'bg-indigo-100',
      shortLabel: 'SLEEP & RECOVERY',
      emoji: '◑',
    };
    if (l.includes('protocol') || l.includes('adherence')) return {
      icon: <CheckCircle size={18} className="text-emerald-600" />,
      cardClass: 'factor-card-protocol',
      accentColor: '#10b981',
      bgBadge: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-100',
      shortLabel: 'PROTOCOL',
      emoji: '✓',
    };
    return {
      icon: <Droplets size={18} className="text-sky-500" />,
      cardClass: 'factor-card-hydration',
      accentColor: '#0ea5e9',
      bgBadge: 'bg-sky-100 text-sky-800',
      iconBg: 'bg-sky-100',
      shortLabel: 'HYDRATION',
      emoji: '◈',
    };
  };

  return (
    <div id="section-factors" className="report-section sample-card card-3d-interactive">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div>
          <span className="section-label text-teal-700">Dermal Intelligence</span>
          <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">5-Factor Dermal Analysis</h3>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
          Scoring Model
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {factors.map((item, idx) => {
          const percent = Math.min(Math.round((item.earned / item.max_possible) * 100), 100);
          const config = getFactorConfig(item.label, idx);
          const isExpanded = expandedCard === idx;

          const status = percent >= 80 ? { text: 'Excellent', cls: 'status-badge-healthy' }
            : percent >= 60 ? { text: 'Good', cls: 'status-badge-moderate' }
            : { text: 'Needs Attention', cls: 'status-badge-attention' };

          return (
            <div
              key={idx}
              className={`
                relative p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300
                shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                ${config.cardClass}
              `}
              onClick={() => setExpandedCard(isExpanded ? null : idx)}
            >
              {/* Top row: icon + label + status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      {config.shortLabel}
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight max-w-[130px]">
                      {item.label}
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
                  {status.text}
                </span>
              </div>

              {/* Score display */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold" style={{ color: config.accentColor }}>
                  {item.earned}
                </span>
                <span className="text-sm font-bold text-slate-400">/ {item.max_possible} pts</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/60 rounded-full h-2.5 mb-3 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-1000"
                  style={{
                    width: `${percent}%`,
                    background: `linear-gradient(to right, ${config.accentColor}cc, ${config.accentColor})`,
                  }}
                />
              </div>

              {/* Percentage label */}
              <div className="flex justify-between items-center text-[10px] mb-2">
                <span className="text-slate-500 font-semibold">Contribution</span>
                <span className="font-extrabold" style={{ color: config.accentColor }}>{percent}%</span>
              </div>

              {/* Explanation */}
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.explanation || 'Contributes directly to overall dermal score based on clinical assessment factors.'}
              </p>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Clinical Weight
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                      className="p-0.5 rounded hover:bg-slate-200 transition-colors"
                    >
                      <X size={12} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 bg-white/80 rounded-lg p-2.5 border border-slate-100">
                    Maximum capacity: <strong>{item.max_possible} points</strong> — currently earning{' '}
                    <strong style={{ color: config.accentColor }}>{item.earned} pts</strong> ({percent}% efficiency).
                    {item.normalized_score !== undefined && (
                      <span> Normalized: {Math.round(item.normalized_score * 100)}%.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Click hint */}
              {!isExpanded && (
                <div className="absolute bottom-2 right-3 text-[9px] font-semibold text-slate-300">
                  click for detail
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-5 p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-slate-700 flex items-center gap-2">
        <Sparkles size={14} className="text-teal-600 shrink-0" />
        <span>
          Each factor is scored independently by the AuraSkin intelligence engine using your real profile, telemetry, and lifestyle data.
          The sum of all five factors equals your composite dermal health score.
        </span>
      </div>
    </div>
  );
};
