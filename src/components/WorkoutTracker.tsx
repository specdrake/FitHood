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
import { getAllWorkouts, deleteWorkoutEntry, addWorkoutEntries } from '@/lib/db';
import { WorkoutEntry } from '@/lib/types';
import { formatDisplayDate, formatDate, groupByDate } from '@/lib/utils';

interface WorkoutTrackerProps {
  userId: string;
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

export default function WorkoutTracker({ userId, refreshTrigger }: WorkoutTrackerProps) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'exercises' | 'all'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newWorkout, setNewWorkout] = useState({
    exercise: '',
    category: 'strength' as WorkoutEntry['category'],
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    caloriesBurned: '',
    notes: '',
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allWorkouts = await getAllWorkouts(userId);
      const sorted = allWorkouts.sort((a, b) => b.date.localeCompare(a.date));
      setWorkouts(sorted);
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

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: WorkoutEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: selectedDate,
      exercise: newWorkout.exercise,
      category: newWorkout.category,
      sets: newWorkout.sets ? parseInt(newWorkout.sets) : undefined,
      reps: newWorkout.reps ? parseInt(newWorkout.reps) : undefined,
      weight: newWorkout.weight ? parseFloat(newWorkout.weight) : undefined,
      duration: newWorkout.duration ? parseInt(newWorkout.duration) : undefined,
      caloriesBurned: newWorkout.caloriesBurned ? parseInt(newWorkout.caloriesBurned) : undefined,
      notes: newWorkout.notes || undefined,
      timestamp: new Date().toISOString(),
    };

    await addWorkoutEntries(userId, [entry]);
    setNewWorkout({
      exercise: '',
      category: 'strength',
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      caloriesBurned: '',
      notes: '',
    });
    setShowAddForm(false);
    loadData();
  };

  const navigateDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(formatDate(current));
  };

  const workoutsByDate = groupByDate(workouts);
  const dates = Array.from(workoutsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const selectedWorkouts = workoutsByDate.get(selectedDate) || [];

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
      calories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    };
  }).reverse();

  // Category breakdown
  const categoryBreakdown = ['strength', 'cardio', 'flexibility', 'other'].map((cat) => ({
    category: cat,
    count: workouts.filter((w) => w.category === cat).length,
    totalCalories: workouts.filter((w) => w.category === cat).reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    color: CATEGORY_COLORS[cat],
    icon: CATEGORY_ICONS[cat],
  }));

  // Daily stats
  const dayCaloriesBurned = selectedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const dayTotalSets = selectedWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0);

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

      {viewMode === 'daily' && (
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
                {cat.totalCalories > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔥 {cat.totalCalories} cal burned
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all text-xl"
              >
                ←
              </button>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-center text-lg font-semibold focus:outline-none cursor-pointer"
                />
                <span className="text-gray-400">({formatDisplayDate(selectedDate)})</span>
              </div>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all text-xl"
              >
                →
              </button>
            </div>
          </div>

          {/* Add Workout & List */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>🏋️</span> {formatDisplayDate(selectedDate)}
                </h3>
                {dayCaloriesBurned > 0 && (
                  <p className="text-sm text-coral">
                    🔥 {dayCaloriesBurned} calories burned • {dayTotalSets} total sets
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-electric text-midnight font-semibold hover:glow-sm transition-all text-sm"
              >
                {showAddForm ? 'Cancel' : '+ Add Workout'}
              </button>
            </div>

            {/* Add Workout Form */}
            {showAddForm && (
              <form onSubmit={handleAddWorkout} className="mb-6 p-4 rounded-xl bg-white/5 animate-slide-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={newWorkout.exercise}
                      onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
                      placeholder="Exercise name"
                      className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <select
                    value={newWorkout.category}
                    onChange={(e) => setNewWorkout({ ...newWorkout, category: e.target.value as WorkoutEntry['category'] })}
                    className="px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  >
                    <option value="strength">🏋️ Strength</option>
                    <option value="cardio">🏃 Cardio</option>
                    <option value="flexibility">🧘 Flexibility</option>
                    <option value="other">⚡ Other</option>
                  </select>
                  <input
                    type="number"
                    value={newWorkout.sets}
                    onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })}
                    placeholder="Sets"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={newWorkout.reps}
                    onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                    placeholder="Reps"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={newWorkout.weight}
                    onChange={(e) => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                    placeholder="Weight (kg)"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    placeholder="Duration (min)"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={newWorkout.caloriesBurned}
                    onChange={(e) => setNewWorkout({ ...newWorkout, caloriesBurned: e.target.value })}
                    placeholder="🔥 Calories burned"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    placeholder="Notes (optional)"
                    className="flex-1 px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-neon-cyan text-midnight font-semibold hover:bg-neon-cyan/80 transition-all text-sm"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Workout List */}
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
                        <div className="flex gap-2 items-center">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ 
                              background: `${CATEGORY_COLORS[workout.category]}20`,
                              color: CATEGORY_COLORS[workout.category],
                            }}
                          >
                            {workout.category}
                          </span>
                          {workout.notes && (
                            <span className="text-xs text-gray-500">{workout.notes}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      {workout.sets && (
                        <span className="text-electric">{workout.sets} sets</span>
                      )}
                      {workout.reps && (
                        <span className="text-amber-glow">{workout.reps} reps</span>
                      )}
                      {workout.weight && (
                        <span className="text-neon-cyan">{workout.weight} kg</span>
                      )}
                      {workout.duration && (
                        <span className="text-purple-400">{workout.duration} min</span>
                      )}
                      {workout.caloriesBurned && (
                        <span className="text-coral">🔥 {workout.caloriesBurned}</span>
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">💪</p>
                <p>No workouts for this date</p>
                <p className="text-sm">Click &quot;+ Add Workout&quot; to log something</p>
              </div>
            )}
          </div>

          {/* Daily Chart */}
          {dailyWorkouts.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">📊 Workout Frequency & Calories Burned</h3>
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
          )}
        </>
      )}

      {viewMode === 'exercises' && (
        /* Exercise Stats View */
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">🏆 Exercise Statistics</h3>
          {exerciseStats.size > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">💪</p>
              <p>No workout data yet</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'all' && (
        /* All Workouts View */
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">📜 All Workout Entries</h3>
          {workouts.length > 0 ? (
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
                    <th className="text-right py-3 px-2">🔥 Cal</th>
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
                      <td className="py-3 px-2 text-right font-mono text-coral">
                        {workout.caloriesBurned || '-'}
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">💪</p>
              <p>No workout data yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
