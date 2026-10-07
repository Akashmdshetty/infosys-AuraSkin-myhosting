import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardHeader } from '../components/DashboardHeader';
import { SkinScoreCard } from '../components/SkinScoreCard';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { TrackersCard } from '../components/TrackersCard';
import { SkinIntelligenceInsightCard } from '../components/SkinIntelligenceInsightCard';
import { ScoreTrendCard } from '../components/ScoreTrendCard';
import { RoutinePlannerCard } from '../components/RoutinePlannerCard';
import { EvidenceRecommendationsCard } from '../components/EvidenceRecommendationsCard';
import { DermalSphereVisual } from '../components/DermalSphereVisual';
import { LandingPage } from './LandingPage';
import { api, ProductSuitabilityDetail } from '../services/api';
import { ShoppingBag, BookOpen, TrendingUp, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  onOpenAuth: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [topRecs, setTopRecs] = useState<ProductSuitabilityDetail[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingRecs(true);
      api.getProductRecommendations({ limit: 3 })
        .then((res) => setTopRecs(res.recommendations || []))
        .catch(() => setTopRecs([]))
        .finally(() => setLoadingRecs(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LandingPage onOpenAuth={onOpenAuth} />;
  }

  return (
    <div className="sample-container animate-fade-in py-6">
      {/* 1. Hero / Welcome Section with Neural Particle Canvas */}
      <DashboardHeader onNavigateToDataEntry={() => onNavigate('data-entry')} />

      {/* Milestone 3 Quick Launch Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Products Card */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-gradient-to-br from-teal-900 to-teal-800 text-white rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition border border-teal-700/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-teal-300" />
            </div>
            <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold mt-3">Product Intelligence</h3>
          <p className="text-xs text-teal-200 mt-1">Biocompatible products & personalized suitability scores</p>
        </div>

        {/* Ingredients Card */}
        <div
          onClick={() => onNavigate('ingredients')}
          className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition border border-indigo-900/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold mt-3">Ingredient Encyclopedia</h3>
          <p className="text-xs text-indigo-200 mt-1">4-tier INCI safety scanner & chemical interaction matrix</p>
        </div>

        {/* Progress Card */}
        <div
          onClick={() => onNavigate('progress')}
          className="bg-gradient-to-br from-teal-950 to-cyan-950 text-white rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition border border-cyan-900/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="text-sm font-bold mt-3">Skin Journey & Adherence</h3>
          <p className="text-xs text-cyan-200 mt-1">Longitudinal clinical analysis & daily adherence logs</p>
        </div>
      </div>

      {/* 2. Top Row: 3D Centerpiece Gauge, 5-Factor Breakdown & Profile Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <SkinScoreCard />
          <ScoreBreakdownCard />
        </div>
        <div className="space-y-6">
          <ProfileCompletionCard onNavigateToDataEntry={() => onNavigate('data-entry')} />
          <DermalSphereVisual />
        </div>
      </div>

      {/* 3. AI Intelligence Insight & Historical Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SkinIntelligenceInsightCard onNavigateToDataEntry={() => onNavigate('data-entry')} />
        <ScoreTrendCard />
      </div>

      {/* 4. Personalized Products Spotlight */}
      {topRecs.length > 0 && (
        <div className="mb-6 sample-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="section-label text-teal-700">Matched For You</span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Top Recommended Products</h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Explore Full Catalog <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecs.map((rec) => (
              <div
                key={rec.product.id}
                onClick={() => onNavigate('products')}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {rec.product.category}
                    </span>
                    <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {rec.suitability_score}% Match
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">{rec.product.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{rec.product.brand} • ${rec.product.price.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{rec.reasons?.[0] || rec.product.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                  <span>View Breakdown</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Today's Telemetry Section */}
      <div className="mb-6">
        <TrackersCard />
      </div>

      {/* 6. Chronobiology Routine & Evidence Guidance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RoutinePlannerCard />
        <EvidenceRecommendationsCard />
      </div>

      <footer className="mt-10 py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 font-medium">
        AuraSkin AI Skin Intelligence & Clinical Health Platform © 2025 • Infosys Skincare Project
      </footer>
    </div>
  );
};

export default DashboardPage;
