import React from 'react';
import { Sun, Moon, Droplets, Brain, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface ReportRiskSectionProps {
  riskFactors?: string[];
  positiveFactors?: string[];
}

// Map risk/positive factor text to a relevant icon and category
const getRiskIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('uv') || t.includes('sun') || t.includes('solar')) return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'UV Exposure' };
  if (t.includes('sleep') || t.includes('nocturnal') || t.includes('restoration')) return { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'Sleep Recovery' };
  if (t.includes('hydrat') || t.includes('water') || t.includes('fluid')) return { icon: Droplets, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', label: 'Hydration' };
  if (t.includes('stress') || t.includes('mental') || t.includes('cortisol')) return { icon: Brain, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', label: 'Stress' };
  return { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Routine Adherence' };
};

const getPositiveIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('uv') || t.includes('sun') || t.includes('spf')) return { icon: Sun, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'UV Protection' };
  if (t.includes('hydrat') || t.includes('water')) return { icon: Droplets, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Hydration' };
  if (t.includes('sleep')) return { icon: Moon, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Sleep Quality' };
  if (t.includes('routine') || t.includes('protocol')) return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Protocol' };
  return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Lifestyle' };
};

export const ReportRiskSection: React.FC<ReportRiskSectionProps> = ({
  riskFactors = ['Intermittent UV exposure load', 'Sub-optimal sleep restoration (< 7.5 hrs)'],
  positiveFactors = ['High daily hydration (2400+ ml)', 'Consistent morning sunscreen application'],
}) => {
  return (
    <div id="section-risk" className="report-section sample-card card-3d-interactive">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 rounded-xl">
            <ShieldAlert size={16} className="text-amber-600" />
          </div>
          <div>
            <span className="section-label text-amber-700">Environmental Telemetry</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Risk & Environmental Factors</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── RISK FACTORS ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Risk Factors</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full status-badge-attention">
              Attention
            </span>
          </div>

          <div className="space-y-3">
            {riskFactors.map((rf, idx) => {
              const iconConfig = getRiskIcon(rf);
              const IconComp = iconConfig.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-2xl ${iconConfig.bg} border ${iconConfig.border} hover:shadow-sm transition-all duration-200`}
                >
                  <div className={`p-2 rounded-xl bg-white/80 border ${iconConfig.border} shrink-0`}>
                    <IconComp size={16} className={iconConfig.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${iconConfig.color}`}>
                        {iconConfig.label}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full status-badge-attention shrink-0">
                        Moderate Risk
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{rf}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SUPPORTING FACTORS ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Supporting Factors</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full status-badge-healthy">
              Healthy
            </span>
          </div>

          <div className="space-y-3">
            {positiveFactors.map((pf, idx) => {
              const iconConfig = getPositiveIcon(pf);
              const IconComp = iconConfig.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-2xl ${iconConfig.bg} border ${iconConfig.border} hover:shadow-sm transition-all duration-200`}
                >
                  <div className={`p-2 rounded-xl bg-white/80 border ${iconConfig.border} shrink-0`}>
                    <IconComp size={16} className={iconConfig.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                        {iconConfig.label}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full status-badge-healthy shrink-0">
                        Healthy
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{pf}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Environmental note */}
      <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-start gap-2">
        <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Risk factors are derived from your reported lifestyle, sleep, hydration, and environmental exposure data.
          They are used to calibrate your personalized routine and ingredient recommendations.
        </p>
      </div>
    </div>
  );
};
