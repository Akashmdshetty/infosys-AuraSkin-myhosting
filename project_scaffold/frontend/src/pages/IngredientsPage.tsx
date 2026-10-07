import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, ShieldCheck, AlertTriangle, Sparkles,
  Layers, CheckCircle2, RefreshCw, X, ArrowRight, Zap, Info, HelpCircle
} from 'lucide-react';
import {
  api, IngredientDetail, IngredientSuitabilityResponse,
  IngredientInteractionCheckResponse
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const IngredientsPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'encyclopedia' | 'scanner' | 'interactions'>('encyclopedia');
  const [ingredients, setIngredients] = useState<IngredientDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDetail | null>(null);

  // Custom formula scanner state
  const [customFormulaText, setCustomFormulaText] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<IngredientSuitabilityResponse | null>(null);

  // Interaction check state
  const [selectedForInteraction, setSelectedForInteraction] = useState<string[]>([]);
  const [interactionResult, setInteractionResult] = useState<IngredientInteractionCheckResponse | null>(null);
  const [checkingInteraction, setCheckingInteraction] = useState<boolean>(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const data = await api.getIngredients();
        setIngredients(data);
        if (data.length > 0 && !selectedIngredient) {
          setSelectedIngredient(data[0]);
        }
      } catch (err: any) {
        showToast('Failed to load ingredient encyclopedia', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const handleScanFormula = async () => {
    if (!customFormulaText.trim()) {
      showToast('Please enter or paste an ingredient label to analyze.', 'info');
      return;
    }
    try {
      setScanning(true);
      const res = await api.analyzeIngredients({ custom_formula_text: customFormulaText });
      setScanResult(res);
      showToast('Formulation analyzed against your skin profile.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleCheckInteraction = async () => {
    if (selectedForInteraction.length < 2) {
      showToast('Please select at least 2 ingredients to evaluate interactions.', 'info');
      return;
    }
    try {
      setCheckingInteraction(true);
      const res = await api.checkIngredientInteractions(selectedForInteraction);
      setInteractionResult(res);
    } catch (err: any) {
      showToast(err.message || 'Interaction check failed', 'error');
    } finally {
      setCheckingInteraction(false);
    }
  };

  const toggleInteractionSelect = (name: string) => {
    if (selectedForInteraction.includes(name)) {
      setSelectedForInteraction(selectedForInteraction.filter(i => i !== name));
    } else {
      if (selectedForInteraction.length >= 4) {
        showToast('Maximum 4 ingredients can be checked simultaneously.', 'info');
        return;
      }
      setSelectedForInteraction([...selectedForInteraction, name]);
    }
  };

  const filteredIngredients = ingredients.filter(ing => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ing.name.toLowerCase().includes(q) ||
      ing.category.toLowerCase().includes(q) ||
      ing.primary_benefits.toLowerCase().includes(q) ||
      ing.target_concerns.some(c => c.toLowerCase().includes(q))
    );
  });

  // Calculate 4-tier counts for scanner results
  const safeCount = scanResult ? scanResult.results.filter(r => r.severity === 'SAFE').length : 0;
  const cautionCount = scanResult ? scanResult.results.filter(r => r.severity === 'CAUTION' || r.severity === 'MEDIUM').length : 0;
  const conflictCount = scanResult ? scanResult.results.filter(r => r.severity === 'HIGH').length : 0;
  const unknownCount = scanResult ? scanResult.results.filter(r => r.severity === 'UNKNOWN').length : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AuraSkin Ingredient Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Scientific Ingredient Encyclopedia & INCI Scanner
            </h1>
            <p className="mt-2 text-teal-100 max-w-2xl text-sm sm:text-base">
              Explore clinical active monographs, scan complex formulation packaging, evaluate cross-chemical stability, and detect allergen contraindications.
            </p>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setActiveTab('encyclopedia')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'encyclopedia'
                    ? 'bg-teal-400 text-teal-950 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Ingredient Encyclopedia
              </button>
              <button
                onClick={() => setActiveTab('scanner')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'scanner'
                    ? 'bg-teal-400 text-teal-950 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Zap className="w-4 h-4" /> Formula Scanner (INCI)
              </button>
              <button
                onClick={() => setActiveTab('interactions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'interactions'
                    ? 'bg-teal-400 text-teal-950 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Layers className="w-4 h-4" /> Chemical Interactions
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: INGREDIENT ENCYCLOPEDIA */}
        {activeTab === 'encyclopedia' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Search & Directory */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active, concern, or classification..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    Loading ingredient database...
                  </div>
                ) : filteredIngredients.map(ing => {
                  const isSelected = selectedIngredient?.name === ing.name;
                  return (
                    <button
                      key={ing.name}
                      onClick={() => setSelectedIngredient(ing)}
                      className={`w-full text-left p-4 transition flex items-center justify-between ${
                        isSelected ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                          {ing.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ing.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ing.primary_benefits}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-teal-700 translate-x-1' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Scientific Dossier */}
            <div className="lg:col-span-7">
              {selectedIngredient ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                      {selectedIngredient.category}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-3">{selectedIngredient.name}</h2>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{selectedIngredient.primary_benefits}</p>
                  </div>

                  {/* Compatibility Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Suitable Skin Types
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedIngredient.suitable_skin_types.map(st => (
                          <span key={st} className="px-2 py-0.5 bg-teal-100 text-teal-900 text-xs font-semibold rounded-md">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Target Dermal Objectives
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedIngredient.target_concerns.map(tc => (
                          <span key={tc} className="px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-semibold rounded-md">
                            {tc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clinical Evidence Rating */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical Evidence Level:
                    </div>
                    <p className="text-xs font-semibold text-emerald-800">{selectedIngredient.evidence_level}</p>
                    <p className="text-[11px] text-emerald-700 italic">Source: {selectedIngredient.source_reference}</p>
                  </div>

                  {/* Precautions */}
                  {selectedIngredient.precautions && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Usage Guidelines & Precautions:
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">{selectedIngredient.precautions}</p>
                    </div>
                  )}

                  {/* Interactions */}
                  {selectedIngredient.interactions && selectedIngredient.interactions.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-600" /> Known Chemical Pairings:
                      </h4>
                      <div className="space-y-2">
                        {selectedIngredient.interactions.map((inter, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                              inter.interaction_type === 'CONFLICT'
                                ? 'bg-rose-50 border-rose-200 text-rose-900'
                                : inter.interaction_type === 'SYNERGISTIC'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="font-bold whitespace-nowrap">[{inter.interaction_type}] with {inter.with_ingredient}:</span>
                            <span>{inter.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Select an active ingredient to view its scientific profile.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 4-TIER INCI FORMULA SCANNER */}
        {activeTab === 'scanner' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-600" /> 4-Tier INCI Formulation Safety Scanner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste any cosmetic label to instantly classify all chemical ingredients into Safe, Caution, Conflict, and Unknown categories.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Paste INCI Formulation Label:
              </label>
              <textarea
                rows={4}
                value={customFormulaText}
                onChange={e => setCustomFormulaText(e.target.value)}
                placeholder="e.g. Aqua, Glycerin, Niacinamide, Salicylic Acid, Sodium Hyaluronate, Phenoxyethanol..."
                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white transition resize-none font-mono"
              />
              <button
                onClick={handleScanFormula}
                disabled={scanning}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Scan Formula Ingredients
              </button>
            </div>

            {/* Scan Results */}
            {scanResult && (
              <div className="pt-6 border-t border-slate-200 space-y-6 animate-fade-in">
                {/* 4-Tier Metric Summary Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-2xl font-black text-emerald-800">{safeCount}</div>
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Safe</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <div className="text-2xl font-black text-amber-800">{cautionCount}</div>
                    <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Caution</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                    <div className="text-2xl font-black text-rose-800">{conflictCount}</div>
                    <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Conflict</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                    <div className="text-2xl font-black text-slate-700">{unknownCount}</div>
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unknown</div>
                  </div>
                </div>

                {/* Conflict Notice & Recommendation Shortcut */}
                {conflictCount > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Formulation Conflicts Detected
                      </h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        One or more ingredients conflict with your recorded skin sensitivities or allergies.
                      </p>
                    </div>

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('products')}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow whitespace-nowrap"
                      >
                        Find Safer Biocompatible Products
                      </button>
                    )}
                  </div>
                )}

                {/* Individual Ingredients Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Individual Classification Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanResult.results.map((res, idx) => {
                      const isConflict = res.severity === 'HIGH';
                      const isCaution = res.severity === 'CAUTION' || res.severity === 'MEDIUM';
                      const isUnknown = res.severity === 'UNKNOWN';
                      const isSafe = res.severity === 'SAFE';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                            isConflict
                              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                              : isCaution
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                              : isUnknown
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="flex items-center justify-between font-extrabold text-sm">
                            <span>{res.ingredient}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isConflict
                                ? 'bg-rose-200 text-rose-950'
                                : isCaution
                                ? 'bg-amber-200 text-amber-950'
                                : isUnknown
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}>
                              {res.severity}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{res.reason}</p>
                          {res.precautions && (
                            <p className="text-[11px] opacity-80 pt-0.5">Precautions: {res.precautions}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHEMICAL INTERACTIONS */}
        {activeTab === 'interactions' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" /> Cross-Ingredient Chemical Pairing Evaluator
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify whether layering two or more active ingredients causes chemical destabilization or skin barrier inflammation.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select 2 to 4 Actives to Evaluate:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Retinoids',
                  'Salicylic Acid',
                  'Niacinamide',
                  'Hyaluronic Acid',
                  'Vitamin C',
                  'Ceramides',
                  'AHAs/BHAs',
                  'Centella Asiatica',
                  'Azelaic Acid'
                ].map(name => {
                  const isSelected = selectedForInteraction.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleInteractionSelect(name)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {name} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCheckInteraction}
              disabled={checkingInteraction || selectedForInteraction.length < 2}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              {checkingInteraction ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
              Evaluate Chemistry Compatibility ({selectedForInteraction.length})
            </button>

            {/* Interaction Results */}
            {interactionResult && (
              <div className="pt-6 border-t border-slate-200 space-y-4 animate-fade-in">
                <div className={`p-4 rounded-2xl border text-xs font-medium ${
                  interactionResult.has_conflicts
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="font-bold text-sm mb-1">
                    {interactionResult.has_conflicts ? '⚠️ Chemical Conflict Detected' : '✅ Biocompatible Synergy'}
                  </div>
                  <p>{interactionResult.recommendation}</p>
                </div>

                <div className="space-y-2">
                  {interactionResult.interactions.map((inter, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{inter.with_ingredient}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          inter.interaction_type === 'CONFLICT'
                            ? 'bg-rose-100 text-rose-800'
                            : inter.interaction_type === 'SYNERGISTIC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inter.interaction_type}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{inter.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
