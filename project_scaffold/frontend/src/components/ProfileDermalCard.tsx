import React from 'react';
import { SkinProfile } from '../services/api';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileDermalCardProps {
  skinProfile: SkinProfile | null;
}

export const ProfileDermalCard: React.FC<ProfileDermalCardProps> = ({ skinProfile }) => {
  const hasProfile = !!skinProfile;

  const concerns = skinProfile?.skin_concerns || [];
  const skinType = skinProfile?.skin_type || 'NOT CONFIGURED';
  const allergies = skinProfile?.allergies || skinProfile?.sensitivities || null;

  const handleNavigateDataEntry = () => {
    window.location.hash = 'data-entry';
  };

  return (
    <div className="sample-card card-3d-interactive bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block">
              BASELINE BIOMETRICS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              YOUR DERMAL PROFILE
            </h3>
          </div>
        </div>

        {hasProfile ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Configured
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={11} className="text-amber-600" />
            Pending Setup
          </span>
        )}
      </div>

      {hasProfile ? (
        <div className="space-y-4">
          {/* Skin Type & Sensitivities Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Skin Type
              </span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block capitalize">
                {skinType.toLowerCase()}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Allergies / Sensitivities
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                {allergies ? allergies : 'None Configured'}
              </span>
            </div>
          </div>

          {/* Primary Concerns Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Active Skin Concerns ({concerns.length})
            </span>
            {concerns.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {concerns.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-50/80 text-[#00685f] border border-teal-200/70 shadow-2xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No specific concerns registered.</span>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-6 px-3 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
          <ShieldAlert size={28} className="text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">SKIN PROFILE NOT COMPLETED</h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
            Complete your baseline skin profile to enable personalized formulations and clinical recommendations.
          </p>
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={handleNavigateDataEntry}
        className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-2xs group"
      >
        <span>{hasProfile ? 'Edit Skin Profile' : 'Complete Skin Profile'}</span>
        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
