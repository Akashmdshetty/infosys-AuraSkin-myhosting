import React from 'react';
import { ParticleBackground } from './ParticleBackground';
import { ProfileOrb } from './ProfileOrb';
import { Sparkles, ShieldCheck, UserCheck, HeartHandshake } from 'lucide-react';

interface ProfileHeaderProps {
  onOpenEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onOpenEdit }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-[#004d46] to-slate-900 text-white p-6 md:p-8 shadow-xl border border-teal-800/60 animate-fade-in">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Decorative Gradient Background Highlights */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 -top-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Headline & Copy */}
        <div className="max-w-2xl space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={13} className="text-teal-300" />
            <span>PERSONAL IDENTITY & INTELLIGENCE</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Your AuraSkin Identity & Skin Intelligence Profile
          </h1>

          <p className="text-sm md:text-base text-teal-100/80 leading-relaxed font-normal">
            Manage your account and review the clinical information AuraSkin uses to personalize your skincare experience and AI assessments.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-teal-200/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-teal-400" />
              <span>HIPAA Compliant Data Handling</span>
            </div>
            <span className="hidden sm:inline opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <UserCheck size={15} className="text-sky-400" />
              <span>Biometric Telemetry Linked</span>
            </div>
          </div>
        </div>

        {/* Right: Floating Dermal Identity Orb */}
        <div className="shrink-0 flex items-center justify-center">
          <ProfileOrb />
        </div>
      </div>
    </div>
  );
};
