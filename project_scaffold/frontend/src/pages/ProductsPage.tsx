import React, { useState, useEffect } from 'react';
import {
  Sparkles, Filter, Search, ShoppingBag, ShieldCheck, AlertTriangle,
  Layers, ArrowRight, ArrowLeft, X, CheckCircle2, IndianRupee, Tag,
  Eye, RefreshCw, Plus, Check, Heart, Droplets, Moon, Sun, Info, Calendar,
  Award, CheckSquare, Square, Trash2, ArrowUpRight, Clock, Shuffle
} from 'lucide-react';
import {
  api, Product, ProductSuitabilityDetail, ProductComparisonResponse,
  AlternativeProductsResponse, SkincareRoutine
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'All Categories',
  'Face Wash',
  'Moisturizer',
  'Sunscreen',
  'Serum',
  'Toner',
  'Treatment Products',
  'Face Masks'
];

const BUDGET_PRESETS = [
  { label: 'All Budgets', value: null },
  { label: 'Under ₹500', value: 500 },
  { label: '₹500 – ₹1,000', value: 1000 },
  { label: '₹1,000 – ₹2,000', value: 2000 },
];

export const ProductsPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<ProductSuitabilityDetail[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fragranceFreeOnly, setFragranceFreeOnly] = useState<boolean>(false);
  const [alcoholFreeOnly, setAlcoholFreeOnly] = useState<boolean>(false);

  // User's active routine tracking
  const [activeRoutine, setActiveRoutine] = useState<SkincareRoutine | null>(null);
  const [addedRoutineMap, setAddedRoutineMap] = useState<Record<number, string>>({});

  // Selected for full Product Detail view
  const [detailedProduct, setDetailedProduct] = useState<ProductSuitabilityDetail | null>(null);

  // Add to routine modal & state
  const [routineModalProduct, setRoutineModalProduct] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('AM');
  const [customRoutineNotes, setCustomRoutineNotes] = useState<string>('');

  // Comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<ProductComparisonResponse | null>(null);
  const [comparingLoading, setComparingLoading] = useState<boolean>(false);

  // Alternative products modal
  const [alternativesModalOpen, setAlternativesModalOpen] = useState<boolean>(false);
  const [alternativesData, setAlternativesData] = useState<AlternativeProductsResponse | null>(null);
  const [alternativesLoading, setAlternativesLoading] = useState<boolean>(false);
  const [activeAlternativeSourceProduct, setActiveAlternativeSourceProduct] = useState<Product | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === 'All Categories' ? undefined : selectedCategory;
      const res = await api.getProductRecommendations({
        category: cat,
        budget_max: selectedBudget || undefined,
        limit: 30
      });
      setRecommendations(res.recommendations);
    } catch (err: any) {
      showToast(err.message || 'Failed to load product intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRoutine = async () => {
    try {
      const routine = await api.getCurrentRoutine();
      if (routine) {
        setActiveRoutine(routine);
        const map: Record<number, string> = {};
        if (routine.morning_routine) {
          routine.morning_routine.forEach(step => {
            recommendations.forEach(rec => {
              if (rec.product.name.toLowerCase().includes(step.product_type.toLowerCase()) ||
                  step.product_type.toLowerCase().includes(rec.product.name.toLowerCase())) {
                map[rec.product.id] = 'AM';
              }
            });
          });
        }
        if (routine.evening_routine) {
          routine.evening_routine.forEach(step => {
            recommendations.forEach(rec => {
              if (rec.product.name.toLowerCase().includes(step.product_type.toLowerCase()) ||
                  step.product_type.toLowerCase().includes(rec.product.name.toLowerCase())) {
                map[rec.product.id] = map[rec.product.id] ? 'BOTH' : 'PM';
              }
            });
          });
        }
        setAddedRoutineMap(prev => ({ ...prev, ...map }));
      }
    } catch {
      // User might not have generated a routine yet
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory, selectedBudget]);

  useEffect(() => {
    if (recommendations.length > 0) {
      fetchCurrentRoutine();
    }
  }, [recommendations.length]);

  const toggleCompare = (productId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (selectedForCompare.includes(productId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== productId));
    } else {
      if (selectedForCompare.length >= 4) {
        showToast('You can compare up to 4 products simultaneously.', 'info');
        return;
      }
      setSelectedForCompare([...selectedForCompare, productId]);
    }
  };

  const handleOpenComparison = async () => {
    if (selectedForCompare.length < 2) {
      showToast('Select at least 2 products to compare.', 'info');
      return;
    }
    try {
      setComparingLoading(true);
      setComparisonModalOpen(true);
      const res = await api.compareProducts(selectedForCompare);
      setComparisonData(res);
    } catch (err: any) {
      showToast(err.message || 'Comparison failed', 'error');
    } finally {
      setComparingLoading(false);
    }
  };

  const handleOpenAlternatives = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setActiveAlternativeSourceProduct(product);
      setAlternativesLoading(true);
      setAlternativesModalOpen(true);
      const res = await api.getProductAlternatives(product.id);
      setAlternativesData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load safer alternatives', 'error');
    } finally {
      setAlternativesLoading(false);
    }
  };

  const openRoutineModalForProduct = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRoutineModalProduct(product);
    setSelectedTimeOfDay('AM');
    setCustomRoutineNotes('');
  };

  const handleAddToRoutine = async (productId: number, timeOfDay: string = 'AM', notes?: string) => {
    try {
      setAddingId(productId);
      const res = await api.addProductToRoutine(productId, {
        time_of_day: timeOfDay,
        notes: notes || undefined
      });
      showToast(res.message, 'success');
      setAddedRoutineMap(prev => ({ ...prev, [productId]: timeOfDay }));
      setRoutineModalProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Could not add product to routine', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const p = rec.product;
    if (fragranceFreeOnly && !p.fragrance_free) return false;
    if (alcoholFreeOnly && !p.alcohol_free) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.active_ingredients.toLowerCase().includes(q)
    );
  });

  const getSelectedProductObjects = () => {
    return recommendations
      .filter(r => selectedForCompare.includes(r.product.id))
      .map(r => r.product);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> AuraSkin Product Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Personalized Product Discovery, Alternatives & Routines
              </h1>
              <p className="mt-2 text-teal-100 max-w-2xl text-sm sm:text-base">
                Discover biocompatible skincare products with transparent match scoring, select multiple products to compare side-by-side, explore safer alternatives, and integrate seamlessly into your daily routine.
              </p>
            </div>

            {selectedForCompare.length > 0 && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <span className="text-sm font-semibold text-teal-100">
                  {selectedForCompare.length} selected
                </span>
                <button
                  onClick={handleOpenComparison}
                  disabled={selectedForCompare.length < 2}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed text-teal-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" /> Compare ({selectedForCompare.length})
                </button>
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
                  title="Clear comparison selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: DEDICATED PRODUCT DETAIL VIEW */}
        {detailedProduct ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button
                onClick={() => setDetailedProduct(null)}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-700 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Product Discovery
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAlternatives(detailedProduct.product)}
                  className="px-3.5 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Find Safer Alternatives</span>
                </button>
                <button
                  onClick={() => toggleCompare(detailedProduct.product.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    selectedForCompare.includes(detailedProduct.product.id)
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {selectedForCompare.includes(detailedProduct.product.id) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected for Compare
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add to Compare
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Product Overview Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-black uppercase tracking-wider">
                    {detailedProduct.product.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Brand: {detailedProduct.product.brand}</span>
                </div>

                <h2 className="text-3xl font-black text-slate-900">{detailedProduct.product.name}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{detailedProduct.product.description}</p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="text-2xl font-black text-slate-900 flex items-center">
                    <IndianRupee className="w-5 h-5 inline text-slate-600" />
                    {detailedProduct.product.price.toLocaleString('en-IN')}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {detailedProduct.product.fragrance_free && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fragrance-Free
                      </span>
                    )}
                    {detailedProduct.product.alcohol_free && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Alcohol-Free
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AuraSkin Match Hero Badge */}
              <div className="lg:col-span-4 bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-3xl p-6 border border-teal-200/80 text-center space-y-3 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">AuraSkin Compatibility</span>
                <div className="text-5xl font-black text-teal-950">
                  {detailedProduct.suitability_score}%
                </div>
                <div className="text-xs font-bold text-teal-800">
                  {detailedProduct.suitability_score >= 80 ? 'Highly Biocompatible' : 'Compatible Match'}
                </div>
                <p className="text-[11px] text-teal-700">
                  Calculated against your active dermal profile, sensitivities, and allergy database.
                </p>
              </div>
            </div>

            {/* Transparent Score Calculation Breakdown */}
            {detailedProduct.score_breakdown && (
              <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" /> Transparent AuraSkin Match Calculation Breakdown
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Skin Type</div>
                    <div className="text-lg font-black text-teal-900">+{detailedProduct.score_breakdown.skin_type_points}</div>
                    <div className="text-[10px] text-slate-400">Max 20</div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Concern Match</div>
                    <div className="text-lg font-black text-teal-900">+{detailedProduct.score_breakdown.concern_match_points}</div>
                    <div className="text-[10px] text-slate-400">Max 25</div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Allergen Safety</div>
                    <div className="text-lg font-black text-teal-900">+{detailedProduct.score_breakdown.ingredient_compatibility_points}</div>
                    <div className="text-[10px] text-slate-400">Max 20</div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Barrier Support</div>
                    <div className="text-lg font-black text-teal-900">+{detailedProduct.score_breakdown.barrier_support_points}</div>
                    <div className="text-[10px] text-slate-400">Max 15</div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Routine Harmony</div>
                    <div className="text-lg font-black text-teal-900">+{detailedProduct.score_breakdown.routine_compatibility_points}</div>
                    <div className="text-[10px] text-slate-400">Max 20</div>
                  </div>
                </div>
              </div>
            )}

            {/* Why Recommended & Ingredients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Why Recommended */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Personalized Compatibility Analysis</h3>
                <div className="space-y-2">
                  {detailedProduct.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}

                  {detailedProduct.potential_conflicts.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Add to Routine Controller */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-600" /> Integrate into My Skincare Routine
                </h3>
                <p className="text-xs text-slate-600">
                  Select when you plan to use this product. AuraSkin will automatically place it in the optimal sequence.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { id: 'AM', label: 'Morning (AM)', icon: Sun },
                    { id: 'PM', label: 'Evening (PM)', icon: Moon },
                    { id: 'BOTH', label: 'Both (AM & PM)', icon: Droplets },
                    { id: 'WEEKLY', label: 'Weekly (1-2x/wk)', icon: Calendar }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTimeOfDay(t.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        selectedTimeOfDay === t.id
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleAddToRoutine(detailedProduct.product.id, selectedTimeOfDay)}
                  disabled={addingId === detailedProduct.product.id}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-4"
                >
                  {addingId === detailedProduct.product.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add {detailedProduct.product.name} to {selectedTimeOfDay} Routine
                </button>

                {addedRoutineMap[detailedProduct.product.id] && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Currently active in your {addedRoutineMap[detailedProduct.product.id]} Routine
                  </div>
                )}
              </div>
            </div>

            {/* Full INCI Ingredient Formulation */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Formulation Ingredients (INCI)</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono leading-relaxed">
                {detailedProduct.product.ingredients}
              </p>
            </div>
          </div>
        ) : (
          /* VIEW 2: PRODUCT DISCOVERY GRID */
          <>
            {/* Filters Toolbar */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name, active (Ceramides, BHA), or brand..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                {/* Budget Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Budget:
                  </span>
                  {BUDGET_PRESETS.map(b => (
                    <button
                      key={b.label}
                      onClick={() => setSelectedBudget(b.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                        selectedBudget === b.value
                          ? 'bg-teal-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles & Category Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-teal-50 border border-teal-600 text-teal-800'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fragranceFreeOnly}
                      onChange={e => setFragranceFreeOnly(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span>Fragrance-Free</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={alcoholFreeOnly}
                      onChange={e => setAlcoholFreeOnly(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <span>Alcohol-Free</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Selection Status Bar */}
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-bold text-slate-500">
                Showing {filteredRecommendations.length} personalized recommendation{filteredRecommendations.length === 1 ? '' : 's'}
              </p>
              <div className="text-xs text-slate-500">
                Tip: Click <span className="font-semibold text-teal-800">Compare</span> to select products, or <span className="font-semibold text-teal-800">Alt</span> to find safer biocompatible alternatives.
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 text-sm font-medium">Evaluating personalized product suitability...</p>
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
                <p className="text-sm text-slate-500 mt-1">Try relaxing filters or adjusting your budget selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommendations.map(rec => {
                  const p = rec.product;
                  const isSelected = selectedForCompare.includes(p.id);
                  const isAlreadyInRoutine = addedRoutineMap[p.id];

                  return (
                    <div
                      key={p.id}
                      className={`relative bg-white rounded-3xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 ring-2 ring-teal-600/30 bg-teal-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Card Header with Category & Selection Checkbox */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 pr-2">
                            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">{p.category}</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">{p.name}</h3>
                            <p className="text-xs text-slate-500">{p.brand}</p>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* Match Score Badge */}
                            <div className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-center font-black text-sm text-teal-900">
                              <div>{rec.suitability_score}%</div>
                              <div className="text-[8px] uppercase tracking-tight text-teal-700 font-bold">Match</div>
                            </div>

                            {/* Multi-Select Comparison Checkbox */}
                            <button
                              onClick={(e) => toggleCompare(p.id, e)}
                              type="button"
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                                isSelected
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-500 hover:text-teal-700'
                              }`}
                              title={isSelected ? "Remove from comparison" : "Select to compare with other products"}
                            >
                              {isSelected ? (
                                <>
                                  <CheckSquare className="w-3.5 h-3.5 text-teal-200" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <>
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Compare</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>

                        {/* Key Actives */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.active_ingredients.split(',').slice(0, 3).map((act, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md">
                              {act.trim()}
                            </span>
                          ))}
                        </div>

                        {/* Why Recommended */}
                        {rec.reasons.length > 0 && (
                          <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 mb-4 space-y-1">
                            <div className="text-[11px] font-bold text-teal-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-teal-600" /> AuraSkin Match:
                            </div>
                            <p className="text-[11px] text-teal-800 leading-tight">{rec.reasons[0]}</p>
                          </div>
                        )}

                        {/* In Routine Banner if already added */}
                        {isAlreadyInRoutine && (
                          <div className="mb-3 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>In {isAlreadyInRoutine} Routine</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-base font-extrabold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 inline text-slate-600" />
                            {p.price.toLocaleString('en-IN')}
                          </div>

                          {/* Alternatives Quick Action */}
                          <button
                            onClick={(e) => handleOpenAlternatives(p, e)}
                            className="px-2.5 py-1 text-[11px] font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition flex items-center gap-1"
                            title="Find biocompatible alternative products"
                          >
                            <Shuffle className="w-3 h-3 text-teal-700" />
                            <span>Find Alternatives</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setDetailedProduct(rec)}
                            className="w-full py-2 text-xs font-bold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center"
                          >
                            View Analysis
                          </button>

                          <button
                            onClick={(e) => openRoutineModalForProduct(p, e)}
                            disabled={addingId === p.id}
                            className={`w-full py-2 text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 ${
                              isAlreadyInRoutine
                                ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                                : 'bg-teal-700 hover:bg-teal-600 text-white'
                            }`}
                            title="Add or update in your skincare routine"
                          >
                            {addingId === p.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isAlreadyInRoutine ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>{isAlreadyInRoutine ? 'In Routine' : '+ Routine'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* FLOATING MULTI-PRODUCT COMPARISON DOCK */}
        {selectedForCompare.length > 0 && !comparisonModalOpen && (
          <div className="fixed bottom-6 inset-x-0 mx-auto max-w-3xl z-40 px-4 animate-slide-up">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl p-4 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider whitespace-nowrap">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Compare ({selectedForCompare.length}/4):</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {getSelectedProductObjects().map(prod => (
                    <span
                      key={prod.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 whitespace-nowrap"
                    >
                      <span className="max-w-[120px] truncate">{prod.name}</span>
                      <button
                        onClick={(e) => toggleCompare(prod.id, e)}
                        className="hover:text-rose-400 text-slate-400"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Clear All
                </button>

                <button
                  onClick={handleOpenComparison}
                  disabled={selectedForCompare.length < 2}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-teal-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Layers className="w-4 h-4" />
                  <span>{selectedForCompare.length < 2 ? 'Select 1 more to Compare' : `Compare ${selectedForCompare.length} Products`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD TO ROUTINE POPUP */}
        {routineModalProduct && (
          <div className="modal-overlay">
            <div className="modal-card max-w-lg animate-scale-up">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-teal-600" /> Add to Skincare Routine
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Integrate this product into your daily schedule.
                  </p>
                </div>
                <button
                  onClick={() => setRoutineModalProduct(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Product Summary */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">{routineModalProduct.category}</span>
                  <h4 className="text-sm font-bold text-slate-900">{routineModalProduct.name}</h4>
                  <p className="text-xs text-slate-500">{routineModalProduct.brand} · ₹{routineModalProduct.price.toLocaleString('en-IN')}</p>
                </div>

                {/* Routine Time Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Usage Time / Routine Slot:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'AM', label: 'Morning (AM)', desc: 'Daily daytime protection', icon: Sun },
                      { id: 'PM', label: 'Evening (PM)', desc: 'Nighttime recovery', icon: Moon },
                      { id: 'BOTH', label: 'Both (AM & PM)', desc: 'Twice daily use', icon: Droplets },
                      { id: 'WEEKLY', label: 'Weekly', desc: '1–2 times per week', icon: Calendar },
                    ].map(slot => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeOfDay(slot.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedTimeOfDay === slot.id
                            ? 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-500/20'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <slot.icon className={`w-4 h-4 ${selectedTimeOfDay === slot.id ? 'text-teal-200' : 'text-slate-500'}`} />
                          {selectedTimeOfDay === slot.id && <Check className="w-3.5 h-3.5 text-teal-200" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{slot.label}</div>
                          <div className={`text-[10px] ${selectedTimeOfDay === slot.id ? 'text-teal-100' : 'text-slate-400'}`}>
                            {slot.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Application Notes (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apply 3 drops before moisturizer, avoid eye area..."
                    value={customRoutineNotes}
                    onChange={e => setCustomRoutineNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRoutineModalProduct(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToRoutine(routineModalProduct.id, selectedTimeOfDay, customRoutineNotes)}
                    disabled={addingId === routineModalProduct.id}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    {addingId === routineModalProduct.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Confirm & Add to {selectedTimeOfDay}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: SIDE-BY-SIDE PRODUCT COMPARISON */}
        {comparisonModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card max-w-6xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-600" /> Multi-Product Side-by-Side Comparison
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-dimensional compatibility comparison computed against your clinical dermal profile.
                  </p>
                </div>
                <button
                  onClick={() => setComparisonModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {comparingLoading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Comparing formulation metrics...</p>
                </div>
              ) : comparisonData ? (
                <div className="space-y-6">
                  {/* Summary Verdict Banner */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 text-xs font-medium text-teal-950 flex items-start gap-3 shadow-sm">
                    <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-sm text-teal-900 mb-0.5">AuraSkin Intelligence Verdict</div>
                      <div>{comparisonData.summary_verdict}</div>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90">
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider w-40 bg-slate-100/70">Attribute</th>
                          {comparisonData.compared_products.map(item => (
                            <th key={item.product.id} className="p-4 font-extrabold text-slate-900 min-w-[220px]">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] uppercase font-bold text-teal-700">{item.product.category}</span>
                                <button
                                  onClick={() => {
                                    const next = selectedForCompare.filter(id => id !== item.product.id);
                                    setSelectedForCompare(next);
                                    if (next.length >= 2) {
                                      api.compareProducts(next).then(setComparisonData);
                                    } else {
                                      setComparisonModalOpen(false);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-500 text-[10px] font-semibold"
                                  title="Remove from comparison"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="text-sm font-bold text-slate-900 leading-snug">{item.product.name}</div>
                              <div className="text-[11px] font-normal text-slate-500">{item.product.brand}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* AuraSkin Match Score */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">AuraSkin Match</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-teal-900">{item.suitability_score}%</span>
                                {item.product.id === comparisonData.best_match_id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase">
                                    <Award className="w-3 h-3" /> Best Match
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                <div
                                  className="bg-teal-600 h-1.5 rounded-full"
                                  style={{ width: `${item.suitability_score}%` }}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Price */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Price</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                                {item.product.id === comparisonData.best_value_id && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md uppercase">
                                    Best Value
                                  </span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Allergen & Safety */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Allergen Safety</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              {item.is_safe_for_user ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Allergen Alert
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Key Actives */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Key Actives</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {item.key_actives.map((act, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                                    {act}
                                  </span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Concerns Addressed */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Target Concerns</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4 text-slate-600">
                              {item.target_concerns_addressed.length > 0
                                ? item.target_concerns_addressed.join(', ')
                                : 'General Maintenance'}
                            </td>
                          ))}
                        </tr>

                        {/* Barrier Support & Formula */}
                        <tr>
                          <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Formula Attributes</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              <div className="space-y-1">
                                <div className="text-[11px] text-slate-700 font-semibold">
                                  Barrier Support: {item.barrier_support ? 'Yes (Lipid Matrix)' : 'Standard'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  {item.fragrance_free && <span className="px-1.5 py-0.5 bg-slate-100 rounded">Fragrance-Free</span>}
                                  {item.product.alcohol_free && <span className="px-1.5 py-0.5 bg-slate-100 rounded">Alcohol-Free</span>}
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Direct Action Row */}
                        <tr className="bg-slate-50/70">
                          <td className="p-4 font-bold text-slate-700 bg-slate-100/70">Actions & Alternatives</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-4">
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    setComparisonModalOpen(false);
                                    openRoutineModalForProduct(item.product);
                                  }}
                                  className="w-full py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Add to Routine</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setComparisonModalOpen(false);
                                    handleOpenAlternatives(item.product);
                                  }}
                                  className="w-full py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <Shuffle className="w-3 h-3 text-teal-600" />
                                  <span>Find Alternatives</span>
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* MODAL 3: ALTERNATIVE PRODUCTS MODAL */}
        {alternativesModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card max-w-4xl animate-scale-up">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" /> Safer Biocompatible Alternatives
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeAlternativeSourceProduct
                      ? `Intelligent recommendations formulated as safe alternatives to '${activeAlternativeSourceProduct.name}'`
                      : 'High-suitability products without contraindications or allergen conflicts.'}
                  </p>
                </div>
                <button
                  onClick={() => setAlternativesModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {alternativesLoading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Analyzing active ingredients and finding safest biocompatible alternatives...</p>
                </div>
              ) : alternativesData ? (
                <div className="space-y-6">
                  {/* Selected Source Product Context Banner */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Currently Selected Product:</span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">
                        {alternativesData.unsuitable_product.name} ({alternativesData.unsuitable_product.brand})
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Category: <span className="font-semibold">{alternativesData.unsuitable_product.category}</span> · Price: <span className="font-semibold">₹{alternativesData.unsuitable_product.price.toLocaleString('en-IN')}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs max-w-sm">
                      <div className="font-bold text-[11px] text-amber-900 mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Reason for Recommendation:
                      </div>
                      <div>{alternativesData.unsuitability_reason}</div>
                    </div>
                  </div>

                  {/* Alternatives List */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Top Recommended Safer Alternatives ({alternativesData.alternatives.length} Available):
                    </h3>

                    {alternativesData.alternatives.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">The current product is already the most biocompatible option in its category.</p>
                      </div>
                    ) : (
                      alternativesData.alternatives.map(alt => {
                        const isAltSelectedForCompare = selectedForCompare.includes(alt.product.id);
                        const isAltInRoutine = addedRoutineMap[alt.product.id];
                        const priceDiff = alt.product.price - alternativesData.unsuitable_product.price;

                        return (
                          <div
                            key={alt.product.id}
                            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md uppercase">
                                  {alt.product.category}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">{alt.product.brand}</span>
                                {priceDiff < 0 ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Save ₹{Math.abs(priceDiff).toLocaleString('en-IN')}
                                  </span>
                                ) : priceDiff > 0 ? (
                                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    +₹{priceDiff.toLocaleString('en-IN')}
                                  </span>
                                ) : null}
                              </div>

                              <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{alt.product.name}</h4>
                              <p className="text-xs text-slate-600 line-clamp-1">{alt.product.description}</p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs font-black text-slate-900">₹{alt.product.price.toLocaleString('en-IN')}</span>
                                <span className="text-slate-300">·</span>
                                <div className="flex flex-wrap gap-1">
                                  {alt.product.active_ingredients.split(',').slice(0, 2).map((a, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                                      {a.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Match & Actions */}
                            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                              <div className="text-center px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="text-base font-black text-emerald-800">{alt.suitability_score}%</div>
                                <div className="text-[8px] font-bold text-emerald-700 uppercase">Match</div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <button
                                  onClick={() => {
                                    setAlternativesModalOpen(false);
                                    openRoutineModalForProduct(alt.product);
                                  }}
                                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                                >
                                  {isAltInRoutine ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                  <span>{isAltInRoutine ? 'In Routine' : '+ Routine'}</span>
                                </button>

                                <button
                                  onClick={() => toggleCompare(alt.product.id)}
                                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                                    isAltSelectedForCompare
                                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {isAltSelectedForCompare ? <CheckSquare className="w-3 h-3 text-teal-600" /> : <Square className="w-3 h-3 text-slate-400" />}
                                  <span>{isAltSelectedForCompare ? 'In Compare' : 'Add to Compare'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
