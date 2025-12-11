'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CSVUpload from '@/components/CSVUpload';
import FoodTracker from '@/components/FoodTracker';
import WorkoutTracker from '@/components/WorkoutTracker';
import WeightTracker from '@/components/WeightTracker';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard refreshTrigger={refreshTrigger} />;
      case 'food':
        return <FoodTracker refreshTrigger={refreshTrigger} />;
      case 'workouts':
        return <WorkoutTracker refreshTrigger={refreshTrigger} />;
      case 'weight':
        return <WeightTracker refreshTrigger={refreshTrigger} onUpdate={handleDataUpdate} />;
      case 'upload':
        return <CSVUpload onUploadComplete={handleDataUpdate} />;
      default:
        return <Dashboard refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-midnight font-display text-lg">
            F
          </div>
          <span className="font-display text-xl text-gradient">FitHood</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-8 pb-4">
        {renderContent()}
      </div>
    </main>
  );
}

