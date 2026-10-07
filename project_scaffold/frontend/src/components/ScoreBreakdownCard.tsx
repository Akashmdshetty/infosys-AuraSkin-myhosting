import React, { useState } from 'react';
import { ScoreComponentDetail } from '../services/api';
import { Sparkles, Info, Activity, Heart, Moon, Droplets, CheckCircle } from 'lucide-react';

interface ScoreBreakdownCardProps {
  components?: ScoreComponentDetail[];
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({ components }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Default fallback components matching backend weights exactly if components prop is empty
  const defaultComponents: ScoreComponentDetail[] = [
    { label: 'Baseline Skin Condition', earned: 22, max_possible: 25, explanation: 'Skin type and reported concern stability.' },
    { label: 'Stress & Lifestyle Matrix', earned: 17, max_possible: 20, explanation: 'Manageable stress levels and balanced daily habits.' },
    { label: 'Sleep & Recovery', earned: 16, max_possible: 20, explanation: 'Restorative nocturnal sleep duration and quality.' },
    { label: 'Protocol Adherence', earned: 18, max_possible: 20, explanation: 'Consistent morning & evening routine execution.' },
    { label: 'Hydration & Telemetry', earned: 11, max_possible: 15, explanation: 'Daily fluid intake and environmental protection.' },
  ];

  const list = components && components.length > 0 ? components : defaultComponents;

  const getFactorIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('skin') || l.includes('baseline')) return <Sparkles size={16} className="text-teal-600" />;
    if (l.includes('stress') || l.includes('lifestyle')) return <Heart size={16} className="text-rose-500" />;
    if (l.includes('sleep')) return <Moon size={16} className="text-indigo-500" />;
    if (l.includes('protocol') || l.includes('adherence')) return <CheckCircle size={16} className="text-emerald-600" />;
    return <Droplets size={16} className="text-sky-500" />;
  };

  const getContributionBadge = (earned: number, max: number) => {
    const ratio = earned / max;
    if (ratio >= 0.85) return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Optimal</span>;
    if (ratio >= 0.7) return <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">Good</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">Attention</span>;
  };

  return (
    <div className="sample-card card-3d-interactive">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Clinical Scoring Model</span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">5-Factor Dermal Health Breakdown</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <Activity size={13} className="text-teal-600" />
          <span>Weighted Matrix</span>
        </div>
      </div>

      <div className="space-y-4">
        {list.map((item, idx) => {
          const percent = Math.min(Math.round((item.earned / item.max_possible) * 100), 100);

          return (
            <div
              key={idx}
              className="relative p-3 rounded-xl bg-slate-50/70 hover:bg-teal-50/40 border border-slate-100 hover:border-teal-200 transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setActiveTooltip(idx)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getFactorIcon(item.label)}
                  <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  {getContributionBadge(item.earned, item.max_possible)}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <span>{item.earned}</span>
                  <span className="text-slate-400 font-normal">/ {item.max_possible} pts</span>
                  <Info size={13} className="text-slate-400 hover:text-teal-600 ml-1" />
                </div>
              </div>

              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00685f] to-teal-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Tooltip on hover */}
              {activeTooltip === idx && (
                <div className="absolute left-0 right-0 -bottom-10 z-20 px-3 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg flex items-center gap-1.5 animate-fade-in pointer-events-none">
                  <Info size={12} className="text-teal-400 shrink-0" />
                  <span>{item.explanation || 'Contributes directly to overall dermal score based on clinical factors.'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
