import React from 'react';
import { ParticleBackground } from './ParticleBackground';
import { LandingOrb } from './LandingOrb';
import { Sparkles, ArrowRight, ShieldCheck, Activity, ChevronDown } from 'lucide-react';

interface LandingHeroProps {
  onOpenAuth: () => void;
  onExplore: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenAuth, onExplore }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-[#00423c] to-slate-950 text-white p-8 md:p-12 shadow-2xl border border-teal-800/70 animate-fade-in">
      {/* Particle Canvas */}
      <ParticleBackground />

      {/* Decorative Gradient Glows */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 -top-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Platform Branding & Value Prop */}
        <div className="max-w-2xl space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-2xs">
            <Sparkles size={13} className="text-teal-300" />
            <span>INFOSYS SKINCARE PROJECT</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              AuraSkin
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-teal-200 mt-1">
                AI Dermal Health & Skin Intelligence Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-teal-100/90 font-medium leading-relaxed">
              Understand your skin through personalized data, daily telemetry, and explainable intelligence.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-teal-200/75 leading-relaxed font-normal max-w-xl">
            An intelligent dermatological platform that evaluates skin health, tracks lifestyle and environmental metrics, and delivers personalized, evidence-backed skincare guidance.
          </p>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-primary shadow-lg shadow-teal-950/50 px-6 py-3 text-sm font-black flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onExplore}
              className="btn-secondary bg-white/10 hover:bg-white/15 text-white border-teal-300/30 px-5 py-3 text-sm font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>Explore AuraSkin</span>
              <ChevronDown size={15} className="text-teal-300" />
            </button>
          </div>

          {/* Telehealth & Biometric Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-teal-200/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>Evidence-Backed Protocols</span>
            </div>
            <span className="hidden sm:inline opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-sky-400" />
              <span>5-Factor Dermal Scoring</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Intelligence Orb */}
        <div className="shrink-0 flex items-center justify-center">
          <LandingOrb />
        </div>
      </div>
    </div>
  );
};
