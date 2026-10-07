import React from 'react';
import { ShieldCheck, TestTube, AlertTriangle, Sun, Stethoscope, ChevronRight } from 'lucide-react';

interface ReportSafetyNotesCardProps {
  safetyNotes?: string[];
}

// Map safety note text to relevant icon + color
const getSafetyIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('patch') || t.includes('test')) return { icon: TestTube, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' };
  if (t.includes('spf') || t.includes('sunscreen') || t.includes('sun')) return { icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (t.includes('dermatologist') || t.includes('consult') || t.includes('professional')) return { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  if (t.includes('irritat') || t.includes('sensitiv') || t.includes('avoid')) return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
  return { icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
};

export const ReportSafetyNotesCard: React.FC<ReportSafetyNotesCardProps> = ({ safetyNotes }) => {
  const defaultNotes = [
    'Perform a 24-hour wrist patch test before introducing new potent actives.',
    'Introduce new active serums gradually — 1-2 times per week initially — to prevent over-exfoliation.',
    'Always finish morning routines with broad-spectrum mineral SPF 50+ sunscreen.',
    'Consult a certified dermatologist if acute irritation, burning, or persistent redness develops.',
  ];

  const notes = safetyNotes && safetyNotes.length > 0 ? safetyNotes : defaultNotes;

  return (
    <div
      id="section-safety"
      className="report-section sample-card card-3d-interactive border-l-4 border-l-[#00685f] bg-gradient-to-br from-white via-teal-50/20 to-white"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 rounded-xl border border-teal-200">
            <ShieldCheck size={16} className="text-teal-600" />
          </div>
          <div>
            <span className="section-label text-teal-700">Clinical Protocol Guidance</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">Clinical Safety & Patch Testing</h3>
          </div>
        </div>
        <span className="hidden sm:block text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
          Evidence-Based
        </span>
      </div>

      {/* Safety notes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {notes.map((note, idx) => {
          const config = getSafetyIcon(note);
          const IconComp = config.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-2xl ${config.bg} border ${config.border} hover:shadow-sm transition-all duration-200`}
            >
              <div className={`p-2 rounded-xl bg-white/80 border ${config.border} shrink-0`}>
                <IconComp size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional consultation CTA */}
      <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Stethoscope size={16} className="text-teal-300" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white">Professional Guidance Available</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Contact a verified dermatologist or skincare consultant via the Portals tab.
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-teal-400 shrink-0" />
      </div>
    </div>
  );
};
