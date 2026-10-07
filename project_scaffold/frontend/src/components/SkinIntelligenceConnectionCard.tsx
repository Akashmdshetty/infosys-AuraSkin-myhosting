import React from 'react';
import { Brain, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SkinIntelligenceConnectionCardProps {
  onNavigateToDashboard?: () => void;
}

export const SkinIntelligenceConnectionCard: React.FC<SkinIntelligenceConnectionCardProps> = ({ onNavigateToDashboard }) => {
  return (
    <div className="sample-card card-3d-interactive bg-gradient-to-br from-[#00685f]/5 via-teal-50/50 to-white border border-teal-200/80">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-[#00685f] text-white rounded-xl shadow-xs">
          <Brain size={18} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Scoring Model Integration</span>
          <h3 className="text-base font-bold text-slate-900">Skin Intelligence Connection</h3>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Today's biometric and environmental telemetry inputs feed directly into your algorithmic 5-Factor Dermal Health Score:
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-semibold text-slate-700">
        <div className="p-2 bg-white/90 rounded-lg border border-teal-100 flex items-center gap-1.5">
          <Sparkles size={13} className="text-teal-600" />
          <span>Hydration Matrix</span>
        </div>
        <div className="p-2 bg-white/90 rounded-lg border border-teal-100 flex items-center gap-1.5">
          <Sparkles size={13} className="text-teal-600" />
          <span>Sleep Restoration</span>
        </div>
        <div className="p-2 bg-white/90 rounded-lg border border-teal-100 flex items-center gap-1.5">
          <Sparkles size={13} className="text-teal-600" />
          <span>Lifestyle & UV Load</span>
        </div>
        <div className="p-2 bg-white/90 rounded-lg border border-teal-100 flex items-center gap-1.5">
          <Sparkles size={13} className="text-teal-600" />
          <span>Protocol Adherence</span>
        </div>
      </div>

      <button
        onClick={onNavigateToDashboard}
        type="button"
        className="sample-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
      >
        <ShieldCheck size={14} />
        <span>View My Skin Score & Assessment</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
