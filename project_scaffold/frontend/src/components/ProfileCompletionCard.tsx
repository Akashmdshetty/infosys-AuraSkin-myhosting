import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CheckCircle2, Circle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProfileCompletionCardProps {
  onNavigateToDataEntry?: () => void;
  hasSkinProfile?: boolean;
  hasLifestyle?: boolean;
  hasTelemetry?: boolean;
  hasAssessment?: boolean;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  onNavigateToDataEntry,
  hasSkinProfile: propHasSkinProfile,
  hasLifestyle: propHasLifestyle,
  hasTelemetry: propHasTelemetry,
  hasAssessment: propHasAssessment,
}) => {
  const dashboard = useDashboard();

  // If explicit props were passed, use them; otherwise fallback to dashboard context
  const skinProfileDone =
    propHasSkinProfile !== undefined ? propHasSkinProfile : !!dashboard?.skinProfile;
  const lifestyleDone =
    propHasLifestyle !== undefined ? propHasLifestyle : !!dashboard?.lifestyle;
  const telemetryDone =
    propHasTelemetry !== undefined
      ? propHasTelemetry
      : !!(
          dashboard?.hydrationRecords.length ||
          dashboard?.sleepRecords.length ||
          dashboard?.environmentalRecords.length
        );
  const assessmentDone =
    propHasAssessment !== undefined ? propHasAssessment : !!dashboard?.skinProfile;

  const steps = [
    { label: 'Baseline Skin Profile', completed: skinProfileDone },
    { label: 'Lifestyle & Stress Profile', completed: lifestyleDone },
    { label: 'Daily Biometric Telemetry', completed: telemetryDone },
    { label: 'AI Dermal Assessment & Score', completed: assessmentDone },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  const handleComplete = () => {
    if (onNavigateToDataEntry) {
      onNavigateToDataEntry();
    } else if (!skinProfileDone || !lifestyleDone || !telemetryDone) {
      window.location.hash = 'data-entry';
    } else {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
            <ShieldCheck size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block">
              ONBOARDING STATUS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              PROFILE COMPLETION
            </h3>
          </div>
        </div>

        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-black text-[#00685f]">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
          <span>0%</span>
          <span>{completedCount} of 4 Modules Completed</span>
          <span>100%</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 pt-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              step.completed
                ? 'bg-teal-50/50 border-teal-100 text-teal-900 font-medium'
                : 'bg-slate-50/60 border-slate-100 text-slate-500'
            }`}
          >
            <span className="text-[11px] font-bold">{step.label}</span>
            {step.completed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={11} className="text-teal-600" />
                Done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <Circle size={10} />
                Pending
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={handleComplete}
        className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-2xs group"
      >
        <span>{percentage === 100 ? 'Review Skin Profile' : 'Complete Next Step'}</span>
        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
