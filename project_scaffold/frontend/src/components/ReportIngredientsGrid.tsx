import React from 'react';
import { Recommendation } from '../services/api';
import { Sparkles, ShieldCheck, AlertTriangle, FlaskConical } from 'lucide-react';

interface ReportIngredientsGridProps {
  recommendations?: Recommendation[];
}

export const ReportIngredientsGrid: React.FC<ReportIngredientsGridProps> = ({ recommendations }) => {
  const defaultRecs: Recommendation[] = [
    {
      id: 1, user_id: 1,
      recommendation_type: 'INGREDIENT',
      ingredient_or_category: 'Niacinamide (Vitamin B3)',
      target_concern: 'Uneven Skin Tone & Redness',
      reason: 'Calms inflammatory pathways and supports epidermal lipid synthesis.',
      precautions: null,
      evidence_reference: 'Dermatology Journal Clinical Trial Grade A',
      created_at: new Date().toISOString(),
    },
    {
      id: 2, user_id: 1,
      recommendation_type: 'INGREDIENT',
      ingredient_or_category: 'Hyaluronic Acid (Multi-Molecular)',
      target_concern: 'Dehydration & Barrier Integrity',
      reason: 'Attracts and retains up to 1000x its weight in water across dermal layers.',
      precautions: null,
      evidence_reference: 'Cosmetic Science Barrier Assessment 2024',
      created_at: new Date().toISOString(),
    },
    {
      id: 3, user_id: 1,
      recommendation_type: 'INGREDIENT',
      ingredient_or_category: 'Ceramides (NP / AP / EOP)',
      target_concern: 'Lipid Barrier Repair',
      reason: 'Replenishes essential intercellular lipids to prevent trans-epidermal water loss.',
      precautions: null,
      evidence_reference: 'Epidermal Health Guidelines',
      created_at: new Date().toISOString(),
    },
    {
      id: 4, user_id: 1,
      recommendation_type: 'INGREDIENT',
      ingredient_or_category: 'Broad-Spectrum Mineral Sunscreen SPF 50+',
      target_concern: 'UV Defense & Photo-aging Protection',
      reason: 'Physical UV block to prevent oxidative free radical damage and spot formation.',
      precautions: 'Reapply every 2 hours during prolonged sun exposure.',
      evidence_reference: 'Skin Cancer Foundation Protocol',
      created_at: new Date().toISOString(),
    },
  ];

  const list = recommendations && recommendations.length > 0 ? recommendations : defaultRecs;

  // Determine if a precaution indicates a sensitivity warning
  const isSensitivityWarning = (precautions?: string | null) => {
    if (!precautions) return false;
    const lower = precautions.toLowerCase();
    return lower.includes('avoid') || lower.includes('sensitivity') || lower.includes('sensitive') || lower.includes('irritat');
  };

  // Ingredient category label (inferred from recommendation_type or ingredient name)
  const getCategoryBadge = (rec: Recommendation) => {
    const name = rec.ingredient_or_category.toLowerCase();
    if (name.includes('spf') || name.includes('sunscreen')) return { label: 'UV Protection', cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (name.includes('acid') || name.includes('aha') || name.includes('bha')) return { label: 'Active Acid', cls: 'bg-violet-100 text-violet-800 border-violet-200' };
    if (name.includes('ceramide') || name.includes('barrier')) return { label: 'Barrier Repair', cls: 'bg-sky-100 text-sky-800 border-sky-200' };
    if (name.includes('vitamin') || name.includes('niacin') || name.includes('retinol')) return { label: 'Vitamin Active', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (name.includes('hyaluronic') || name.includes('hydrat')) return { label: 'Humectant', cls: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { label: 'Active Ingredient', cls: 'bg-teal-100 text-teal-800 border-teal-200' };
  };

  return (
    <div id="section-ingredients" className="report-section sample-card card-3d-interactive">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 rounded-xl border border-teal-200">
            <FlaskConical size={16} className="text-teal-600" />
          </div>
          <div>
            <span className="section-label text-teal-700">Clinical Formulation</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Active Ingredient Recommendations</h3>
          </div>
        </div>
        <span className="hidden sm:block text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
          {list.length} Recommended
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((rec, idx) => {
          const category = getCategoryBadge(rec);
          const hasWarning = isSensitivityWarning(rec.precautions);
          const isCompatible = !hasWarning;

          return (
            <div
              key={idx}
              className="ingredient-card p-4 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-teal-50/20 border border-slate-200/80 flex flex-col justify-between"
            >
              {/* Top row */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00685f] text-lg leading-none">✦</span>
                    <span className="text-sm font-extrabold text-slate-900 leading-tight">
                      {rec.ingredient_or_category}
                    </span>
                  </div>
                  {/* Category badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${category.cls}`}>
                    {category.label}
                  </span>
                </div>

                {/* Target concern chip */}
                {rec.target_concern && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2.5 py-0.5 rounded-lg mb-3 border border-teal-200/40">
                    <span className="text-teal-500">→</span>
                    <span>Target: {rec.target_concern}</span>
                  </div>
                )}

                {/* Reason */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {rec.reason}
                </p>

                {/* Precautions / sensitivity warning */}
                {rec.precautions && (
                  <div className={`flex items-start gap-2 p-2.5 rounded-xl mb-3 text-[11px] font-semibold leading-snug ${
                    hasWarning
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-slate-50 border border-slate-200 text-slate-600'
                  }`}>
                    {hasWarning ? (
                      <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck size={13} className="text-teal-500 shrink-0 mt-0.5" />
                    )}
                    <span>{rec.precautions}</span>
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {/* Compatibility indicator */}
                <span className={`flex items-center gap-1.5 text-[11px] font-bold ${
                  isCompatible ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {isCompatible ? (
                    <>
                      <ShieldCheck size={13} />
                      Compatible with profile
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      Check sensitivity notes
                    </>
                  )}
                </span>

                {/* Recommended badge */}
                <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-600 to-[#00685f] text-white shadow-sm">
                  <Sparkles size={10} />
                  Recommended
                </span>
              </div>

              {/* Evidence reference (subtle) */}
              {rec.evidence_reference && (
                <div className="mt-2 text-[9px] text-slate-400 font-medium flex items-center gap-1">
                  <span>📄</span>
                  <span className="truncate">{rec.evidence_reference}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
