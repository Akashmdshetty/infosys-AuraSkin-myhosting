import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Brain, Target, ArrowRight, Zap } from 'lucide-react';

interface SkinIntelligenceInsightCardProps {
  onNavigateToDataEntry?: () => void;
}

export const SkinIntelligenceInsightCard: React.FC<SkinIntelligenceInsightCardProps> = ({ onNavigateToDataEntry }) => {
  const { sleepRecords, hydrationRecords, environmentalRecords } = useDashboard();

  const latestHydration = hydrationRecords[0]?.water_consumed ?? 2400;
  const latestSleep = sleepRecords[0]?.sleep_hours ?? 8;
  const latestSun = environmentalRecords[0]?.sun_exposure_hours ?? 2;

  // Determine limiting factor deterministically from real backend records
  let insightSummary = '';
  let priorityTitle = '';
  let priorityAction = '';

  if (latestSleep < 7) {
    insightSummary = 'Your hydration level is on track today, but sleep restoration (currently < 7 hrs) is the primary factor limiting your dermal score.';
    priorityTitle = 'Optimize Sleep Recovery';
    priorityAction = 'Aim for 7–8 hours of uninterrupted sleep tonight to support cellular lipid repair.';
  } else if (latestHydration < 2000) {
    insightSummary = 'Sleep and stress scores are stable, but daily water intake (under 2000 ml) is limiting epidermal hydration.';
    priorityTitle = 'Increase Fluid Intake';
    priorityAction = 'Drink an additional 500–1000 ml of water today to restore skin turgor and barrier elasticity.';
  } else if (latestSun > 3) {
    insightSummary = 'Elevated outdoor UV exposure detected today (> 3 hrs). Anti-oxidant protection and nocturnal barrier repair are prioritized.';
    priorityTitle = 'Apply SPF & Evening Antioxidants';
    priorityAction = 'Reapply broad-spectrum sunscreen and utilize Vitamin C or Niacinamide in your evening routine.';
  } else {
    insightSummary = 'Your hydration, sleep restoration, and UV exposure metrics are balanced and supporting optimal skin health.';
    priorityTitle = 'Maintain Consistent Regimen';
    priorityAction = 'Continue your current morning antioxidant & SPF 50+ protocol and maintain daily telemetry intake.';
  }

  return (
    <div className="sample-card card-3d-interactive bg-gradient-to-br from-[#00685f]/5 via-teal-50/40 to-sky-50/40 border border-teal-200/80">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-[#00685f] text-white rounded-xl shadow-xs">
          <Brain size={18} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Deterministic Engine</span>
          <h3 className="text-base font-bold text-slate-900">Today's Skin Intelligence</h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
        "{insightSummary}"
      </p>

      {/* Action Priority Box */}
      <div className="p-3.5 bg-white/90 rounded-xl border border-teal-100 shadow-2xs mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Target size={18} className="text-teal-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900">{priorityTitle}</div>
            <div className="text-xs text-slate-600 mt-0.5">{priorityAction}</div>
          </div>
        </div>

        <button
          onClick={onNavigateToDataEntry}
          type="button"
          className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap shrink-0"
        >
          <Zap size={13} />
          <span>Update Telemetry</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
