import React from 'react';
import { ArrowRight, CheckCircle2, Target, Calendar } from 'lucide-react';

interface ReportNextStepsCardProps {
  nextSteps?: string[];
  onNavigateToDataEntry?: () => void;
}

export const ReportNextStepsCard: React.FC<ReportNextStepsCardProps> = ({
  nextSteps,
  onNavigateToDataEntry,
}) => {
  const defaultSteps = [
    'Log your daily water intake and sleep duration in the Data Entry tab.',
    'Follow morning SPF 50+ mineral sunscreen application daily.',
    'Re-evaluate your dermal score after 7 consecutive daily telemetry logs.',
  ];

  const steps = nextSteps && nextSteps.length > 0 ? nextSteps : defaultSteps;

  const priorityColors = [
    { bg: 'bg-teal-600', text: 'text-teal-600', light: 'bg-teal-50 border-teal-200' },
    { bg: 'bg-sky-600',  text: 'text-sky-600',  light: 'bg-sky-50  border-sky-200' },
    { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50 border-violet-200' },
    { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50 border-amber-200' },
    { bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50 border-rose-200' },
  ];

  return (
    <div
      id="section-nextsteps"
      className="report-section sample-card card-3d-interactive bg-gradient-to-br from-teal-50/60 via-sky-50/30 to-white border border-teal-200/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-teal-200/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#00685f] rounded-xl">
            <Target size={16} className="text-white" />
          </div>
          <div>
            <span className="section-label text-[#00685f]">Actionable Guidance</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Recommended Next Steps</h3>
          </div>
        </div>

        <button
          onClick={onNavigateToDataEntry}
          type="button"
          className="btn-primary text-xs py-2.5 px-5 whitespace-nowrap shrink-0"
        >
          <span>Update Data Entry Logs</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Numbered steps */}
      <div className="space-y-3 mb-5">
        {steps.map((step, idx) => {
          const colors = priorityColors[idx % priorityColors.length];
          const priority = idx === 0 ? 'HIGH' : idx === 1 ? 'MEDIUM' : 'ONGOING';
          const priorityColor = idx === 0
            ? 'bg-rose-100 text-rose-700 border-rose-200'
            : idx === 1
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200';

          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-2xl border ${colors.light} hover:shadow-sm transition-all duration-200`}
            >
              {/* Step number */}
              <div className={`w-8 h-8 rounded-xl ${colors.bg} text-white flex items-center justify-center font-extrabold text-xs shrink-0`}>
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${priorityColor} uppercase tracking-wider`}>
                    {priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{step}</p>
              </div>

              <CheckCircle2 size={16} className={`${colors.text} shrink-0 mt-0.5`} />
            </div>
          );
        })}
      </div>

      {/* Schedule reminder */}
      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-teal-100 text-xs text-slate-600">
        <Calendar size={14} className="text-teal-600 shrink-0" />
        <span className="font-semibold">
          Re-run your assessment after completing these steps to see your updated dermal score.
        </span>
      </div>
    </div>
  );
};
