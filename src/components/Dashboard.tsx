'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getFoodsByDateRange, getWorkoutsByDateRange, getAllWeights, getUserProfile } from '@/lib/db';
import { FoodEntry, WorkoutEntry, WeightEntry, DailySummary, UserProfile } from '@/lib/types';
import { formatDisplayDate, getDateRange, groupByDate, calculateDailySummary, getMacroPercentages } from '@/lib/utils';
import HealthCalculator from './HealthCalculator';

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

interface DashboardProps {
  userId: string;
  refreshTrigger: number;
}

const COLORS = {
  electric: '#00ff88',
  coral: '#ff6b6b',
  amber: '#ffc93c',
  cyan: '#00d4ff',
};

// Common tooltip style for all charts
const tooltipStyle = {
  contentStyle: {
    background: 'rgba(15, 15, 26, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: '#fff' },
};

export default function Dashboard({ userId, refreshTrigger }: DashboardProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dateRange, setDateRange] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, dateRange, refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      const [foods, workouts, weightData, profile] = await Promise.all([
        getFoodsByDateRange(userId, startDate, endDate),
        getWorkoutsByDateRange(userId, startDate, endDate),
        getAllWeights(userId),
        getUserProfile(userId),
      ]);

      const foodsByDate = groupByDate(foods);
      const workoutsByDate = groupByDate(workouts);
      const weightsByDate = new Map(weightData.map((w) => [w.date, w.weight]));

      // Generate summaries for each day in range
      const summaryList: DailySummary[] = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayFoods = foodsByDate.get(dateStr) || [];
        const dayWorkouts = workoutsByDate.get(dateStr) || [];
        const dayWeight = weightsByDate.get(dateStr);

        summaryList.push(calculateDailySummary(dateStr, dayFoods, dayWorkouts, dayWeight));
        current.setDate(current.getDate() + 1);
      }

      setSummaries(summaryList);
      setWeights(weightData.sort((a, b) => a.date.localeCompare(b.date)));
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = summaries.reduce((sum, s) => sum + s.totalCalories, 0);
  const totalProtein = summaries.reduce((sum, s) => sum + s.totalProtein, 0);
  const totalCarbs = summaries.reduce((sum, s) => sum + s.totalCarbs, 0);
  const totalFat = summaries.reduce((sum, s) => sum + s.totalFat, 0);
  
  // Only count days that have actual data for averages
  const daysWithCalories = summaries.filter(s => s.totalCalories > 0).length;
  const daysWithProtein = summaries.filter(s => s.totalProtein > 0).length;
  const avgCalories = daysWithCalories > 0 ? Math.round(totalCalories / daysWithCalories) : 0;
  const avgProtein = daysWithProtein > 0 ? Math.round(totalProtein / daysWithProtein) : 0;

  // Calculate total calories burned from workouts
  const totalCaloriesBurned = summaries.reduce((sum, s) => 
    sum + s.workoutEntries.reduce((ws, w) => ws + (w.caloriesBurned || 0), 0), 0
  );
  const avgCaloriesBurned = daysWithCalories > 0 ? Math.round(totalCaloriesBurned / daysWithCalories) : 0;

  // Get latest weight
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;

  // Calculate TDEE and deficit
  const calculateBMR = () => {
    if (latestWeight <= 0 || !userProfile) return 0;
    if (userProfile.gender === 'male') {
      return 10 * latestWeight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    }
    return 10 * latestWeight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
  };
  
  const bmr = calculateBMR();
  const dailyTdee = userProfile ? bmr * (ACTIVITY_MULTIPLIERS[userProfile.activityLevel] || 1.55) : 0;
  
  // Calculate TOTAL deficit for LOGGED days
  // Formula: Deficit = Calories In - (TDEE + Workout Burned)
  // TDEE already includes BMR + sedentary activity
  // Workout burned is additional expenditure on top of TDEE
  const totalTdee = dailyTdee * daysWithCalories; // TDEE for logged days
  const totalExpenditure = totalTdee + totalCaloriesBurned; // Total burn = TDEE + exercise
  const totalDeficit = dailyTdee > 0 && daysWithCalories > 0 
    ? Math.round(totalCalories - totalExpenditure) // Intake - Expenditure
    : 0;
  
  // Daily average for display
  const avgDailyDeficit = daysWithCalories > 0 ? Math.round(totalDeficit / daysWithCalories) : 0;

  const macroPercentages = getMacroPercentages(totalProtein, totalCarbs, totalFat);
  const macroData = [
    { name: 'Protein', value: macroPercentages.proteinPercent, color: COLORS.coral },
    { name: 'Carbs', value: macroPercentages.carbsPercent, color: COLORS.amber },
    { name: 'Fat', value: macroPercentages.fatPercent, color: COLORS.cyan },
  ];

  const calorieChartData = summaries.map((s) => ({
    date: formatDisplayDate(s.date),
    calories: s.totalCalories,
    protein: s.totalProtein,
  }));

  const weightChartData = weights.map((w) => ({
    date: formatDisplayDate(w.date),
    weight: w.weight,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-electric/30 border-t-electric rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl text-gradient">Dashboard</h2>
          <p className="text-gray-400">Your fitness overview</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange === days
                  ? 'bg-electric text-midnight'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-electric/20 flex items-center justify-center text-xl">
              🔥
            </div>
            <span className="text-gray-400 text-sm">Avg Calories</span>
          </div>
          <p className="text-3xl font-bold text-electric font-mono">{avgCalories.toLocaleString()}</p>
        </div>

        <div className="glass rounded-2xl p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-coral/20 flex items-center justify-center text-xl">
              🥩
            </div>
            <span className="text-gray-400 text-sm">Avg Protein</span>
          </div>
          <p className="text-3xl font-bold text-coral font-mono">{avgProtein}g</p>
        </div>

        <div className="glass rounded-2xl p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${totalDeficit < 0 ? 'bg-electric/20' : 'bg-coral/20'}`}>
              {totalDeficit < 0 ? '📉' : '📈'}
            </div>
            <span className="text-gray-400 text-sm">{daysWithCalories}D Deficit</span>
          </div>
          <p className={`text-3xl font-bold font-mono ${totalDeficit < 0 ? 'text-electric' : 'text-coral'}`}>
            {totalDeficit !== 0 ? totalDeficit.toLocaleString() : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalDeficit !== 0 ? `${avgDailyDeficit}/day avg` : 'Set profile first'}
          </p>
        </div>

        <div className="glass rounded-2xl p-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center text-xl">
              ⚖️
            </div>
            <span className="text-gray-400 text-sm">Latest Weight</span>
          </div>
          <p className="text-3xl font-bold text-neon-cyan font-mono">
            {weights.length > 0 ? `${weights[weights.length - 1].weight}kg` : '--'}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calories & Protein Chart - using ComposedChart with dual Y-axis */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📈</span> Calories & Protein Trend
          </h3>
          <div className="h-64">
            {calorieChartData.some((d) => d.calories > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={calorieChartData}>
                  <defs>
                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.electric} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.electric} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis 
                    yAxisId="calories"
                    stroke={COLORS.electric} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Cal', angle: -90, position: 'insideLeft', fill: COLORS.electric, fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="protein"
                    orientation="right"
                    stroke={COLORS.coral} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Protein (g)', angle: 90, position: 'insideRight', fill: COLORS.coral, fontSize: 10 }}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                  <Area
                    yAxisId="calories"
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke={COLORS.electric}
                    fill="url(#calorieGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="protein"
                    type="monotone"
                    dataKey="protein"
                    name="Protein (g)"
                    stroke={COLORS.coral}
                    strokeWidth={3}
                    dot={{ fill: COLORS.coral, strokeWidth: 0, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-4xl mb-2">📊</p>
                  <p>No calorie data yet</p>
                  <p className="text-sm">Upload a food CSV to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Macro Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🥧</span> Macro Split
          </h3>
          <div className="h-48">
            {totalProtein + totalCarbs + totalFat > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No macro data</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-3">
            {macroData.map((macro) => (
              <div key={macro.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: macro.color }}
                />
                <span className="text-sm font-medium" style={{ color: macro.color }}>
                  {macro.name}
                </span>
                <span className="text-sm text-gray-400">({macro.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      {weightChartData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>⚖️</span> Weight Progress
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number) => [`${value} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={COLORS.cyan}
                  strokeWidth={3}
                  dot={{ fill: COLORS.cyan, strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Today's Summary */}
      {summaries.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📅</span> Today&apos;s Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Calories', 'Protein', 'Carbs', 'Fat', 'Fiber'].map((label, i) => {
              const today = summaries[summaries.length - 1];
              const values = [
                today?.totalCalories || 0,
                today?.totalProtein || 0,
                today?.totalCarbs || 0,
                today?.totalFat || 0,
                today?.totalFiber || 0,
              ];
              const colors = [COLORS.electric, COLORS.coral, COLORS.amber, COLORS.cyan, '#a855f7'];
              const units = ['', 'g', 'g', 'g', 'g'];
              
              return (
                <div key={label} className="text-center p-4 rounded-xl bg-white/5">
                  <p className="text-2xl font-bold font-mono" style={{ color: colors[i] }}>
                    {values[i].toLocaleString()}{units[i]}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BMI/BMR Calculator & Deficit Tracker */}
      <HealthCalculator 
        userId={userId}
        currentWeight={latestWeight}
        avgDailyCalories={avgCalories}
        avgDailyBurned={avgCaloriesBurned}
      />
    </div>
  );
}
