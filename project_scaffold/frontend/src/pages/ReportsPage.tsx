import React, { useState, useEffect, useCallback } from 'react';
import { api, SkinIntelligenceReport } from '../services/api';
import { ReportHeader } from '../components/ReportHeader';
import { ReportPointNav } from '../components/ReportPointNav';
import { ReportSummaryHero } from '../components/ReportSummaryHero';
import { ReportPipelineDiagram } from '../components/ReportPipelineDiagram';
import { ReportFiveFactorSection } from '../components/ReportFiveFactorSection';
import { ReportConcernsSection } from '../components/ReportConcernsSection';
import { ReportRiskSection } from '../components/ReportRiskSection';
import { RoutinePlannerCard } from '../components/RoutinePlannerCard';
import { ReportIngredientsGrid } from '../components/ReportIngredientsGrid';
import { ReportSafetyNotesCard } from '../components/ReportSafetyNotesCard';
import { ReportNextStepsCard } from '../components/ReportNextStepsCard';
import { DermalSphereVisual } from '../components/DermalSphereVisual';
import { ReportEmptyStateCard } from '../components/ReportEmptyStateCard';
import { SkinReportModal } from '../components/SkinReportModal';
import { ContactProfessionalModal } from '../components/ContactProfessionalModal';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ReportsPageProps {
  onNavigate?: (tab: string) => void;
}

// ─── Loading skeleton for the main report content ───────────────────────────
const ReportLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Hero skeleton */}
    <div className="sample-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col items-center gap-3">
          <div className="skeleton-pulse w-44 h-44 rounded-full" />
          <div className="skeleton-pulse h-5 w-28 rounded-full" />
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="skeleton-pulse h-24 rounded-xl" />
          <div className="skeleton-pulse h-16 rounded-xl" />
        </div>
        <div className="lg:col-span-4 space-y-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-pulse h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>

    {/* Pipeline skeleton */}
    <div className="sample-card">
      <div className="skeleton-pulse h-5 w-48 mb-4 rounded" />
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <React.Fragment key={i}>
            <div className="skeleton-pulse w-12 h-12 rounded-2xl" />
            {i < 6 && <div className="skeleton-pulse w-6 h-1 rounded" />}
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Five factor skeleton */}
    <div className="sample-card">
      <div className="skeleton-pulse h-6 w-56 mb-4 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-pulse h-36 rounded-2xl" />
        ))}
      </div>
    </div>

    {/* Two-column skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="sample-card skeleton-pulse h-48" />
      <div className="sample-card skeleton-pulse h-48" />
    </div>
  </div>
);

// ─── Error state card ────────────────────────────────────────────────────────
const ReportErrorCard: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="sample-card card-3d-interactive text-center py-12 px-6 border-2 border-dashed border-rose-200 bg-gradient-to-b from-rose-50/30 to-white animate-fade-in">
    <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-max mx-auto mb-4">
      <AlertCircle size={28} />
    </div>
    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Unable to Generate Your Report</h3>
    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
      The report could not be retrieved. This may be because your profile or assessment data is incomplete.
      Please ensure your Data Entry is complete and try again.
    </p>
    <button
      onClick={onRetry}
      type="button"
      className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2"
    >
      <RefreshCw size={16} />
      <span>Retry Analysis</span>
    </button>
  </div>
);

// ─── Refresh success toast ────────────────────────────────────────────────────
const RefreshSuccessToast: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl animate-fade-in-up">
      <CheckCircle2 size={16} className="text-teal-400" />
      <span className="text-sm font-semibold">Analysis updated successfully</span>
    </div>
  );
};

// ─── Main ReportsPage ─────────────────────────────────────────────────────────
export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [report, setReport] = useState<SkinIntelligenceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);

  const loadReport = useCallback((isRefresh = false) => {
    setLoading(true);
    setError(false);
    api.getSkinReport()
      .then((data) => {
        setReport(data);
        setError(false);
        if (isRefresh) setShowSuccessToast(true);
      })
      .catch(() => {
        setReport(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReport(false);
  }, [loadReport]);

  const handleNavigateToDataEntry = () => {
    if (onNavigate) {
      onNavigate('data-entry');
    } else {
      window.location.hash = 'data-entry';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="sample-container animate-fade-in py-6 max-w-[1280px] mx-auto">

      {/* 1. Report Header with Action Buttons & Metadata */}
      <ReportHeader
        report={report}
        loading={loading}
        onRefresh={() => loadReport(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenPrint={() => setModalOpen(true)}
      />

      {/* 2. 18-Point Quick Navigation Index (sticky) */}
      <ReportPointNav />

      {/* Loading State — premium skeleton */}
      {loading ? (
        <ReportLoadingSkeleton />

      ) : error || !report ? (
        /* Empty / Error State */
        error ? (
          <ReportErrorCard onRetry={() => loadReport(false)} />
        ) : (
          <ReportEmptyStateCard onNavigateToDataEntry={handleNavigateToDataEntry} />
        )

      ) : (
        /* ── Main Report Content ── */
        <div className="space-y-6">

          {/* 3. Hero Assessment Summary & Animated Score Gauge */}
          <ReportSummaryHero report={report} />

          {/* 4. Intelligence Pipeline Visual Flow */}
          <ReportPipelineDiagram />

          {/* 5. 5-Factor Dermal Intelligence Breakdown */}
          <ReportFiveFactorSection scoreBreakdown={report.score_breakdown} />

          {/* 6. Prioritized Skin Concerns */}
          <ReportConcernsSection
            primaryConcern={report.primary_concern}
            secondaryConcerns={report.secondary_concerns}
          />

          {/* 7. Risk & Environmental Factors */}
          <ReportRiskSection
            riskFactors={report.risk_factors}
            positiveFactors={report.positive_factors}
          />

          {/* 8. Chronobiology Skincare Regimen Protocol */}
          <RoutinePlannerCard />

          {/* 9. Active Ingredient Recommendations Grid */}
          <ReportIngredientsGrid recommendations={report.ingredient_recommendations} />

          {/* 10. Clinical Safety & Patch Testing Notes */}
          <ReportSafetyNotesCard safetyNotes={report.safety_notes} />

          {/* 11. Actionable Next Steps */}
          <ReportNextStepsCard
            nextSteps={report.recommended_next_steps}
            onNavigateToDataEntry={handleNavigateToDataEntry}
          />

          {/* 12. Conceptual Dermal Intelligence Orb Visual */}
          <DermalSphereVisual />

        </div>
      )}

      {/* PDF Export & Specialist Contact Modals */}
      <SkinReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <ContactProfessionalModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Refresh success toast */}
      {showSuccessToast && (
        <RefreshSuccessToast onDismiss={() => setShowSuccessToast(false)} />
      )}

      <footer className="mt-12 py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 font-medium">
        AuraSkin 18-Point Clinical Intelligence Diagnostic System © 2025 • Infosys Skincare Project
      </footer>
    </div>
  );
};

export default ReportsPage;
