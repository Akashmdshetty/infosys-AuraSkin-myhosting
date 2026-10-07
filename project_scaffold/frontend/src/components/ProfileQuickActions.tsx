import React from 'react';
import { Sparkles, Edit3, Droplets, FileText, LayoutDashboard, Stethoscope, ArrowRight } from 'lucide-react';

export const ProfileQuickActions: React.FC = () => {
  const actions = [
    {
      label: 'Edit Skin Profile',
      desc: 'Update skin type & concerns',
      hash: 'data-entry',
      icon: <Edit3 size={16} className="text-teal-600" />,
      bgHover: 'hover:border-teal-400/80 hover:bg-teal-50/40',
    },
    {
      label: 'Update Daily Logs',
      desc: 'Log hydration, sleep & UV',
      hash: 'data-entry',
      icon: <Droplets size={16} className="text-cyan-600" />,
      bgHover: 'hover:border-cyan-400/80 hover:bg-cyan-50/40',
    },
    {
      label: 'View Skin Report',
      desc: '18-point clinical breakdown',
      hash: 'reports',
      icon: <FileText size={16} className="text-sky-600" />,
      bgHover: 'hover:border-sky-400/80 hover:bg-sky-50/40',
    },
    {
      label: 'Open Dashboard',
      desc: 'Composite score & charts',
      hash: 'dashboard',
      icon: <LayoutDashboard size={16} className="text-indigo-600" />,
      bgHover: 'hover:border-indigo-400/80 hover:bg-indigo-50/40',
    },
    {
      label: 'Contact Specialist',
      desc: 'Book clinical telehealth',
      hash: 'portals',
      icon: <Stethoscope size={16} className="text-emerald-600" />,
      bgHover: 'hover:border-emerald-400/80 hover:bg-emerald-50/40',
    },
  ];

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="sample-card bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
          <Sparkles size={16} />
        </div>
        <div>
          <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block">
            NAVIGATION SHORTCUTS
          </span>
          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
            QUICK ACTIONS
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleNavigate(act.hash)}
            className={`p-3.5 rounded-xl border border-slate-200/90 bg-white text-left transition-all duration-200 shadow-2xs group flex flex-col justify-between space-y-2 ${act.bgHover}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                {act.icon}
              </div>
              <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
            </div>

            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-[#00685f] transition-colors">
                {act.label}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                {act.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
