'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CSVUpload from '@/components/CSVUpload';
import FoodTracker from '@/components/FoodTracker';
import WorkoutTracker from '@/components/WorkoutTracker';
import WeightTracker from '@/components/WeightTracker';
import Settings from '@/components/Settings';

export default function Home() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleDataUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Get user ID for data scoping
  const userId = user?.id || '';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || null;
  const userEmail = user?.email || '';
  const userImage = user?.user_metadata?.avatar_url || null;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Create a session-like user object for compatibility
  const sessionUser = {
    id: userId,
    name: userName,
    email: userEmail,
    image: userImage,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userId={userId} refreshTrigger={refreshTrigger} />;
      case 'food':
        return <FoodTracker userId={userId} refreshTrigger={refreshTrigger} />;
      case 'workouts':
        return <WorkoutTracker userId={userId} refreshTrigger={refreshTrigger} />;
      case 'weight':
        return <WeightTracker userId={userId} refreshTrigger={refreshTrigger} onUpdate={handleDataUpdate} />;
      case 'upload':
        return <CSVUpload userId={userId} onUploadComplete={handleDataUpdate} />;
      case 'settings':
        return <Settings userId={userId} userName={userName} />;
      default:
        return <Dashboard userId={userId} refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={sessionUser}
        onLogout={handleLogout}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-midnight font-display text-lg">
              F
            </div>
            <span className="font-display text-xl text-gradient">FitHood</span>
          </div>
          <div className="flex items-center gap-2">
            {userImage ? (
              <img 
                src={userImage} 
                alt={userName || ''} 
                className="w-8 h-8 rounded-full border-2 border-electric/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center text-sm font-medium text-electric">
                {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-8 pb-4">
        {renderContent()}
      </div>
    </main>
  );
}
