import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingCtaSectionProps {
  onOpenAuth: () => void;
}

export const LandingCtaSection: React.FC<LandingCtaSectionProps> = ({ onOpenAuth }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-[#005049] to-slate-900 text-white p-8 md:p-12 shadow-xl border border-teal-800/80 text-center space-y-5">
      {/* Decorative Blur Orbs */}
      <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
          <Sparkles size={13} className="text-teal-300" />
          <span>START YOUR DERMAL JOURNEY</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          READY TO UNDERSTAND YOUR SKIN?
        </h2>

        <p className="text-sm md:text-base text-teal-100/90 leading-relaxed font-normal max-w-lg mx-auto">
          Create your AuraSkin profile and begin building your personalized skin intelligence, daily biometrics, and explainable care plan.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onOpenAuth}
            className="btn-primary bg-white hover:bg-teal-50 text-[#00685f] hover:text-[#005049] shadow-xl shadow-teal-950/40 px-8 py-3.5 text-base font-black flex items-center gap-2 group transition-all"
          >
            <span>Get Started</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
