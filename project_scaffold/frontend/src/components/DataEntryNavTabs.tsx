import React from 'react';
import { Layers, Sparkles, Heart, Activity } from 'lucide-react';

interface DataEntryNavTabsProps {
  activeTab: 'all' | 'skin' | 'lifestyle' | 'trackers';
  onTabSelect: (tab: 'all' | 'skin' | 'lifestyle' | 'trackers') => void;
}

export const DataEntryNavTabs: React.FC<DataEntryNavTabsProps> = ({ activeTab, onTabSelect }) => {
  const tabs = [
    { id: 'all', label: 'All Sections', icon: Layers },
    { id: 'skin', label: 'Skin Profile', icon: Sparkles },
    { id: 'lifestyle', label: 'Lifestyle Matrix', icon: Heart },
    { id: 'trackers', label: 'Daily Trackers', icon: Activity },
  ] as const;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-white/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs mb-8 backdrop-blur-md sticky top-20 z-40">
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#00685f] text-white shadow-sm shadow-teal-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-teal-200' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
