import React from 'react';
import { Sparkles, FileText, Share2, Activity, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { SkinHealthScore, SkinAssessment } from '../services/api';

interface PortalAssessmentCardProps {
  score: SkinHealthScore | null;
  assessment: SkinAssessment | null;
  onOpenContact: () => void;
  onNavigateReports?: () => void;
}

export const PortalAssessmentCard: React.FC<PortalAssessmentCardProps> = ({
  score,
  assessment,
  onOpenContact,
  onNavigateReports,
}) => {
  const hasAssessment = !!(score || assessment);
  const totalScore = score?.total_score ?? null;
  const completeness = assessment?.data_completeness ?? null;
  const primaryConcern = assessment?.primary_concern || 'General Dermal Care';
  const lastDate = assessment?.created_at || score?.created_at;

  const formattedDate = lastDate
    ? new Date(lastDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not yet recorded';

  const handleViewReport = () => {
    if (onNavigateReports) {
      onNavigateReports();
    } else {
      window.location.hash = 'reports';
    }
  };

  return (
    <div className="sample-card card-3d-interactive bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 border border-teal-200/80 p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left column: Overview */}
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#00685f] uppercase tracking-wider">
            <Sparkles size={14} />
            <span>AI Diagnostic Telemetry</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            YOUR AURASKIN ASSESSMENT
          </h3>

          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
            Your live skin biometrics, routine adherence, and clinical markers can be securely shared with verified specialists for targeted evaluations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleViewReport}
            className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5 flex-1 lg:flex-initial"
          >
            <FileText size={15} />
            <span>View Full Report</span>
            <ArrowRight size={13} className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onOpenContact}
            className="btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-1.5 flex-1 lg:flex-initial"
          >
            <Share2 size={15} />
            <span>Share With Specialist</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {hasAssessment ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-teal-100/70">
          {/* Metric 1: Dermal Health Score */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Activity size={12} className="text-teal-600" />
              Dermal Score
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#00685f]">
                {totalScore !== null ? totalScore : '--'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full"
                style={{ width: `${Math.min(totalScore ?? 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Completeness */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 size={12} className="text-sky-600" />
              Completeness
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-sky-700">
                {completeness !== null ? `${completeness}%` : '--'}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                style={{ width: `${Math.min(completeness ?? 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Primary Concern */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Primary Concern
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800 line-clamp-1">
              {primaryConcern}
            </div>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
              Active Focus
            </span>
          </div>

          {/* Metric 4: Last Assessment */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={12} className="text-teal-600" />
              Last Assessment
            </span>
            <div className="mt-1 text-sm font-bold text-slate-800">
              {formattedDate}
            </div>
            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500">
              Ready for review
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 pt-4 border-t border-teal-100/70 text-center py-4 bg-teal-50/50 rounded-xl">
          <p className="text-xs text-slate-600">
            No assessment on file yet. Complete your daily telemetry entry or generate a report to link your metrics with clinical specialists.
          </p>
        </div>
      )}
    </div>
  );
};
