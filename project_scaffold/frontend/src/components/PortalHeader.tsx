import React from 'react';
import { ParticleBackground } from './ParticleBackground';
import { DermalCareOrb } from './DermalCareOrb';
import { Stethoscope, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface PortalHeaderProps {
  onOpenContact: () => void;
  isUser: boolean;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ onOpenContact, isUser }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-[#004d46] to-slate-900 text-white p-6 md:p-8 shadow-xl border border-teal-800/60 animate-fade-in">
      {/* Particle Atom Network Background */}
      <ParticleBackground />

      {/* Decorative Gradient Background Highlights */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Branding & Value Proposition */}
        <div className="max-w-2xl space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={13} className="text-teal-300" />
            <span>SPECIALIST CARE & TELEHEALTH</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Specialist Directory & Consultation
          </h1>

          <p className="text-sm md:text-base text-teal-100/80 leading-relaxed font-normal">
            Connect with verified skincare professionals for consultation, assessment review, and personalized guidance.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-teal-200/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-teal-400" />
              <span>Board Certified Specialists</span>
            </div>
            <span className="hidden sm:inline opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <Stethoscope size={15} className="text-sky-400" />
              <span>Diagnostic Report Review</span>
            </div>
          </div>

          {isUser && (
            <div className="pt-3 flex justify-center lg:justify-start">
              <button
                type="button"
                onClick={onOpenContact}
                className="btn-primary shadow-lg shadow-teal-950/40 px-5 py-2.5 text-sm font-bold flex items-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Contact Specialist</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Floating Dermal Care Orb */}
        <div className="shrink-0 flex items-center justify-center">
          <DermalCareOrb />
        </div>
      </div>
    </div>
  );
};
