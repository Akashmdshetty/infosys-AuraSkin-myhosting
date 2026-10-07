import React from 'react';
import { User, Activity, Brain, ShieldCheck, Sparkles, BookOpen, ArrowRight, ArrowDown } from 'lucide-react';

export const ReportPipelineDiagram: React.FC = () => {
  const steps = [
    {
      num: '01',
      label: 'User Profile',
      sub: 'Skin type, concerns, sensitivities',
      icon: User,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      glow: 'shadow-teal-200/60',
    },
    {
      num: '02',
      label: 'Daily Telemetry',
      sub: 'Sleep, hydration, UV, lifestyle',
      icon: Activity,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      glow: 'shadow-sky-200/60',
    },
    {
      num: '03',
      label: 'AI Analysis',
      sub: '5-factor clinical model',
      icon: Brain,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      glow: 'shadow-violet-200/60',
    },
    {
      num: '04',
      label: 'Dermal Score',
      sub: 'Composite intelligence score',
      icon: ShieldCheck,
      color: 'text-[#00685f]',
      bg: 'bg-teal-50',
      border: 'border-teal-300',
      glow: 'shadow-teal-300/60',
    },
    {
      num: '05',
      label: 'Routine',
      sub: 'Chronobiology regimen',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      glow: 'shadow-amber-200/60',
    },
    {
      num: '06',
      label: 'Recommendations',
      sub: 'Ingredients & next steps',
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-200/60',
    },
  ];

  return (
    <div className="report-section sample-card card-3d-interactive bg-gradient-to-br from-slate-50/80 via-white to-teal-50/40 border border-teal-100/80 no-print">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200/60">
        <div>
          <span className="section-label text-teal-700">Intelligence Pipeline</span>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">How AuraSkin Generates Your Report</h3>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
          Live Clinical Flow
        </span>
      </div>

      {/* Pipeline nodes — horizontal on desktop, vertical on mobile */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-1">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={idx}>
              {/* Node */}
              <div className="flex flex-col items-center gap-2 group">
                {/* Icon bubble */}
                <div
                  className={`
                    pipeline-node-glow
                    w-12 h-12 rounded-2xl ${step.bg} border-2 ${step.border}
                    flex items-center justify-center
                    shadow-lg ${step.glow}
                    group-hover:scale-110 transition-transform duration-200
                  `}
                  style={{ animationDelay: `${idx * 0.5}s` }}
                >
                  <IconComp size={20} className={step.color} />
                </div>

                {/* Step number */}
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{step.num}</span>

                {/* Label */}
                <div className="text-center max-w-[80px]">
                  <div className="text-[11px] font-extrabold text-slate-800 leading-tight">{step.label}</div>
                  <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{step.sub}</div>
                </div>
              </div>

              {/* Connector arrow */}
              {!isLast && (
                <div className="flex flex-col sm:flex-row items-center sm:shrink-0">
                  {/* Vertical arrow on mobile */}
                  <ArrowDown
                    size={16}
                    className="text-teal-400 flow-arrow-animate sm:hidden"
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  />
                  {/* Horizontal arrow on desktop */}
                  <ArrowRight
                    size={16}
                    className="text-teal-400 flow-arrow-animate hidden sm:block"
                    style={{ animationDelay: `${idx * 0.3}s` }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          Profile → Telemetry → Analysis → Score → Routine → Recommendations
        </p>
      </div>
    </div>
  );
};
