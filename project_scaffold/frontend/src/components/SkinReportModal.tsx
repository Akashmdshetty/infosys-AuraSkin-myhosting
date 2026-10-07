import React, { useState, useEffect } from 'react';
import { api, SkinIntelligenceReport } from '../services/api';
import {
  X, Printer, Download, Sparkles, ShieldCheck, AlertCircle,
  FileText, CheckCircle2, FileSpreadsheet
} from 'lucide-react';

interface SkinReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
}

export const SkinReportModal: React.FC<SkinReportModalProps> = ({ isOpen, onClose, clientId }) => {
  const [report, setReport] = useState<SkinIntelligenceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchReport = clientId ? api.getClientReport(clientId) : api.getSkinReport();
      fetchReport
        .then(setReport)
        .catch(() => setReport(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await api.exportReportPdf(clientId);
    } catch (e) {
      console.error('Failed to export PDF:', e);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await api.exportReportExcel(clientId);
    } catch (e) {
      console.error('Failed to export Excel:', e);
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Clinical Skin Intelligence Report</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                18-Point Explainable Dermal & Biometric Analysis Report
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="btn-primary text-xs"
              style={{ padding: '0.4rem 0.75rem' }}
              type="button"
            >
              <Download size={14} className={exportingPdf ? 'animate-bounce' : ''} />
              <span>{exportingPdf ? 'Exporting...' : 'PDF'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="btn-secondary text-xs"
              style={{ padding: '0.4rem 0.75rem' }}
              type="button"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>{exportingExcel ? 'Exporting...' : 'Excel'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-secondary text-xs"
              style={{ padding: '0.4rem 0.75rem' }}
              type="button"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: '0.25rem' }} type="button">
              <X size={22} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Assembling full 18-part intelligence report...</p>
          </div>
        ) : report ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. User Summary & Confidence */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', background: 'var(--bg-glass-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>1. Client Summary</h4>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{report.user_summary.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{report.user_summary.email}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Age: {report.user_summary.age} • Country: {report.user_summary.country}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>17. Assessment Confidence</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{report.assessment_confidence}%</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({report.data_completeness}% data completeness)</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{report.confidence_explanation}</p>
              </div>
            </div>

            {/* 2 & 3. Skin Profile & Overall Health Score */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>2. Dermal Profile Baseline</h4>
                <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Skin Type:</strong> {report.skin_profile.skin_type}</p>
                <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Reported Concerns:</strong> {report.skin_profile.reported_concerns}</p>
                <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Allergies:</strong> {report.skin_profile.allergies}</p>
                <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Sensitivities:</strong> {report.skin_profile.sensitivities}</p>
              </div>

              <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>3. Overall Skin Health Score</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: report.overall_skin_health_score >= 70 ? '#10b981' : '#f59e0b' }}>
                  {report.overall_skin_health_score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
            </div>

            {/* 4. Score Breakdown Table */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. 5-Part Score Breakdown</h4>
              <div style={{ background: 'var(--bg-glass-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                {report.score_breakdown.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: idx < report.score_breakdown.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{b.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-hover)' }}>{b.earned} / {b.max_possible} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5, 6, 7, 8. Concerns & Factors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.4rem' }}>5 & 6. Prioritized Concerns</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Primary: {report.primary_concern}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Secondary: {report.secondary_concerns.join(', ')}</p>
              </div>

              <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', margin: '0 0 0.4rem' }}>7. Risk Factors</h4>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {report.risk_factors.map((rf, rIdx) => <li key={rIdx}>{rf}</li>)}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', margin: '0 0 0.4rem' }}>8. Supporting Factors</h4>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {report.positive_factors.map((pf, pIdx) => <li key={pIdx}>{pf}</li>)}
                </ul>
              </div>
            </div>

            {/* 9, 10 & 11. Morning, Evening & Weekly Routines */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>9, 10 & 11. Personalized Morning, Evening & Weekly Regimen</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 0.5rem' }}>☀️ Morning Steps</h5>
                  {report.morning_routine.map(s => (
                    <div key={s.step_number} style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <strong>Step {s.step_number}: {s.product_type}</strong> - {s.instructions}
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6366f1', margin: '0 0 0.5rem' }}>🌙 Evening Steps</h5>
                  {report.evening_routine.map(s => (
                    <div key={s.step_number} style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <strong>Step {s.step_number}: {s.product_type}</strong> - {s.instructions}
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9333ea', margin: '0 0 0.5rem' }}>✨ Weekly Protocol</h5>
                  {report.weekly_routine && report.weekly_routine.length > 0 ? (
                    report.weekly_routine.map(s => (
                      <div key={s.step_number} style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                        <strong>Step {s.step_number}: {s.product_type}</strong> ({s.frequency}) - {s.instructions}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      1x/week chemical exfoliation or deep soothing treatment mask.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 12, 13, 14, 15, 16. Evidence & Safety Notes */}
            <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857', margin: '0 0 0.4rem' }}>15. Safety Validation Notes</h4>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {report.safety_notes.map((sn, sIdx) => <li key={sIdx}>{sn}</li>)}
              </ul>
            </div>

            {/* 18. Recommended Next Steps */}
            <div style={{ background: 'var(--color-primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-hover)', margin: '0 0 0.4rem' }}>18. Recommended Next Steps</h4>
              <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {report.recommended_next_steps.map((ns, nIdx) => <li key={nIdx}>{ns}</li>)}
              </ol>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            Unable to load report data. Please ensure assessment has been generated.
          </div>
        )}
      </div>
    </div>
  );
};
