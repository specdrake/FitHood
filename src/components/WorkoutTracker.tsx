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
} from 'recharts';
import { getAllWorkouts, deleteWorkoutEntry } from '@/lib/db';
import { WorkoutEntry } from '@/lib/types';
import { formatDisplayDate, groupByDate } from '@/lib/utils';

interface WorkoutTrackerProps {
  refreshTrigger: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  strength: '#00ff88',
  cardio: '#ff6b6b',
  flexibility: '#ffc93c',
  other: '#00d4ff',
};

const CATEGORY_ICONS: Record<string, string> = {
  strength: '🏋️',
  cardio: '🏃',
  flexibility: '🧘',
  other: '⚡',
};

export default function WorkoutTracker({ refreshTrigger }: WorkoutTrackerProps) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'exercises' | 'all'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allWorkouts = await getAllWorkouts();
      const sorted = allWorkouts.sort((a, b) => b.date.localeCompare(a.date));
      setWorkouts(sorted);
      
      if (sorted.length > 0 && !selectedDate) {
        setSelectedDate(sorted[0].date);
      }
    } catch (error) {
      console.error('Failed to load workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this workout entry?')) {
      await deleteWorkoutEntry(id);
      loadData();
    }
  };

  const workoutsByDate = groupByDate(workouts);
  const dates = Array.from(workoutsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const selectedWorkouts = selectedDate ? workoutsByDate.get(selectedDate) || [] : [];

  // Calculate exercise stats
  const exerciseStats = new Map<string, { count: number; totalSets: number; maxWeight: number; category: string }>();
  workouts.forEach((w) => {
    const existing = exerciseStats.get(w.exercise) || { count: 0, totalSets: 0, maxWeight: 0, category: w.category };
    existing.count += 1;
    existing.totalSets += w.sets || 0;
    existing.maxWeight = Math.max(existing.maxWeight, w.weight || 0);
    exerciseStats.set(w.exercise, existing);
  });

  // Daily workout count for chart
  const dailyWorkouts = dates.slice(0, 14).map((date) => {
    const dayWorkouts = workoutsByDate.get(date) || [];
    return {
      date: formatDisplayDate(date),
      fullDate: date,
      count: dayWorkouts.length,
      strength: dayWorkouts.filter((w) => w.category === 'strength').length,
      cardio: dayWorkouts.filter((w) => w.category === 'cardio').length,
    };
  }).reverse();

  // Category breakdown
  const categoryBreakdown = ['strength', 'cardio', 'flexibility', 'other'].map((cat) => ({
    category: cat,
    count: workouts.filter((w) => w.category === cat).length,
    color: CATEGORY_COLORS[cat],
    icon: CATEGORY_ICONS[cat],
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl text-gradient">Workouts</h2>
          <p className="text-gray-400">{workouts.length} exercises logged</p>
        </div>
        <div className="flex gap-2">
          {(['daily', 'exercises', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                viewMode === mode
                  ? 'bg-neon-cyan text-midnight'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">💪</p>
          <h3 className="text-xl font-semibold mb-2">No workout data yet</h3>
          <p className="text-gray-400">Upload a workout CSV to start tracking</p>
        </div>
      ) : viewMode === 'daily' ? (
        <>
          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-gray-400 text-sm capitalize">{cat.category}</span>
                </div>
                <p className="text-3xl font-bold font-mono" style={{ color: cat.color }}>
                  {cat.count}
                </p>
              </div>
            ))}
          </div>

          {/* Daily Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">📊 Workout Frequency (Last 14 Days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyWorkouts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 15, 26, 0.95)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="strength"
                    stackId="a"
                    fill={CATEGORY_COLORS.strength}
                    radius={[0, 0, 0, 0]}
                    onClick={(data) => setSelectedDate(data.fullDate)}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="cardio"
                    stackId="a"
                    fill={CATEGORY_COLORS.cardio}
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
                  const dayWorkouts = workoutsByDate.get(date) || [];
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDate === date
                          ? 'bg-neon-cyan/20 border border-neon-cyan/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatDisplayDate(date)}</span>
                        <div className="flex gap-1">
                          {dayWorkouts.some((w) => w.category === 'strength') && (
                            <span>🏋️</span>
                          )}
                          {dayWorkouts.some((w) => w.category === 'cardio') && (
                            <span>🏃</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{dayWorkouts.length} exercises</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Details */}
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">
                🏋️ {selectedDate ? formatDisplayDate(selectedDate) : 'Select a date'}
              </h3>
              {selectedWorkouts.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CATEGORY_ICONS[workout.category]}</span>
                        <div>
                          <p className="font-medium">{workout.exercise}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ 
                              background: `${CATEGORY_COLORS[workout.category]}20`,
                              color: CATEGORY_COLORS[workout.category],
                            }}
                          >
                            {workout.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-mono">
                        {workout.sets && (
                          <span className="text-electric">{workout.sets} sets</span>
                        )}
                        {workout.reps && (
                          <span className="text-coral">{workout.reps} reps</span>
                        )}
                        {workout.weight && (
                          <span className="text-amber-glow">{workout.weight} kg</span>
                        )}
                        {workout.duration && (
                          <span className="text-neon-cyan">{workout.duration} min</span>
                        )}
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-coral transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No workouts for this date</p>
              )}
            </div>
          </div>
        </>
      ) : viewMode === 'exercises' ? (
        /* Exercise Stats View */
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">🏆 Exercise Statistics</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(exerciseStats.entries())
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 12)
              .map(([exercise, stats]) => (
                <div
                  key={exercise}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{CATEGORY_ICONS[stats.category]}</span>
                    <h4 className="font-medium truncate">{exercise}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold text-electric font-mono">{stats.count}</p>
                      <p className="text-xs text-gray-500">times</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-coral font-mono">{stats.totalSets}</p>
                      <p className="text-xs text-gray-500">total sets</p>
                    </div>
                    {stats.maxWeight > 0 && (
                      <div>
                        <p className="text-xl font-bold text-amber-glow font-mono">{stats.maxWeight}</p>
                        <p className="text-xs text-gray-500">max kg</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* All Workouts View */
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">📜 All Workout Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Exercise</th>
                  <th className="text-left py-3 px-2">Category</th>
                  <th className="text-right py-3 px-2">Sets</th>
                  <th className="text-right py-3 px-2">Reps</th>
                  <th className="text-right py-3 px-2">Weight</th>
                  <th className="text-right py-3 px-2">Duration</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {workouts.slice(0, 100).map((workout) => (
                  <tr key={workout.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 text-gray-400">{formatDisplayDate(workout.date)}</td>
                    <td className="py-3 px-2 font-medium">{workout.exercise}</td>
                    <td className="py-3 px-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{ 
                          background: `${CATEGORY_COLORS[workout.category]}20`,
                          color: CATEGORY_COLORS[workout.category],
                        }}
                      >
                        {workout.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono">{workout.sets || '-'}</td>
                    <td className="py-3 px-2 text-right font-mono">{workout.reps || '-'}</td>
                    <td className="py-3 px-2 text-right font-mono">
                      {workout.weight ? `${workout.weight}kg` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {workout.duration ? `${workout.duration}m` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="text-gray-500 hover:text-coral transition-all"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {workouts.length > 100 && (
              <p className="text-center text-gray-500 text-sm py-4">
                Showing 100 of {workouts.length} entries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

