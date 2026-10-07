import React from 'react';
import { Activity, Sparkles, TrendingUp, ShieldCheck, HeartPulse, Moon, CalendarCheck, Droplets } from 'lucide-react';

export const LandingIntelligencePreview: React.FC = () => {
  const factors = [
    { label: 'Skin Barrier Condition', score: '22 / 25 pts', icon: <Sparkles size={14} className="text-teal-600" />, pct: 88 },
    { label: 'Lifestyle & Stress Balance', score: '18 / 20 pts', icon: <HeartPulse size={14} className="text-emerald-600" />, pct: 90 },
    { label: 'Sleep Regeneration Architecture', score: '16 / 20 pts', icon: <Moon size={14} className="text-indigo-600" />, pct: 80 },
    { label: 'Protocol & Regimen Adherence', score: '14 / 20 pts', icon: <CalendarCheck size={14} className="text-sky-600" />, pct: 70 },
    { label: 'Hydration & Moisture Saturation', score: '14 / 15 pts', icon: <Droplets size={14} className="text-cyan-600" />, pct: 93 },
  ];

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/90 p-8 rounded-3xl shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black uppercase tracking-wider">
            <Activity size={13} className="text-teal-600" />
            <span>AUTHENTICATED EXPERIENCE PREVIEW</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            AI Dermal Intelligence Dashboard
          </h3>
        </div>

        <span className="self-start md:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Illustrative Interface Sample
        </span>
      </div>

      {/* Preview Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center pt-2">
        {/* Left Column: Sample Gauge */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-100/80 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Composite Skin Health Score
          </span>

          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="url(#sampleGaugeGrad)"
                strokeWidth="8"
                strokeDasharray="289"
                strokeDashoffset="63"
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="sampleGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00685f" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute text-center flex flex-col items-center">
              <span className="text-3xl font-black text-[#00685f] tracking-tight">78</span>
              <span className="text-[10px] font-bold text-slate-400 -mt-0.5">/ 100</span>
            </div>
          </div>

          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            OPTIMAL STATUS
          </span>

          <p className="text-[11px] text-slate-500 max-w-xs">
            Calculated across barrier integrity, daily hydration, sleep chronobiology, and UV exposure.
          </p>
        </div>

        {/* Right 2 Columns: 5-Factor Mini Breakdown */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            5-Factor Dermal Breakdown
          </span>

          <div className="space-y-2.5">
            {factors.map((f, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200/60 shrink-0">
                    {f.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 truncate">{f.label}</span>
                      <span className="font-bold text-slate-600 text-[11px] shrink-0">{f.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full"
                        style={{ width: `${f.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
