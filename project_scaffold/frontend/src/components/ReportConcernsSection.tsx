import React from 'react';
import { Target, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface ReportConcernsSectionProps {
  primaryConcern?: string;
  secondaryConcerns?: string[];
}

export const ReportConcernsSection: React.FC<ReportConcernsSectionProps> = ({
  primaryConcern = 'Uneven Skin Tone',
  secondaryConcerns = ['Dryness', 'Dullness', 'Pore Size'],
}) => {
  const secondaryIconColors = [
    'text-amber-600',
    'text-sky-600',
    'text-violet-600',
    'text-rose-500',
    'text-teal-600',
  ];

  return (
    <div id="section-concerns" className="report-section sample-card card-3d-interactive">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-100 rounded-xl">
            <Target size={16} className="text-rose-600" />
          </div>
          <div>
            <span className="section-label text-rose-700">Dermal Focus</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Prioritized Skin Concerns</h3>
          </div>
        </div>
        <span className="hidden sm:block text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
          {secondaryConcerns.length + 1} Identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── PRIMARY CONCERN — Large highlighted card ── */}
        <div className="md:col-span-2">
          <div className="primary-concern-card p-5 bg-gradient-to-br from-rose-50 via-rose-50/50 to-white rounded-2xl border-2 border-rose-300/50 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Badge row */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-600 text-white uppercase tracking-widest">
                <Zap size={10} />
                Primary Concern
              </span>
              <AlertTriangle size={18} className="text-rose-400" />
            </div>

            {/* Concern name */}
            <h4 className="text-2xl font-extrabold text-slate-900 mb-3 leading-tight">
              {primaryConcern}
            </h4>

            {/* Explanation */}
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Clinical active selection and chronobiology steps are primarily calibrated to treat{' '}
              <strong className="text-slate-800">{primaryConcern.toLowerCase()}</strong>{' '}
              while supporting epidermal lipid barrier recovery and overall skin tone stability.
            </p>

            {/* Impact indicators */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                Affects barrier function
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                UV sensitivity risk
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                Targeted in routine
              </span>
            </div>
          </div>
        </div>

        {/* ── SECONDARY CONCERNS ── */}
        <div className="flex flex-col">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 px-1">
            Secondary Concerns
          </div>

          <div className="space-y-2.5 flex-1">
            {secondaryConcerns.map((concern, idx) => (
              <div
                key={idx}
                className="group p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between
                  hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-default"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <span className={`text-[11px] font-extrabold ${secondaryIconColors[idx % secondaryIconColors.length]}`}>
                      {idx + 2}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{concern}</span>
                </div>
                <CheckCircle2 size={16} className="text-teal-500 group-hover:text-teal-600 transition-colors" />
              </div>
            ))}
          </div>

          {/* Rationale note */}
          <div className="mt-3 p-3 bg-teal-50/70 rounded-xl border border-teal-100">
            <p className="text-[10px] font-semibold text-teal-800 leading-relaxed">
              Secondary concerns are addressed by supporting ingredients in your personalized routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
