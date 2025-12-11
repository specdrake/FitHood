'use client';

import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'food', label: 'Food', icon: '🍎' },
  { id: 'workouts', label: 'Workouts', icon: '💪' },
  { id: 'weight', label: 'Weight', icon: '⚖️' },
  { id: 'upload', label: 'Upload', icon: '📤' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 md:relative md:border-t-0 md:border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-1 py-2 md:py-0">
          <div className="hidden md:flex items-center gap-3 py-4 pr-8 border-r border-white/10 mr-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-midnight font-display text-xl">
              F
            </div>
            <span className="font-display text-2xl text-gradient">FitHood</span>
          </div>
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 md:px-5 py-3 md:py-4 rounded-lg transition-all duration-200',
                activeTab === tab.id
                  ? 'text-electric bg-electric/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              )}
            >
              <span className="text-xl md:text-lg">{tab.icon}</span>
              <span className="text-xs md:text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

