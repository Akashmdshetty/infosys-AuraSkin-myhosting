import React, { useState, useEffect } from 'react';
import { ListFilter, ChevronRight } from 'lucide-react';

export const ReportPointNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('section-summary');

  const points = [
    { id: 'section-summary',     label: '01', title: 'Profile' },
    { id: 'section-completeness',label: '02', title: 'Status' },
    { id: 'section-score',       label: '03', title: 'Score' },
    { id: 'section-factors',     label: '04–08', title: 'Factors' },
    { id: 'section-concerns',    label: '09', title: 'Concerns' },
    { id: 'section-risk',        label: '10', title: 'Risks' },
    { id: 'section-routine',     label: '11', title: 'Routine' },
    { id: 'section-ingredients', label: '12', title: 'Ingredients' },
    { id: 'section-safety',      label: '13', title: 'Safety' },
    { id: 'section-adherence',   label: '14', title: 'Adherence' },
    { id: 'section-environment', label: '15', title: 'Environment' },
    { id: 'section-recommendations', label: '16', title: 'Recs' },
    { id: 'section-nextsteps',   label: '17', title: 'Next Steps' },
    { id: 'section-notes',       label: '18', title: 'Clinical Notes' },
  ];

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = points.map(p => p.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const handleScroll = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="report-nav-sticky no-print mb-6 -mx-0">
      <div className="py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {/* Index Label */}
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#00685f] px-3 py-1.5 bg-teal-50 rounded-xl border border-teal-200/60 mr-2 shrink-0 uppercase tracking-widest">
            <ListFilter size={12} />
            <span>18-Point Index</span>
          </div>

          {/* Nav Items */}
          {points.map((p, idx) => {
            const isActive = activeSection === p.id;
            return (
              <button
                key={idx}
                onClick={() => handleScroll(p.id)}
                type="button"
                aria-label={`Navigate to ${p.title}`}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                  transition-all duration-200 whitespace-nowrap cursor-pointer
                  ${isActive
                    ? 'bg-[#00685f] text-white shadow-sm shadow-teal-500/20 scale-105'
                    : 'text-slate-500 hover:text-[#00685f] hover:bg-teal-50/80'
                  }
                `}
              >
                <span className={`text-[9px] font-extrabold ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                  {p.label}
                </span>
                <span>{p.title}</span>
                {isActive && <ChevronRight size={10} className="text-teal-200" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
