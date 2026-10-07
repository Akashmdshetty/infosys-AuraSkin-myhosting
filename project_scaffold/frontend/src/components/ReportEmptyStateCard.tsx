import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface ReportEmptyStateCardProps {
  onNavigateToDataEntry?: () => void;
}

export const ReportEmptyStateCard: React.FC<ReportEmptyStateCardProps> = ({ onNavigateToDataEntry }) => {
  const { skinProfile, lifestyle, sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  const hasSkin = !!skinProfile;
  const hasLifestyle = !!lifestyle;
  const hasTelemetry = sleepRecords.length > 0 || hydrationRecords.length > 0 || environmentalRecords.length > 0;
  const hasAssessment = hasSkin && hasLifestyle;

  return (
    <div className="sample-card card-3d-interactive text-center py-10 px-6 border-2 border-dashed border-teal-200 bg-gradient-to-b from-teal-50/30 to-white">
      <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl w-max mx-auto mb-3">
        <AlertCircle size={28} />
      </div>

      <h3 className="text-xl font-extrabold text-slate-900 mb-2">NO REPORT AVAILABLE YET</h3>
      <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6">
        Complete your baseline profile and daily telemetry in the Data Entry tab to generate your personalized 18-part dermal intelligence report.
      </p>

      {/* Checklist Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-6 text-xs font-semibold text-slate-700">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-1.5">
          {hasSkin ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}
          <span>Skin Profile</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-1.5">
          {hasLifestyle ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}
          <span>Lifestyle</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-1.5">
          {hasTelemetry ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}
          <span>Daily Telemetry</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-1.5">
          {hasAssessment ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}
          <span>Assessment</span>
        </div>
      </div>

      <button
        onClick={onNavigateToDataEntry}
        type="button"
        className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2"
      >
        <span>Complete Data Entry & Daily Logs</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
