import React from 'react';
import { User, Droplets, Cpu, Activity, CalendarCheck, FileText, ArrowRight } from 'lucide-react';

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'PROFILE',
      label: 'Skin Baseline',
      icon: <User size={18} />,
      colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      num: '02',
      title: 'TELEMETRY',
      label: 'Daily Habits',
      icon: <Droplets size={18} />,
      colorClass: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    },
    {
      num: '03',
      title: 'AI ENGINE',
      label: 'Deep Inference',
      icon: <Cpu size={18} />,
      colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      num: '04',
      title: 'HEALTH SCORE',
      label: '5-Factor Model',
      icon: <Activity size={18} />,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      num: '05',
      title: 'ROUTINE',
      label: 'AM/PM Chrono',
      icon: <CalendarCheck size={18} />,
      colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      num: '06',
      title: 'REPORT',
      label: 'Explainable AI',
      icon: <FileText size={18} />,
      colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div id="how-it-works" className="sample-card bg-gradient-to-br from-white via-slate-50/50 to-teal-50/20 border border-slate-200/90 p-8 rounded-3xl shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black uppercase tracking-wider">
          <Cpu size={13} className="text-teal-600" />
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          HOW AURASKIN WORKS
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          From raw physiological telemetry to algorithmic skin intelligence and tailored clinical reports.
        </p>
      </div>

      {/* Connected 6-Node Architecture Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center relative group hover:border-teal-400 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between space-y-3"
          >
            {/* Step Number Top */}
            <span className="text-[10px] font-black text-slate-400 tracking-wider">
              {step.num}
            </span>

            {/* Icon */}
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform ${step.colorClass}`}
            >
              {step.icon}
            </div>

            {/* Label */}
            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-[#00685f] transition-colors">
                {step.title}
              </span>
              <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                {step.label}
              </span>
            </div>

            {/* Desktop Flow Arrow Indicator */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 text-slate-300">
                <ArrowRight size={14} className="flow-arrow-animate" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
