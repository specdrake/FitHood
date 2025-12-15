'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

interface HealthCalculatorProps {
  currentWeight: number; // kg
  avgDailyCalories: number;
  avgDailyBurned: number;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  veryActive: 1.9,     // Very hard exercise, physical job
};

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Light (exercise 1-3 days/week)',
  moderate: 'Moderate (exercise 3-5 days/week)',
  active: 'Active (hard exercise 6-7 days/week)',
  veryActive: 'Very Active (physical job)',
};

// 1 kg of fat ≈ 7700 calories
const CALORIES_PER_KG = 7700;

export default function HealthCalculator({ currentWeight, avgDailyCalories, avgDailyBurned }: HealthCalculatorProps) {
  const [profile, setProfile] = useState<UserProfile>({
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    goalWeight: currentWeight > 0 ? currentWeight - 5 : 70,
    weeklyGoal: 0.5,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse user profile:', e);
      }
    }
  }, []);

  // Save profile to localStorage
  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
  };

  // Calculate BMI
  const heightInMeters = profile.height / 100;
  const bmi = currentWeight > 0 ? currentWeight / (heightInMeters * heightInMeters) : 0;
  
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-cyan-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-electric' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-coral' };
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (currentWeight <= 0) return 0;
    if (profile.gender === 'male') {
      return 10 * currentWeight + 6.25 * profile.height - 5 * profile.age + 5;
    }
    return 10 * currentWeight + 6.25 * profile.height - 5 * profile.age - 161;
  };

  const bmr = calculateBMR();
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]; // Total Daily Energy Expenditure

  // Calculate deficit info
  const weightToLose = currentWeight - (profile.goalWeight || currentWeight);
  const isGaining = weightToLose < 0;
  const absWeightChange = Math.abs(weightToLose);
  
  // Weekly calorie adjustment needed
  const weeklyDeficit = (profile.weeklyGoal || 0.5) * CALORIES_PER_KG;
  const dailyDeficit = weeklyDeficit / 7;
  
  // Target calories
  const targetCalories = isGaining ? tdee + dailyDeficit : tdee - dailyDeficit;
  
  // Current status
  const currentDailyNet = avgDailyCalories - avgDailyBurned;
  const currentDeficit = tdee - currentDailyNet;
  const actualWeeklyChange = (currentDeficit * 7) / CALORIES_PER_KG;
  
  // Time to goal
  const weeksToGoal = absWeightChange > 0 && actualWeeklyChange !== 0 
    ? Math.abs(absWeightChange / actualWeeklyChange)
    : 0;
  const daysToGoal = Math.round(weeksToGoal * 7);

  const bmiCategory = getBmiCategory(bmi);

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl">Health Calculator</h3>
        <button
          onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
          className={`px-3 py-1 rounded-lg text-sm ${
            isEditing ? 'bg-electric text-midnight' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {isEditing ? 'Save' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Editor */}
      {isEditing && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-white/5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="block text-xs text-gray-500 mb-1">Activity Level</label>
            <select
              value={profile.activityLevel}
              onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as UserProfile['activityLevel'] })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            >
              {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Goal Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={profile.goalWeight || ''}
              onChange={(e) => setProfile({ ...profile, goalWeight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Weekly Goal (kg/week)</label>
            <select
              value={profile.weeklyGoal || 0.5}
              onChange={(e) => setProfile({ ...profile, weeklyGoal: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-electric focus:outline-none text-sm"
            >
              <option value="0.25">0.25 kg (slow)</option>
              <option value="0.5">0.5 kg (moderate)</option>
              <option value="0.75">0.75 kg (fast)</option>
              <option value="1">1 kg (aggressive)</option>
            </select>
          </div>
        </div>
      )}

      {/* BMI & BMR Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-gray-500 mb-1">BMI</p>
          <p className={`text-2xl font-bold font-mono ${bmiCategory.color}`}>
            {bmi > 0 ? bmi.toFixed(1) : '--'}
          </p>
          <p className={`text-xs ${bmiCategory.color}`}>{bmi > 0 ? bmiCategory.label : 'Add weight'}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-gray-500 mb-1">BMR</p>
          <p className="text-2xl font-bold font-mono text-coral">
            {bmr > 0 ? Math.round(bmr) : '--'}
          </p>
          <p className="text-xs text-gray-500">cal/day at rest</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-gray-500 mb-1">TDEE</p>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {tdee > 0 ? Math.round(tdee) : '--'}
          </p>
          <p className="text-xs text-gray-500">maintenance</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xs text-gray-500 mb-1">Target</p>
          <p className={`text-2xl font-bold font-mono ${isGaining ? 'text-electric' : 'text-cyan-400'}`}>
            {targetCalories > 0 ? Math.round(targetCalories) : '--'}
          </p>
          <p className="text-xs text-gray-500">{isGaining ? 'to gain' : 'to lose'}</p>
        </div>
      </div>

      {/* Deficit Analysis */}
      {currentWeight > 0 && avgDailyCalories > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-electric/10 to-cyan-500/10 border border-electric/20">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            📊 Your Progress Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Daily Status</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>TDEE (Maintenance)</span>
                  <span className="font-mono">{Math.round(tdee)} cal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Intake</span>
                  <span className="font-mono">{Math.round(avgDailyCalories)} cal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Burned (exercise)</span>
                  <span className="font-mono text-coral">-{Math.round(avgDailyBurned)} cal</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-1 border-t border-white/10">
                  <span>Net Daily</span>
                  <span className="font-mono">{Math.round(currentDailyNet)} cal</span>
                </div>
                <div className={`flex justify-between text-sm font-bold ${currentDeficit > 0 ? 'text-electric' : 'text-coral'}`}>
                  <span>Daily {currentDeficit > 0 ? 'Deficit' : 'Surplus'}</span>
                  <span className="font-mono">{Math.abs(Math.round(currentDeficit))} cal</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Projected Results</p>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500">Weekly Change</p>
                  <p className={`text-lg font-bold font-mono ${actualWeeklyChange > 0 ? 'text-electric' : 'text-coral'}`}>
                    {actualWeeklyChange > 0 ? '-' : '+'}{Math.abs(actualWeeklyChange).toFixed(2)} kg/week
                  </p>
                </div>
                
                {profile.goalWeight && absWeightChange > 0 && (
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-xs text-gray-500">
                      Time to reach {profile.goalWeight} kg
                    </p>
                    <p className="text-lg font-bold font-mono text-cyan-400">
                      {daysToGoal > 0 && daysToGoal < 1000 ? (
                        <>
                          ~{Math.round(weeksToGoal)} weeks
                          <span className="text-xs text-gray-500 ml-2">({daysToGoal} days)</span>
                        </>
                      ) : actualWeeklyChange <= 0 && !isGaining ? (
                        <span className="text-coral text-sm">Need more deficit!</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Keep tracking</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="p-2 rounded-lg bg-electric/10 border border-electric/20">
                  <p className="text-xs text-electric">💡 Recommendation</p>
                  <p className="text-sm mt-1">
                    {currentDeficit > 0 && currentDeficit >= dailyDeficit * 0.8 ? (
                      `Great! You're on track to lose ~${actualWeeklyChange.toFixed(1)} kg/week.`
                    ) : currentDeficit > 0 ? (
                      `Reduce intake by ~${Math.round(dailyDeficit - currentDeficit)} cal/day to hit your goal.`
                    ) : isGaining ? (
                      `Good! You're in a surplus of ${Math.abs(Math.round(currentDeficit))} cal/day.`
                    ) : (
                      `You're eating above maintenance. Reduce by ${Math.abs(Math.round(currentDeficit)) + Math.round(dailyDeficit)} cal to create deficit.`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info */}
      {(currentWeight <= 0 || avgDailyCalories <= 0) && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>Add weight entries and track food to see detailed analysis</p>
        </div>
      )}
    </div>
  );
}
