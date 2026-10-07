import React from 'react';
import { UserCheck, Clock, CheckCircle2 } from 'lucide-react';

interface PortalSummaryCardsProps {
  specialistCount: number;
  pendingCount: number;
  completedCount: number;
}

export const PortalSummaryCards: React.FC<PortalSummaryCardsProps> = ({
  specialistCount,
  pendingCount,
  completedCount,
}) => {
  const cards = [
    {
      title: 'Available Specialists',
      value: specialistCount,
      subtitle: 'Verified & active practitioners',
      icon: <UserCheck size={22} />,
      colorClass: 'text-teal-700 bg-teal-50 border-teal-200/80',
      badgeClass: 'bg-teal-100/80 text-teal-800',
      accentBorder: 'hover:border-teal-500/40',
    },
    {
      title: 'Pending Consultations',
      value: pendingCount,
      subtitle: 'Awaiting specialist review',
      icon: <Clock size={22} />,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200/80',
      badgeClass: 'bg-amber-100/80 text-amber-800',
      accentBorder: 'hover:border-amber-500/40',
    },
    {
      title: 'Completed Consultations',
      value: completedCount,
      subtitle: 'Clinical reviews & guidance delivered',
      icon: <CheckCircle2 size={22} />,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      badgeClass: 'bg-emerald-100/80 text-emerald-800',
      accentBorder: 'hover:border-emerald-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${card.accentBorder}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {card.title}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {card.subtitle}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${card.colorClass} shadow-2xs`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
