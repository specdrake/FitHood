'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { clearUserData, getAllFoods, getAllWorkouts, getAllWeights } from '@/lib/db';
import { exportFoodsToCSV, exportWorkoutsToCSV, exportWeightsToCSV, exportAllDataToCSV } from '@/lib/csv-export';
import { FoodEntry, WorkoutEntry, WeightEntry } from '@/lib/types';

interface SettingsProps {
  userId: string;
  userName: string | null;
}

export default function Settings({ userId, userName }: SettingsProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Data counts for export
  const [dataCounts, setDataCounts] = useState({ foods: 0, workouts: 0, weights: 0 });
  const [allData, setAllData] = useState<{
    foods: FoodEntry[];
    workouts: WorkoutEntry[];
    weights: WeightEntry[];
  }>({ foods: [], workouts: [], weights: [] });

  useEffect(() => {
    loadDataCounts();
  }, [userId]);

  const loadDataCounts = async () => {
    try {
      const [foods, workouts, weights] = await Promise.all([
        getAllFoods(userId),
        getAllWorkouts(userId),
        getAllWeights(userId),
      ]);
      setDataCounts({
        foods: foods.length,
        workouts: workouts.length,
        weights: weights.length,
      });
      setAllData({ foods, workouts, weights });
    } catch (error) {
      console.error('Failed to load data counts:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFoods = () => {
    if (allData.foods.length > 0) {
      exportFoodsToCSV(allData.foods);
      setMessage({ type: 'success', text: 'Food data exported!' });
    }
  };

  const handleExportWorkouts = () => {
    if (allData.workouts.length > 0) {
      exportWorkoutsToCSV(allData.workouts);
      setMessage({ type: 'success', text: 'Workout data exported!' });
    }
  };

  const handleExportWeights = () => {
    if (allData.weights.length > 0) {
      exportWeightsToCSV(allData.weights);
      setMessage({ type: 'success', text: 'Weight data exported!' });
    }
  };

  const handleExportAll = () => {
    exportAllDataToCSV(allData.foods, allData.workouts, allData.weights);
    setMessage({ type: 'success', text: 'All data exported!' });
  };

  const handleClearData = async () => {
    setIsLoading(true);
    try {
      await clearUserData(userId);
      setMessage({ type: 'success', text: 'All your data has been cleared!' });
      setShowDeleteConfirm(false);
      setDataCounts({ foods: 0, workouts: 0, weights: 0 });
      setAllData({ foods: [], workouts: [], weights: [] });
    } catch {
      setMessage({ type: 'error', text: 'Failed to clear data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const totalEntries = dataCounts.foods + dataCounts.workouts + dataCounts.weights;

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl text-gradient">Settings</h2>
        <p className="text-gray-400">Manage your account</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-electric/20 text-electric border border-electric/30'
              : 'bg-coral/20 text-coral border border-coral/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* User Info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span>👤</span> Account
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric to-neon-cyan flex items-center justify-center text-2xl font-bold text-midnight">
            {userName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xl font-semibold">{userName}</p>
            <p className="text-sm text-gray-400">User ID: {userId.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span>📤</span> Export Data
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Download your data as CSV files. Total: {totalEntries} entries
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleExportFoods}
            disabled={dataCounts.foods === 0}
            className="p-4 rounded-xl bg-white/5 hover:bg-coral/20 border border-transparent hover:border-coral/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">🍎</span>
            <p className="text-sm font-medium mt-2">Food</p>
            <p className="text-xs text-gray-500">{dataCounts.foods} entries</p>
          </button>
          
          <button
            onClick={handleExportWorkouts}
            disabled={dataCounts.workouts === 0}
            className="p-4 rounded-xl bg-white/5 hover:bg-neon-cyan/20 border border-transparent hover:border-neon-cyan/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">💪</span>
            <p className="text-sm font-medium mt-2">Workouts</p>
            <p className="text-xs text-gray-500">{dataCounts.workouts} entries</p>
          </button>
          
          <button
            onClick={handleExportWeights}
            disabled={dataCounts.weights === 0}
            className="p-4 rounded-xl bg-white/5 hover:bg-amber-glow/20 border border-transparent hover:border-amber-glow/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">⚖️</span>
            <p className="text-sm font-medium mt-2">Weight</p>
            <p className="text-xs text-gray-500">{dataCounts.weights} entries</p>
          </button>
          
          <button
            onClick={handleExportAll}
            disabled={totalEntries === 0}
            className="p-4 rounded-xl bg-gradient-to-br from-electric/20 to-neon-cyan/20 hover:from-electric/30 hover:to-neon-cyan/30 border border-electric/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">📦</span>
            <p className="text-sm font-medium mt-2">All Data</p>
            <p className="text-xs text-gray-500">{totalEntries} total</p>
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span>🔐</span> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-electric focus:outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-electric focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-electric to-neon-cyan text-midnight font-semibold hover:glow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-coral/30">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-coral">
          <span>⚠️</span> Danger Zone
        </h3>
        
        {!showDeleteConfirm ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl border border-coral/50 text-coral hover:bg-coral/10 transition-all"
            >
              Clear All My Data
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-white/5 transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <p className="text-coral text-sm">
              This will permanently delete all your food, workout, and weight data. This cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/80 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
