'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getAllWeights, addWeightEntry, deleteWeightEntry } from '@/lib/db';
import { WeightEntry } from '@/lib/types';
import { formatDisplayDate, formatDate } from '@/lib/utils';

interface WeightTrackerProps {
  refreshTrigger: number;
  onUpdate: () => void;
}

export default function WeightTracker({ refreshTrigger, onUpdate }: WeightTrackerProps) {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(formatDate(new Date()));
  const [newBodyFat, setNewBodyFat] = useState('');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allWeights = await getAllWeights();
      setWeights(allWeights.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Failed to load weight data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) return;

    const entry: WeightEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: newDate,
      weight,
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
    };

    await addWeightEntry(entry);
    setNewWeight('');
    setNewBodyFat('');
    setShowAddForm(false);
    loadData();
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this weight entry?')) {
      await deleteWeightEntry(id);
      loadData();
      onUpdate();
    }
  };

  const chartData = weights.map((w) => ({
    date: formatDisplayDate(w.date),
    fullDate: w.date,
    weight: w.weight,
    bodyFat: w.bodyFat,
  }));

  // Calculate stats
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const startWeight = weights.length > 0 ? weights[0].weight : null;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : null;
  const avgWeight = weights.length > 0
    ? Math.round((weights.reduce((sum, w) => sum + w.weight, 0) / weights.length) * 10) / 10
    : null;
  const minWeight = weights.length > 0 ? Math.min(...weights.map((w) => w.weight)) : null;
  const maxWeight = weights.length > 0 ? Math.max(...weights.map((w) => w.weight)) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-glow/30 border-t-amber-glow rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-4xl text-gradient">Weight Tracker</h2>
          <p className="text-gray-400">{weights.length} measurements logged</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-glow to-coral text-midnight font-semibold hover:glow-sm transition-all"
        >
          {showAddForm ? 'Cancel' : '+ Log Weight'}
        </button>
      </div>

      {/* Add Weight Form */}
      {showAddForm && (
        <form onSubmit={handleAddWeight} className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="font-semibold text-lg mb-4">📝 Log New Weight</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-amber-glow focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="70.5"
                className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-amber-glow focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Body Fat % (optional)</label>
              <input
                type="number"
                step="0.1"
                value={newBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
                placeholder="15.0"
                className="w-full px-4 py-3 rounded-xl bg-midnight border border-white/10 focus:border-amber-glow focus:outline-none transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-glow to-coral text-midnight font-semibold hover:glow-sm transition-all"
          >
            Save Weight
          </button>
        </form>
      )}

      {/* Stats Grid */}
      {weights.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-1">Current</p>
            <p className="text-3xl font-bold text-amber-glow font-mono">{currentWeight}kg</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-1">Change</p>
            <p className={`text-3xl font-bold font-mono ${
              weightChange && weightChange < 0 ? 'text-electric' : weightChange && weightChange > 0 ? 'text-coral' : 'text-gray-400'
            }`}>
              {weightChange ? (weightChange > 0 ? '+' : '') + weightChange.toFixed(1) : '—'}kg
            </p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-1">Average</p>
            <p className="text-3xl font-bold text-neon-cyan font-mono">{avgWeight}kg</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-1">Min</p>
            <p className="text-3xl font-bold text-electric font-mono">{minWeight}kg</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-1">Max</p>
            <p className="text-3xl font-bold text-coral font-mono">{maxWeight}kg</p>
          </div>
        </div>
      )}

      {weights.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">⚖️</p>
          <h3 className="text-xl font-semibold mb-2">No weight data yet</h3>
          <p className="text-gray-400">Click &quot;Log Weight&quot; to start tracking</p>
        </div>
      ) : (
        <>
          {/* Weight Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">📈 Weight Progress</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 15, 26, 0.95)',
                      border: '1px solid rgba(255, 201, 60, 0.3)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'weight' ? `${value} kg` : `${value}%`,
                      name === 'weight' ? 'Weight' : 'Body Fat'
                    ]}
                  />
                  {avgWeight && (
                    <ReferenceLine
                      y={avgWeight}
                      stroke="rgba(0, 212, 255, 0.5)"
                      strokeDasharray="5 5"
                      label={{ value: `Avg: ${avgWeight}kg`, position: 'right', fill: '#00d4ff', fontSize: 11 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#ffc93c"
                    strokeWidth={3}
                    dot={{ fill: '#ffc93c', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 8, fill: '#ffc93c' }}
                  />
                  {chartData.some((d) => d.bodyFat) && (
                    <Line
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="#a855f7"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {chartData.some((d) => d.bodyFat) && (
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-amber-glow rounded" />
                  <span className="text-xs text-gray-400">Weight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-purple-500 rounded" style={{ borderStyle: 'dashed' }} />
                  <span className="text-xs text-gray-400">Body Fat %</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight Log */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">📋 Weight Log</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...weights].reverse().map((weight) => (
                <div
                  key={weight.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <p className="font-medium">{formatDisplayDate(weight.date)}</p>
                      {weight.notes && (
                        <p className="text-xs text-gray-500">{weight.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-amber-glow font-mono">
                      {weight.weight} kg
                    </span>
                    {weight.bodyFat && (
                      <span className="text-sm text-purple-400 font-mono">
                        {weight.bodyFat}% BF
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(weight.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-coral transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

