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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { getAllWorkouts, deleteWorkoutEntry, addWorkoutEntries, updateWorkoutEntry } from '@/lib/db';
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

type FormState = {
  exercise: string;
  category: WorkoutEntry['category'];
  sets: string;
  reps: string;
  weight: string;
  duration: string;
  distance: string;
  caloriesBurned: string;
  notes: string;
};

const emptyForm: FormState = {
  exercise: '',
  category: 'strength',
  sets: '',
  reps: '',
  weight: '',
  duration: '',
  distance: '',
  caloriesBurned: '',
  notes: '',
};

export default function WorkoutTracker({ userId, refreshTrigger }: WorkoutTrackerProps) {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'exercises' | 'all'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

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

  const handleEdit = (workout: WorkoutEntry) => {
    setEditingId(workout.id);
    setFormData({
      exercise: workout.exercise,
      category: workout.category,
      sets: workout.sets ? String(workout.sets) : '',
      reps: workout.reps ? String(workout.reps) : '',
      weight: workout.weight ? String(workout.weight) : '',
      duration: workout.duration ? String(workout.duration) : '',
      distance: workout.distance ? String(workout.distance) : '',
      caloriesBurned: workout.caloriesBurned ? String(workout.caloriesBurned) : '',
      notes: workout.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const workoutData = {
      date: selectedDate,
      exercise: formData.exercise,
      category: formData.category,
      sets: formData.sets ? parseInt(formData.sets) : undefined,
      reps: formData.reps ? parseInt(formData.reps) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      distance: formData.distance ? parseFloat(formData.distance) : undefined,
      caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
      notes: formData.notes || undefined,
    };

    if (editingId) {
      await updateWorkoutEntry(editingId, workoutData);
    } else {
      const entry: WorkoutEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...workoutData,
      timestamp: new Date().toISOString(),
    };
    await addWorkoutEntries(userId, [entry]);
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
    loadData();
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const navigateDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(formatDate(current));
  };

  const workoutsByDate = groupByDate(workouts);
  const dates = Array.from(workoutsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const selectedWorkouts = workoutsByDate.get(selectedDate) || [];

  // Normalize exercise name by removing details in parentheses
  // "Walking (8km)" → "Walking"
  // "Stretching (15 mins)" → "Stretching"
  const normalizeExerciseName = (name: string): string => {
    return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  };

  // Calculate exercise stats - only count non-zero values for averages
  const exerciseStats = new Map<string, { 
    count: number; 
    totalSets: number; 
    setsCount: number;
    maxWeight: number; 
    totalDistance: number;
    distanceCount: number;
    category: string 
  }>();
  
  workouts.forEach((w) => {
    const normalizedName = normalizeExerciseName(w.exercise);
    const existing = exerciseStats.get(normalizedName) || { 
      count: 0, 
      totalSets: 0, 
      setsCount: 0,
      maxWeight: 0, 
      totalDistance: 0,
      distanceCount: 0,
      category: w.category 
    };
    existing.count += 1;
    if (w.sets && w.sets > 0) {
      existing.totalSets += w.sets;
      existing.setsCount += 1;
    }
    if (w.weight && w.weight > 0) {
      existing.maxWeight = Math.max(existing.maxWeight, w.weight);
    }
    if (w.distance && w.distance > 0) {
      existing.totalDistance += w.distance;
      existing.distanceCount += 1;
    }
    exerciseStats.set(normalizedName, existing);
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
      distance: dayWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
    };
  }).reverse();

  // Category breakdown - only count non-zero values
  const categoryBreakdown = ['strength', 'cardio', 'flexibility', 'other'].map((cat) => {
    const catWorkouts = workouts.filter((w) => w.category === cat);
    const withCalories = catWorkouts.filter(w => w.caloriesBurned && w.caloriesBurned > 0);
    const withDistance = catWorkouts.filter(w => w.distance && w.distance > 0);
    return {
    category: cat,
      count: catWorkouts.length,
      totalCalories: catWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      avgCalories: withCalories.length > 0 
        ? Math.round(withCalories.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / withCalories.length)
        : 0,
      totalDistance: catWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      avgDistance: withDistance.length > 0
        ? (withDistance.reduce((sum, w) => sum + (w.distance || 0), 0) / withDistance.length).toFixed(1)
        : 0,
    color: CATEGORY_COLORS[cat],
    icon: CATEGORY_ICONS[cat],
    };
  });

  // Daily stats
  const dayCaloriesBurned = selectedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const dayTotalSets = selectedWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0);
  const dayTotalDistance = selectedWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);

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
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                {cat.totalCalories > 0 && (
                    <p>🔥 {cat.totalCalories} cal total</p>
                  )}
                  {cat.totalDistance > 0 && (
                    <p>📍 {cat.totalDistance.toFixed(1)} km total</p>
                )}
                </div>
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

          {/* Add/Edit Workout Form */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>🏋️</span> {formatDisplayDate(selectedDate)}
                </h3>
                <div className="text-sm text-gray-400 mt-1 space-x-4">
                  {dayCaloriesBurned > 0 && <span>🔥 {dayCaloriesBurned} cal</span>}
                  {dayTotalSets > 0 && <span>💪 {dayTotalSets} sets</span>}
                  {dayTotalDistance > 0 && <span>📍 {dayTotalDistance.toFixed(1)} km</span>}
                </div>
              </div>
              {!showForm && (
              <button
                  onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-electric text-midnight font-semibold hover:glow-sm transition-all text-sm"
              >
                  + Add Workout
              </button>
              )}
            </div>

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl bg-white/5 animate-slide-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Exercise</label>
                    <input
                      type="text"
                      value={formData.exercise}
                      onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                      placeholder="e.g., Bench Press, Walking"
                      className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as WorkoutEntry['category'] })}
                      className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  >
                    <option value="strength">🏋️ Strength</option>
                    <option value="cardio">🏃 Cardio</option>
                    <option value="flexibility">🧘 Flexibility</option>
                    <option value="other">⚡ Other</option>
                  </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sets</label>
                  <input
                    type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                      placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reps</label>
                  <input
                    type="number"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                      step="0.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                  <input
                    type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-purple-400 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">🔥 Calories</label>
                  <input
                    type="number"
                      value={formData.caloriesBurned}
                      onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                      placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                  />
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes (optional)"
                    className="flex-1 px-3 py-2 rounded-lg bg-midnight border border-white/10 focus:border-neon-cyan focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-white/5 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-neon-cyan text-midnight font-semibold hover:bg-neon-cyan/80 transition-all text-sm"
                  >
                    {editingId ? 'Update' : 'Add'}
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
                        <div className="flex gap-2 items-center flex-wrap">
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
                    <div className="flex items-center gap-3 text-sm font-mono flex-wrap justify-end">
                      {workout.sets && workout.sets > 0 && (
                        <span className="text-electric">{workout.sets} sets</span>
                      )}
                      {workout.reps && workout.reps > 0 && (
                        <span className="text-amber-glow">{workout.reps} reps</span>
                      )}
                      {workout.weight && workout.weight > 0 && (
                        <span className="text-neon-cyan">{workout.weight} kg</span>
                      )}
                      {workout.duration && workout.duration > 0 && (
                        <span className="text-purple-400">{workout.duration} min</span>
                      )}
                      {workout.distance && workout.distance > 0 && (
                        <span className="text-pink-400">📍 {workout.distance} km</span>
                      )}
                      {workout.caloriesBurned && workout.caloriesBurned > 0 && (
                        <span className="text-coral">🔥 {workout.caloriesBurned}</span>
                      )}
                      <button
                        onClick={() => handleEdit(workout)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-electric transition-all ml-2"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-coral transition-all"
                        title="Delete"
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

          {/* Daily Charts */}
          {dailyWorkouts.length > 0 && (
            <>
              {/* Workout Frequency by Category */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">💪 Workout Frequency (Last 14 Days)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyWorkouts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                    <Bar
                      dataKey="strength"
                        name="Strength"
                      stackId="a"
                      fill={CATEGORY_COLORS.strength}
                      radius={[0, 0, 0, 0]}
                      onClick={(data) => setSelectedDate(data.fullDate)}
                      cursor="pointer"
                    />
                    <Bar
                      dataKey="cardio"
                        name="Cardio"
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

              {/* Calories Burned Trend */}
              {dailyWorkouts.some(d => d.calories > 0) && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-lg mb-4">🔥 Calories Burned Trend</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyWorkouts}>
                        <defs>
                          <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          {...tooltipStyle}
                          formatter={(value: number) => [`${value} cal`, 'Calories Burned']}
                        />
                        <Area
                          type="monotone"
                          dataKey="calories"
                          stroke="#ff6b6b"
                          fill="url(#caloriesGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Distance Walked/Run Trend */}
              {dailyWorkouts.some(d => d.distance > 0) && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-lg mb-4">📍 Distance Trend (km)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyWorkouts}>
                        <defs>
                          <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          {...tooltipStyle}
                          formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
                        />
                        <Area
                          type="monotone"
                          dataKey="distance"
                          stroke="#00d4ff"
                          fill="url(#distanceGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
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
                      {stats.setsCount > 0 && (
                      <div>
                          <p className="text-xl font-bold text-coral font-mono">
                            {Math.round(stats.totalSets / stats.setsCount)}
                          </p>
                          <p className="text-xs text-gray-500">avg sets</p>
                      </div>
                      )}
                      {stats.maxWeight > 0 && (
                        <div>
                          <p className="text-xl font-bold text-amber-glow font-mono">{stats.maxWeight}</p>
                          <p className="text-xs text-gray-500">max kg</p>
                        </div>
                      )}
                      {stats.distanceCount > 0 && (
                        <div>
                          <p className="text-xl font-bold text-pink-400 font-mono">
                            {(stats.totalDistance / stats.distanceCount).toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">avg km</p>
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
                    <th className="text-right py-3 px-2">Distance</th>
                    <th className="text-right py-3 px-2">🔥 Cal</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.slice(0, 100).map((workout) => (
                    <tr key={workout.id} className="border-b border-white/5 hover:bg-white/5 group">
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
                      <td className="py-3 px-2 text-right font-mono text-pink-400">
                        {workout.distance ? `${workout.distance}km` : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-coral">
                        {workout.caloriesBurned || '-'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleEdit(workout)}
                          className="text-gray-500 hover:text-electric transition-all mr-2 opacity-0 group-hover:opacity-100"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="text-gray-500 hover:text-coral transition-all opacity-0 group-hover:opacity-100"
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
