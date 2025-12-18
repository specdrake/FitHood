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
import { getFoodsByDateRange, getWorkoutsByDateRange, getAllWeights, getUserProfile, getDayCompletions, markDayComplete } from '@/lib/db';
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
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (userId) {
      loadData();
      setCurrentPage(1); // Reset to first page when date range changes
    }
  }, [userId, dateRange, isCustomRange, customStartDate, customEndDate, refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let startDate: string, endDate: string;
      
      if (isCustomRange && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const range = getDateRange(dateRange);
        startDate = range.startDate;
        endDate = range.endDate;
      }
      const [foods, workouts, weightData, profile, dayCompletions] = await Promise.all([
        getFoodsByDateRange(userId, startDate, endDate),
        getWorkoutsByDateRange(userId, startDate, endDate),
        getAllWeights(userId),
        getUserProfile(userId),
        getDayCompletions(userId, startDate, endDate),
      ]);

      const foodsByDate = groupByDate(foods);
      const workoutsByDate = groupByDate(workouts);
      const weightsByDate = new Map(weightData.map((w) => [w.date, w.weight]));
      const today = new Date().toISOString().split('T')[0];

      // Generate summaries for each day in range
      const summaryList: DailySummary[] = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayFoods = foodsByDate.get(dateStr) || [];
        const dayWorkouts = workoutsByDate.get(dateStr) || [];
        const dayWeight = weightsByDate.get(dateStr);

        // Auto-mark: past days with data are complete, today is not complete unless manually marked
        const hasCompletion = dayCompletions.has(dateStr);
        const isComplete = hasCompletion 
          ? dayCompletions.get(dateStr)! 
          : (dateStr < today && dayFoods.length > 0); // Auto-complete past days with food

        const summary = calculateDailySummary(dateStr, dayFoods, dayWorkouts, dayWeight);
        summary.isComplete = isComplete;
        summaryList.push(summary);
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

  const handleToggleDayComplete = async (date: string, isComplete: boolean) => {
    try {
      await markDayComplete(userId, date, isComplete);
      // Update local state
      setSummaries(prev => prev.map(s => 
        s.date === date ? { ...s, isComplete } : s
      ));
    } catch (error) {
      console.error('Failed to toggle day completion:', error);
    }
  };

  const totalCalories = summaries.reduce((sum, s) => sum + s.totalCalories, 0);
  const totalProtein = summaries.reduce((sum, s) => sum + s.totalProtein, 0);
  const totalCarbs = summaries.reduce((sum, s) => sum + s.totalCarbs, 0);
  const totalFat = summaries.reduce((sum, s) => sum + s.totalFat, 0);
  
  // Only count COMPLETE days for averages (excludes today and incomplete days)
  const completeDays = summaries.filter(s => s.isComplete);
  const completeCalories = completeDays.reduce((sum, s) => sum + s.totalCalories, 0);
  const completeProtein = completeDays.reduce((sum, s) => sum + s.totalProtein, 0);
  const daysWithCalories = completeDays.filter(s => s.totalCalories > 0).length;
  const daysWithProtein = completeDays.filter(s => s.totalProtein > 0).length;
  const avgCalories = daysWithCalories > 0 ? Math.round(completeCalories / daysWithCalories) : 0;
  const avgProtein = daysWithProtein > 0 ? Math.round(completeProtein / daysWithProtein) : 0;

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
  
  // Calculate TOTAL deficit by summing up each day's actual deficit
  // Formula: Daily Deficit = Calories In - (TDEE + Workout Burned)
  // ONLY count days with food logged (totalCalories > 0) to avoid massive negative deficits from empty days
  const daysWithData = summaries.filter(day => day.totalCalories > 0);
  const totalDeficit = daysWithData.reduce((total, day) => {
    const dayCaloriesIn = day.totalCalories;
    const dayWorkoutBurned = day.workoutEntries.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const dayExpenditure = dailyTdee + dayWorkoutBurned;
    const dayDeficit = dayCaloriesIn - dayExpenditure;
    return total + dayDeficit;
  }, 0);
  
  // For display in summary table (use actual logged days, not total range)
  const actualDaysInRange = summaries.length;
  const daysWithDataCount = daysWithData.length;
  const totalTdee = dailyTdee * daysWithDataCount; // Total TDEE only for logged days
  const totalExpenditure = totalTdee + totalCaloriesBurned; // Total expenditure
  const avgDailyDeficit = daysWithDataCount > 0 ? Math.round(totalDeficit / daysWithDataCount) : 0;

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
        <div className="flex flex-wrap gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => {
                setIsCustomRange(false);
                setDateRange(days);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange === days && !isCustomRange
                  ? 'bg-electric text-midnight'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {days}D
            </button>
          ))}
          <button
            onClick={() => setIsCustomRange(!isCustomRange)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isCustomRange
                ? 'bg-electric text-midnight'
                : 'glass hover:bg-white/10'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {isCustomRange && (
        <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-400">From:</label>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-midnight border border-white/10 text-white text-sm focus:border-electric focus:outline-none"
          />
          <label className="text-sm text-gray-400">To:</label>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-midnight border border-white/10 text-white text-sm focus:border-electric focus:outline-none"
          />
        </div>
      )}

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
            <span className="text-gray-400 text-sm">
              {daysWithDataCount}D Deficit
              {daysWithDataCount !== actualDaysInRange && (
                <span className="text-gray-600 text-xs ml-1">({actualDaysInRange}D total)</span>
              )}
            </span>
          </div>
          <p className={`text-3xl font-bold font-mono ${totalDeficit < 0 ? 'text-electric' : 'text-coral'}`}>
            {totalDeficit !== 0 ? Math.round(totalDeficit).toLocaleString() : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalDeficit !== 0 ? `${avgDailyDeficit.toLocaleString()}/day avg` : 'Set profile first'}
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

      {/* Daily Deficit Table */}
      {dailyTdee > 0 && summaries.length > 0 && (() => {
        // Filter to only show days with logged food (totalCalories > 0)
        const daysWithFood = summaries.filter(day => day.totalCalories > 0);
        
        // Don't show table if no days with food
        if (daysWithFood.length === 0) return null;
        
        // Pagination logic
        const totalPages = Math.ceil(daysWithFood.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedSummaries = daysWithFood.slice(startIndex, endIndex);
        
        return (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>📊</span> Daily Deficit Breakdown
              </h3>
              {daysWithFood.length > itemsPerPage && (
                <span className="text-sm text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, daysWithFood.length)} of {daysWithFood.length} days
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Date</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Calories In</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">TDEE</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Workout</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Total Out</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Deficit</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSummaries.map((day) => {
                    const dayBurned = day.workoutEntries.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
                    const dayOut = dailyTdee + dayBurned;
                    const dayDeficit = day.totalCalories - dayOut;
                    
                    return (
                      <tr key={day.date} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2">{formatDisplayDate(day.date)}</td>
                        <td className="text-right py-2 px-2 font-mono">
                          {day.totalCalories.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 font-mono text-amber-400">
                          {Math.round(dailyTdee).toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-2 font-mono text-coral">
                          {dayBurned > 0 ? dayBurned.toLocaleString() : '-'}
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          {Math.round(dayOut).toLocaleString()}
                        </td>
                        <td className={`text-right py-2 px-2 font-mono font-bold ${
                          dayDeficit < 0 ? 'text-electric' : dayDeficit > 0 ? 'text-coral' : 'text-gray-500'
                        }`}>
                          {Math.round(dayDeficit).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row (always visible) */}
                  <tr className="border-t-2 border-white/20 font-bold">
                    <td className="py-3 px-2">
                      Total ({daysWithDataCount}D logged)
                    </td>
                    <td className="text-right py-3 px-2 font-mono">{totalCalories.toLocaleString()}</td>
                    <td className="text-right py-3 px-2 font-mono text-amber-400">{Math.round(totalTdee).toLocaleString()}</td>
                    <td className="text-right py-3 px-2 font-mono text-coral">{totalCaloriesBurned.toLocaleString()}</td>
                    <td className="text-right py-3 px-2 font-mono">{Math.round(totalExpenditure).toLocaleString()}</td>
                    <td className={`text-right py-3 px-2 font-mono ${totalDeficit < 0 ? 'text-electric' : 'text-coral'}`}>
                      {Math.round(totalDeficit).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-electric text-midnight'
                              : 'glass hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        );
      })()}

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
