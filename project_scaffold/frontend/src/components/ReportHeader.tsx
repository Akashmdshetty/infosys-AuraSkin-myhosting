import React, { useState } from 'react';
import { ParticleBackground } from './ParticleBackground';
import {
  FileText, RefreshCw, MessageSquare, Printer, Calendar,
  ShieldCheck, Activity, Clock, Download, FileSpreadsheet, Check
} from 'lucide-react';
import { SkinIntelligenceReport, api } from '../services/api';

interface ReportHeaderProps {
  report: SkinIntelligenceReport | null;
  loading: boolean;
  clientId?: number;
  onRefresh: () => void;
  onOpenContact: () => void;
  onOpenPrint: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  report,
  loading,
  clientId,
  onRefresh,
  onOpenContact,
  onOpenPrint,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const generatedDateFormatted = report?.generated_at
    ? new Date(report.generated_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });

  const generatedTimeFormatted = report?.generated_at
    ? new Date(report.generated_at).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      })
    : '--:--';

  const handleExportPdf = async () => {
    setDownloadingPdf(true);
    try {
      await api.exportReportPdf(clientId);
      setDownloadSuccess('PDF Report downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setDownloadingExcel(true);
    try {
      await api.exportReportExcel(clientId);
      setDownloadSuccess('Excel Data workbook downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Excel export failed:', err);
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/40 to-sky-50/40 rounded-2xl border border-teal-100 p-6 md:p-8 mb-6 shadow-sm">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Title & Metadata */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100/60 border border-teal-200/80 rounded-full text-xs font-bold text-[#00685f] uppercase tracking-wider mb-2 backdrop-blur-sm">
            <FileText size={13} className="text-teal-600" />
            <span>18-Part Clinical Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dermal Intelligence Report
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-xl leading-relaxed">
            An explainable clinical diagnostic assessment of your skin profile, lifestyle telemetry, environmental exposure, and chronobiology skincare protocol.
          </p>

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              <Calendar size={13} className="text-teal-600" />
              <span>Assessment: {generatedDateFormatted}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              <Clock size={13} className="text-sky-600" />
              <span>Last Updated: {generatedTimeFormatted}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              <Activity size={13} className="text-emerald-600" />
              <span>Completeness: {report?.data_completeness ?? '–'}%</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              <ShieldCheck size={13} className="text-violet-600" />
              <span>Confidence: {report?.assessment_confidence ?? '–'}%</span>
            </div>
          </div>

          {/* Download Success Banner */}
          {downloadSuccess && (
            <div className="mt-3.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in w-fit">
              <Check size={14} className="text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={onRefresh}
            type="button"
            disabled={loading}
            aria-label="Refresh analysis"
            className="btn-secondary text-xs px-3.5 py-2.5 hover:border-teal-400 hover:text-[#00685f] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-teal-600' : ''} />
            <span>{loading ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            type="button"
            className="btn-primary text-xs px-3.5 py-2.5 flex items-center gap-1.5 disabled:opacity-60"
            title="Download formatted Clinical PDF report"
          >
            <Download size={14} className={downloadingPdf ? 'animate-bounce' : ''} />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={downloadingExcel}
            type="button"
            className="btn-secondary text-xs px-3.5 py-2.5 hover:border-emerald-500 hover:text-emerald-700 flex items-center gap-1.5 disabled:opacity-60"
            title="Download multi-sheet Excel raw telemetry and adherence workbook"
          >
            <FileSpreadsheet size={14} className={downloadingExcel ? 'animate-bounce text-emerald-600' : 'text-emerald-600'} />
            <span>{downloadingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={onOpenContact}
            type="button"
            aria-label="Contact specialist"
            className="btn-secondary text-xs px-3.5 py-2.5"
          >
            <MessageSquare size={14} />
            <span className="hidden lg:inline">Specialist</span>
          </button>

          <button
            onClick={onOpenPrint}
            type="button"
            aria-label="Print preview modal"
            className="btn-secondary text-xs px-3 py-2.5 hover:border-teal-400 hover:text-[#00685f]"
            title="Print Preview Modal"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
