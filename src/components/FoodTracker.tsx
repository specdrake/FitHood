'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAllFoods, deleteFoodEntry } from '@/lib/db';
import { FoodEntry, FoodContribution } from '@/lib/types';
import { formatDisplayDate, groupByDate, calculateFoodContributions } from '@/lib/utils';

interface FoodTrackerProps {
  refreshTrigger: number;
}

const COLORS = ['#00ff88', '#ff6b6b', '#ffc93c', '#00d4ff', '#a855f7', '#f472b6', '#fb923c', '#34d399'];

export default function FoodTracker({ refreshTrigger }: FoodTrackerProps) {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [contributions, setContributions] = useState<FoodContribution[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'all' | 'analysis'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allFoods = await getAllFoods();
      const sorted = allFoods.sort((a, b) => b.date.localeCompare(a.date));
      setFoods(sorted);
      setContributions(calculateFoodContributions(allFoods));
      
      if (sorted.length > 0 && !selectedDate) {
        setSelectedDate(sorted[0].date);
      }
    } catch (error) {
      console.error('Failed to load food data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this food entry?')) {
      await deleteFoodEntry(id);
      loadData();
    }
  };

  const foodsByDate = groupByDate(foods);
  const dates = Array.from(foodsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const selectedFoods = selectedDate ? foodsByDate.get(selectedDate) || [] : [];

  const dailyTotals = dates.map((date) => {
    const dayFoods = foodsByDate.get(date) || [];
    return {
      date: formatDisplayDate(date),
      fullDate: date,
      calories: dayFoods.reduce((sum, f) => sum + f.calories, 0),
      protein: dayFoods.reduce((sum, f) => sum + f.protein, 0),
    };
  }).slice(0, 14).reverse();

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
          <h2 className="font-display text-4xl text-gradient">Food Tracker</h2>
          <p className="text-gray-400">{foods.length} entries logged</p>
        </div>
        <div className="flex gap-2">
          {(['daily', 'analysis', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                viewMode === mode
                  ? 'bg-coral text-midnight'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {foods.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🍎</p>
          <h3 className="text-xl font-semibold mb-2">No food data yet</h3>
          <p className="text-gray-400">Upload a food CSV to start tracking</p>
        </div>
      ) : viewMode === 'daily' ? (
        <>
          {/* Daily Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">📊 Daily Calories (Last 14 Days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTotals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 15, 26, 0.95)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="calories"
                    fill="#ff6b6b"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => setSelectedDate(data.fullDate)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Date Selector & Details */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Date List */}
            <div className="glass rounded-2xl p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-3 sticky top-0 bg-obsidian/90 py-2">📅 Select Date</h3>
              <div className="space-y-2">
                {dates.slice(0, 30).map((date) => {
                  const dayFoods = foodsByDate.get(date) || [];
                  const totalCals = dayFoods.reduce((s, f) => s + f.calories, 0);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDate === date
                          ? 'bg-coral/20 border border-coral/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatDisplayDate(date)}</span>
                        <span className="text-coral font-mono">{totalCals} cal</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{dayFoods.length} items</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Details */}
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">
                🍽️ {selectedDate ? formatDisplayDate(selectedDate) : 'Select a date'}
              </h3>
              {selectedFoods.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        {food.mealType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-coral/20 text-coral capitalize">
                            {food.mealType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm font-mono">
                        <span className="text-electric">{food.calories} cal</span>
                        <span className="text-coral">{food.protein}g P</span>
                        <span className="text-amber-glow">{food.carbs}g C</span>
                        <span className="text-neon-cyan">{food.fat}g F</span>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-coral transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Day Total */}
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Day Total</span>
                      <div className="flex gap-4 font-mono">
                        <span className="text-electric">
                          {selectedFoods.reduce((s, f) => s + f.calories, 0)} cal
                        </span>
                        <span className="text-coral">
                          {selectedFoods.reduce((s, f) => s + f.protein, 0)}g P
                        </span>
                        <span className="text-amber-glow">
                          {selectedFoods.reduce((s, f) => s + f.carbs, 0)}g C
                        </span>
                        <span className="text-neon-cyan">
                          {selectedFoods.reduce((s, f) => s + f.fat, 0)}g F
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No food entries for this date</p>
              )}
            </div>
          </div>
        </>
      ) : viewMode === 'analysis' ? (
        <>
          {/* Food Contribution Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Foods Chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">🏆 Top Calorie Sources</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contributions.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="totalCalories"
                      nameKey="name"
                    >
                      {contributions.slice(0, 8).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 15, 26, 0.95)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} cal`, 'Calories']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {contributions.slice(0, 8).map((food, i) => (
                  <div key={food.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-gray-400 truncate max-w-20">{food.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Rankings */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">📋 Food Breakdown</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {contributions.slice(0, 15).map((food, i) => (
                  <div key={food.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{food.name}</span>
                        <span className="text-sm text-electric font-mono ml-2">
                          {food.percentOfTotal.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 mt-1">
                        <span>{food.count}x eaten</span>
                        <span>{food.avgCalories} cal avg</span>
                        <span>{food.avgProtein}g protein avg</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${food.percentOfTotal}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* All Foods View */
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">📜 All Food Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Food</th>
                  <th className="text-right py-3 px-2">Calories</th>
                  <th className="text-right py-3 px-2">Protein</th>
                  <th className="text-right py-3 px-2">Carbs</th>
                  <th className="text-right py-3 px-2">Fat</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {foods.slice(0, 100).map((food) => (
                  <tr key={food.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 text-gray-400">{formatDisplayDate(food.date)}</td>
                    <td className="py-3 px-2 font-medium">{food.name}</td>
                    <td className="py-3 px-2 text-right text-electric font-mono">{food.calories}</td>
                    <td className="py-3 px-2 text-right text-coral font-mono">{food.protein}g</td>
                    <td className="py-3 px-2 text-right text-amber-glow font-mono">{food.carbs}g</td>
                    <td className="py-3 px-2 text-right text-neon-cyan font-mono">{food.fat}g</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="text-gray-500 hover:text-coral transition-all"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {foods.length > 100 && (
              <p className="text-center text-gray-500 text-sm py-4">
                Showing 100 of {foods.length} entries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

