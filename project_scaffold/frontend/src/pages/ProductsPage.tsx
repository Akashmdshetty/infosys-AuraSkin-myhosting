import React, { useState, useEffect } from 'react';
import {
  Sparkles, Filter, Search, ShoppingBag, ShieldCheck, AlertTriangle,
  Layers, ArrowRight, ArrowLeft, X, CheckCircle2, IndianRupee, Tag,
  Eye, RefreshCw, Plus, Check, Heart, Droplets, Moon, Sun, Info, Calendar
} from 'lucide-react';
import {
  api, Product, ProductSuitabilityDetail, ProductComparisonResponse,
  AlternativeProductsResponse
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

  // Selected for full Product Detail view
  const [detailedProduct, setDetailedProduct] = useState<ProductSuitabilityDetail | null>(null);

  // Add to routine state
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('AM');

  // Comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<ProductComparisonResponse | null>(null);
  const [comparingLoading, setComparingLoading] = useState<boolean>(false);

  // Alternative products modal
  const [alternativesModalOpen, setAlternativesModalOpen] = useState<boolean>(false);
  const [alternativesData, setAlternativesData] = useState<AlternativeProductsResponse | null>(null);
  const [alternativesLoading, setAlternativesLoading] = useState<boolean>(false);

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

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory, selectedBudget]);

  const toggleCompare = (productId: number) => {
    if (selectedForCompare.includes(productId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== productId));
    } else {
      if (selectedForCompare.length >= 4) {
        showToast('You can compare a maximum of 4 products simultaneously.', 'info');
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

  const handleOpenAlternatives = async (productId: number) => {
    try {
      setAlternativesLoading(true);
      setAlternativesModalOpen(true);
      const res = await api.getProductAlternatives(productId);
      setAlternativesData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load safer alternatives', 'error');
    } finally {
      setAlternativesLoading(false);
    }
  };

  const handleAddToRoutine = async (productId: number, timeOfDay: string = 'AM') => {
    try {
      setAddingId(productId);
      const res = await api.addProductToRoutine(productId, { time_of_day: timeOfDay });
      showToast(res.message, 'success');
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> AuraSkin Product Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Personalized Product Discovery & Routine Integration
              </h1>
              <p className="mt-2 text-teal-100 max-w-2xl text-sm sm:text-base">
                Discover biocompatible skincare products with transparent match scoring, side-by-side comparison, and one-click integration into your daily AM/PM routine.
              </p>
            </div>

            {selectedForCompare.length > 0 && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <span className="text-sm font-medium text-teal-100">
                  {selectedForCompare.length} selected
                </span>
                <button
                  onClick={handleOpenComparison}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" /> Compare ({selectedForCompare.length})
                </button>
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
                  title="Clear selection"
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
                  onClick={() => handleOpenAlternatives(detailedProduct.product.id)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  View Safer Alternatives
                </button>
                <button
                  onClick={() => toggleCompare(detailedProduct.product.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                    selectedForCompare.includes(detailedProduct.product.id)
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {selectedForCompare.includes(detailedProduct.product.id) ? 'Selected for Compare' : 'Add to Compare'}
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
              <div className="lg:col-span-4 bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-3xl p-6 border border-teal-200/80 text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">AuraSkin Compatibility</span>
                <div className="text-5xl font-black text-teal-950">
                  {detailedProduct.suitability_score}%
                </div>
                <div className="text-xs font-bold text-teal-800">
                  {detailedProduct.suitability_score >= 80 ? 'Highly Biocompatible' : 'Compatible Match'}
                </div>
                <p className="text-[11px] text-teal-700">
                  Calculated against your active 5-factor dermal profile and allergy database.
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
                  Select when you plan to use this product. AuraSkin will automatically place it in the correct step order.
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
                    className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition"
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

                <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fragranceFreeOnly}
                      onChange={e => setFragranceFreeOnly(e.target.checked)}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300"
                    />
                    <span>Fragrance-Free</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alcoholFreeOnly}
                      onChange={e => setAlcoholFreeOnly(e.target.checked)}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300"
                    />
                    <span>Alcohol-Free</span>
                  </label>
                </div>
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

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-3xl p-6 border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                        isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">{p.category}</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">{p.name}</h3>
                            <p className="text-xs text-slate-500">{p.brand}</p>
                          </div>

                          <div className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-center font-black text-sm text-teal-900 shrink-0">
                            <div>{rec.suitability_score}%</div>
                            <div className="text-[9px] uppercase tracking-tight text-teal-700 font-semibold">Match</div>
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
                            <p className="text-[11px] text-teal-800">{rec.reasons[0]}</p>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-base font-extrabold text-slate-900 flex items-center">
                          <IndianRupee className="w-4 h-4 inline text-slate-600" />
                          {p.price.toLocaleString('en-IN')}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailedProduct(rec)}
                            className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                          >
                            View Analysis
                          </button>

                          <button
                            onClick={() => handleAddToRoutine(p.id, 'AM')}
                            disabled={addingId === p.id}
                            className="px-3 py-1.5 text-xs font-bold bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg transition flex items-center gap-1"
                            title="Add to daily morning routine"
                          >
                            {addingId === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Routine
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

        {/* Side-by-Side Product Comparison Modal */}
        {comparisonModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card max-w-5xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-600" /> Side-by-Side Product Comparison
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-dimensional compatibility comparison based on your clinical dermal profile.
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
                  {/* Summary Verdict */}
                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs font-medium text-teal-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>{comparisonData.summary_verdict}</div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70">
                          <th className="p-3 font-bold text-slate-500 uppercase tracking-wider w-36">Metric</th>
                          {comparisonData.compared_products.map(item => (
                            <th key={item.product.id} className="p-3 font-extrabold text-slate-900 min-w-[200px]">
                              <div>{item.product.name}</div>
                              <div className="text-[11px] font-normal text-slate-500">{item.product.brand}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Suitability */}
                        <tr>
                          <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Suitability</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-3 font-black text-sm text-teal-800">
                              {item.suitability_score}%
                              {item.product.id === comparisonData.best_match_id && (
                                <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                                  Top Match
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Price */}
                        <tr>
                          <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Price</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-3 font-bold text-slate-900">
                              ₹{item.price.toLocaleString('en-IN')}
                              {item.product.id === comparisonData.best_value_id && (
                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase">
                                  Best Value
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Allergen Safety */}
                        <tr>
                          <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Allergen Safety</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-3">
                              {item.is_safe_for_user ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Safe
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Allergen Alert
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Key Actives */}
                        <tr>
                          <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Key Actives</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-3 text-slate-600">
                              {item.key_actives.join(', ') || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        {/* Barrier Support */}
                        <tr>
                          <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Barrier Support</td>
                          {comparisonData.compared_products.map(item => (
                            <td key={item.product.id} className="p-3 text-slate-700">
                              {item.barrier_support ? 'Yes (Lipid Matrix)' : 'Standard'}
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

        {/* Alternative Products Modal */}
        {alternativesModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card max-w-3xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" /> Safer Alternative Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-suitability products without contraindications or allergen conflicts.
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
                  <p className="text-sm text-slate-600">Finding safest biocompatible alternatives...</p>
                </div>
              ) : alternativesData ? (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                      Why Alternatives Are Suggested For: {alternativesData.unsuitable_product.name}
                    </span>
                    <p>{alternativesData.unsuitability_reason}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">Recommended Safer Options:</h3>
                    {alternativesData.alternatives.map(alt => (
                      <div
                        key={alt.product.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-teal-700 uppercase">{alt.product.category}</span>
                          <h4 className="text-sm font-bold text-slate-900">{alt.product.name}</h4>
                          <p className="text-xs text-slate-500">{alt.product.brand} · ₹{alt.product.price.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="text-base font-black text-emerald-800">{alt.suitability_score}%</div>
                            <div className="text-[9px] font-semibold text-emerald-700 uppercase">Match</div>
                          </div>

                          <button
                            onClick={() => {
                              setAlternativesModalOpen(false);
                              handleAddToRoutine(alt.product.id, 'AM');
                            }}
                            className="px-3 py-2 bg-teal-700 text-white font-bold text-xs rounded-xl hover:bg-teal-600 transition"
                          >
                            Add to Routine
                          </button>
                        </div>
                      </div>
                    ))}
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
