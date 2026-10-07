import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';
import { SkinType } from '../services/api';
import { Sparkles, Check, AlertCircle, Save, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const SKIN_TYPES: { type: SkinType; label: string; icon: string; desc: string }[] = [
  { type: 'NORMAL', label: 'Normal', icon: '💧', desc: 'Balanced, clear, not overly dry or oily' },
  { type: 'DRY', label: 'Dry', icon: '🌵', desc: 'Often feels tight or lacks moisture' },
  { type: 'OILY', label: 'Oily', icon: '✨', desc: 'Excess shine, enlarged pores, breakouts' },
  { type: 'COMBINATION', label: 'Combination', icon: '🧬', desc: 'Oily T-zone & dry cheeks' },
  { type: 'SENSITIVE', label: 'Sensitive', icon: '🛡️', desc: 'Easily irritated, red, stinging with products' },
];

const COMMON_CONCERNS = [
  { id: 'ACNE', label: 'Acne' },
  { id: 'DRYNESS', label: 'Dryness' },
  { id: 'REDNESS', label: 'Redness' },
  { id: 'HYPERPIGMENTATION', label: 'Hyperpigmentation' },
  { id: 'FINE_LINES', label: 'Fine Lines' },
  { id: 'DULLNESS', label: 'Dullness' },
  { id: 'UNEVEN_TEXTURE', label: 'Uneven Texture' },
  { id: 'PORE_SIZE', label: 'Pore Size' },
  { id: 'DARK_CIRCLES', label: 'Dark Circles' },
  { id: 'SUN_DAMAGE', label: 'Sun Damage' },
];

export const SkinProfileCard: React.FC = () => {
  const { skinProfile, saveSkinProfile, loadingData } = useDashboard();
  const { showSuccess, showError } = useToast();

  const [skinType, setSkinType] = useState<SkinType>('COMBINATION');
  const [concerns, setConcerns] = useState<string[]>(['ACNE', 'DRYNESS']);
  const [allergies, setAllergies] = useState<string>('');
  const [sensitivities, setSensitivities] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (skinProfile) {
      setSkinType(skinProfile.skin_type || 'COMBINATION');
      setConcerns(skinProfile.skin_concerns || []);
      setAllergies(skinProfile.allergies || '');
      setSensitivities(skinProfile.sensitivities || '');
    }
  }, [skinProfile]);

  const handleToggleConcern = (concernId: string) => {
    setConcerns((prev) =>
      prev.includes(concernId) ? prev.filter((c) => c !== concernId) : [...prev, concernId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (!skinType) {
      setFieldError('Please select a primary skin type.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        skin_type: skinType,
        skin_concerns: concerns,
        allergies: allergies.trim() || undefined,
        sensitivities: sensitivities.trim() || undefined,
      };

      await saveSkinProfile(payload);
      showSuccess('✓ Skin profile updated successfully.');
    } catch (err: any) {
      const msg = err.message || 'Unable to save your skin profile. Please try again.';
      setFieldError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingData && !skinProfile) {
    return (
      <div id="section-skin-profile" className="sample-card text-center py-10 text-slate-500 animate-pulse">
        <Loader2 size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
        <span>Loading skin profile baseline...</span>
      </div>
    );
  }

  return (
    <div id="section-skin-profile" className="sample-card card-3d-interactive">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-0.5">
            <Sparkles size={14} />
            <span>Baseline Profile</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Skin Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Tell us about your baseline skin characteristics.</p>
        </div>

        {skinProfile && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <CheckCircle2 size={13} />
            <span>Active Baseline</span>
          </span>
        )}
      </div>

      {fieldError && (
        <div className="field-error-alert mb-5" role="alert">
          <AlertCircle size={16} />
          <span>{fieldError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Primary Skin Type - 5 Card Responsive Grid */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-3">
            Primary Skin Type <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SKIN_TYPES.map(({ type, label, icon, desc }) => {
              const selected = skinType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSkinType(type)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                    selected
                      ? 'bg-teal-50/80 border-[#00685f] shadow-sm transform -translate-y-1'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{icon}</span>
                      {selected && (
                        <span className="p-0.5 bg-[#00685f] text-white rounded-full">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div className={`text-sm font-bold ${selected ? 'text-[#00685f]' : 'text-slate-900'}`}>
                      {label}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug mt-1">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Primary Skin Concerns */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Primary Skin Concerns
            </label>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {concerns.length} concern{concerns.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_CONCERNS.map((c) => {
              const selected = concerns.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleToggleConcern(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-[#00685f] text-white border-[#00685f] shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {selected && <Check size={12} />}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Known Allergies & Sensitivities Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
              Known Allergies <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Fragrance, Nuts, Lanolin"
              className="w-full text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Add ingredients or substances you want your routine to avoid.
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
              Sensitivities <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={sensitivities}
              onChange={(e) => setSensitivities(e.target.value)}
              placeholder="e.g. Glycolic Acid, High Alcohol"
              className="w-full text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              List actives or formulas that cause irritation or redness.
            </p>
          </div>
        </div>

        {/* Profile Save Action Container */}
        <div className="p-4 bg-gradient-to-r from-teal-50/80 via-sky-50/40 to-white rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-teal-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">🧬 Baseline Profile Calibration</div>
              <div className="text-[11px] text-slate-600">Your profile helps AuraSkin personalize your daily skincare recommendations.</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2 px-5 whitespace-nowrap shrink-0"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Skin Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
