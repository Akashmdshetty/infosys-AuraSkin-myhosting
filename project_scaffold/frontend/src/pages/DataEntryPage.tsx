import React, { useState } from 'react';
import { DataEntryHeader } from '../components/DataEntryHeader';
import { DataEntryNavTabs } from '../components/DataEntryNavTabs';
import { SkinProfileCard } from '../components/SkinProfileCard';
import { LifestyleCard } from '../components/LifestyleCard';
import { TrackersCard } from '../components/TrackersCard';
import { DailyDataSummaryCard } from '../components/DailyDataSummaryCard';
import { SkinIntelligenceConnectionCard } from '../components/SkinIntelligenceConnectionCard';
import { DermalOrbVisual } from '../components/DermalOrbVisual';

export const DataEntryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'skin' | 'lifestyle' | 'trackers'>('all');

  const scrollToSection = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTabSelect = (tab: 'all' | 'skin' | 'lifestyle' | 'trackers') => {
    setActiveTab(tab);
    if (tab === 'skin') scrollToSection('section-skin-profile');
    if (tab === 'lifestyle') scrollToSection('section-lifestyle');
    if (tab === 'trackers') scrollToSection('section-trackers');
  };

  const handleNavigateToDashboard = () => {
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sample-container animate-fade-in py-6 max-w-[1280px] mx-auto">
      {/* 1. Header with Neural Particle Canvas */}
      <DataEntryHeader />

      {/* 2. Segmented Section Navigation Tabs */}
      <DataEntryNavTabs activeTab={activeTab} onTabSelect={handleTabSelect} />

      {/* 3. Rendered Sections Grid */}
      <div className="space-y-8">
        {/* Baseline Skin Profile Section */}
        {(activeTab === 'all' || activeTab === 'skin') && (
          <SkinProfileCard />
        )}

        {/* Lifestyle & Stress Matrix Section */}
        {(activeTab === 'all' || activeTab === 'lifestyle') && (
          <LifestyleCard />
        )}

        {/* Daily Biometric Telemetry Section */}
        {(activeTab === 'all' || activeTab === 'trackers') && (
          <TrackersCard />
        )}

        {/* Summary & Scoring Model Connection Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyDataSummaryCard />
          <SkinIntelligenceConnectionCard onNavigateToDashboard={handleNavigateToDashboard} />
        </div>

        {/* Conceptual Dermal Orb Cluster Visual */}
        <DermalOrbVisual />
      </div>

      <footer className="mt-12 py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 font-medium">
        AuraSkin Data & Biometric Intelligence Console © 2025 • Infosys Skincare Project
      </footer>
    </div>
  );
};

export default DataEntryPage;
