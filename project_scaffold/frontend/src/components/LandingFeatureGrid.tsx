import React from 'react';
import { Sparkles, Activity, CalendarCheck, Droplets, ArrowUpRight } from 'lucide-react';

interface LandingFeatureGridProps {
  onOpenAuth: () => void;
}

export const LandingFeatureGrid: React.FC<LandingFeatureGridProps> = ({ onOpenAuth }) => {
  const features = [
    {
      step: '01',
      title: 'PERSONALIZED SKIN PROFILE',
      tag: 'BASELINE MAPPING',
      icon: <Sparkles size={24} className="text-teal-600" />,
      description: 'Build a baseline using skin type, concerns, sensitivities, and active barrier markers.',
      gradientClass: 'from-teal-500/10 to-emerald-500/5',
      borderHover: 'hover:border-teal-500/50',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
    },
    {
      step: '02',
      title: '5-FACTOR DERMAL SCORE',
      tag: 'ALGORITHMIC HEALTH',
      icon: <Activity size={24} className="text-sky-600" />,
      description: 'Understand your skin health through a structured 0–100 explainable intelligence score evaluating barrier resilience.',
      gradientClass: 'from-sky-500/10 to-teal-500/5',
      borderHover: 'hover:border-sky-500/50',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
    },
    {
      step: '03',
      title: 'PERSONALIZED ROUTINE',
      tag: 'CHRONOBIOLOGY',
      icon: <CalendarCheck size={24} className="text-indigo-600" />,
      description: 'Receive tailored morning and evening skincare guidance calibrated to ingredient compatibility and circadian regeneration.',
      gradientClass: 'from-indigo-500/10 to-sky-500/5',
      borderHover: 'hover:border-indigo-500/50',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    },
    {
      step: '04',
      title: 'DAILY BIOMETRIC TELEMETRY',
      tag: 'BARRIER TRACKING',
      icon: <Droplets size={24} className="text-cyan-600" />,
      description: 'Track daily hydration intake, sleep duration, and UV sun exposure to protect and optimize your skin barrier in real time.',
      gradientClass: 'from-cyan-500/10 to-teal-500/5',
      borderHover: 'hover:border-cyan-500/50',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    },
  ];

  return (
    <div id="features-preview" className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black uppercase tracking-wider">
          <Sparkles size={13} className="text-teal-600" />
          <span>CORE PLATFORM PILLARS</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Comprehensive AI Dermal Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Explore how AuraSkin translates daily habits, lifestyle telemetry, and clinical dermatological science into personalized care.
        </p>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            onClick={onOpenAuth}
            className={`sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/90 p-7 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 cursor-pointer group relative overflow-hidden flex flex-col justify-between ${feat.borderHover}`}
          >
            {/* Ambient Background Gradient on Hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feat.gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
            />

            <div className="relative z-10 space-y-4">
              {/* Card Top Row: Step Number & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                    {feat.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${feat.badgeBg}`}>
                    {feat.tag}
                  </span>
                </div>

                <span className="text-2xl font-black text-slate-200 group-hover:text-teal-600/40 transition-colors">
                  {feat.step}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-[#00685f] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            </div>

            {/* Bottom Link Cue */}
            <div className="relative z-10 pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
              <span>Explore Capability</span>
              <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
