import React from 'react';
import { LandingHero } from '../components/LandingHero';
import { LandingFeatureGrid } from '../components/LandingFeatureGrid';
import { LandingHowItWorks } from '../components/LandingHowItWorks';
import { LandingCtaSection } from '../components/LandingCtaSection';
import { ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const handleExplore = () => {
    const el = document.getElementById('features-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-14 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* 1. Hero Section with Particle Canvas & Dermal Intelligence Orb */}
      <LandingHero onOpenAuth={onOpenAuth} onExplore={handleExplore} />

      {/* 2. 4 Core Platform Feature Cards */}
      <LandingFeatureGrid onOpenAuth={onOpenAuth} />

      {/* 3. System Architecture & How It Works Pipeline */}
      <LandingHowItWorks />

      {/* 4. Final High-Impact CTA */}
      <LandingCtaSection onOpenAuth={onOpenAuth} />

      {/* 6. Clinical Trust, Safety & Healthcare Disclaimer Footer */}
      <footer className="pt-6 border-t border-slate-200/80 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
          <ShieldCheck size={14} className="text-teal-600 shrink-0" />
          <span>Clinical Healthcare Notice</span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Designed to support informed skincare decisions. For diagnosis or treatment of medical conditions, consult a qualified healthcare professional.
        </p>
        <div className="text-[11px] text-slate-400 font-medium pt-1">
          AuraSkin AI Dermal Health & Skin Intelligence Platform • Infosys Skincare Project © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
