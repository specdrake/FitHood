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
  ComposedChart,
  Line,
  LineChart,
  Legend,
} from 'recharts';
import { getAllFoods, deleteFoodEntry, addFoodEntries, updateFoodEntry, markDayComplete, getDayCompletions } from '@/lib/db';
import { FoodEntry, FoodContribution } from '@/lib/types';
import { formatDisplayDate, formatDate, groupByDate, calculateFoodContributions } from '@/lib/utils';
import { searchFoods, FoodItem, getAllCategories, getFoodsByCategory } from '@/lib/food-database';

interface FoodTrackerProps {
  userId: string;
  refreshTrigger: number;
}

const COLORS = ['#00ff88', '#ff6b6b', '#ffc93c', '#00d4ff', '#a855f7', '#f472b6', '#fb923c', '#34d399'];

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
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  count: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

const emptyForm: FormState = {
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
  count: '1',
  mealType: 'snack',
};

// Get date string for N days ago
const getDateNDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export default function FoodTracker({ userId, refreshTrigger }: FoodTrackerProps) {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [contributions, setContributions] = useState<FoodContribution[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'analysis'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodItem[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<FoodItem[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [searchSource, setSearchSource] = useState<'local' | 'online'>('local');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDayComplete, setIsDayComplete] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Analysis date range
  const [analysisRange, setAnalysisRange] = useState<'7' | '14' | '30' | 'all' | 'custom'>('30');
  const [customStartDate, setCustomStartDate] = useState<string>(getDateNDaysAgo(30));
  const [customEndDate, setCustomEndDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    if (userId) {
      loadData();
      loadDayCompletion();
    }
  }, [userId, refreshTrigger, selectedDate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allFoods = await getAllFoods(userId);
      const sorted = allFoods.sort((a, b) => b.date.localeCompare(a.date));
      setFoods(sorted);
      setContributions(calculateFoodContributions(allFoods));
    } catch (error) {
      console.error('Failed to load food data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDayCompletion = async () => {
    try {
      const today = formatDate(new Date());
      const completions = await getDayCompletions(userId, selectedDate, selectedDate);
      const hasCompletion = completions.has(selectedDate);
      
      // Auto-mark: past days are complete, today is not complete unless manually marked
      if (hasCompletion) {
        setIsDayComplete(completions.get(selectedDate)!);
      } else {
        setIsDayComplete(selectedDate < today);
      }
    } catch (error) {
      console.error('Failed to load day completion:', error);
    }
  };

  const handleToggleDayComplete = async (isComplete: boolean) => {
    try {
      await markDayComplete(userId, selectedDate, isComplete);
      setIsDayComplete(isComplete);
    } catch (error) {
      console.error('Failed to toggle day completion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this food entry?')) {
      await deleteFoodEntry(id);
      loadData();
      setOpenMenuId(null);
    }
  };

  const handleDeleteAllDay = async () => {
    if (confirm(`Delete all ${selectedFoods.length} food entries for ${formatDisplayDate(selectedDate)}?`) &&
        confirm(`⚠️ This action cannot be undone. Are you absolutely sure you want to delete all ${selectedFoods.length} entries?`)) {
      for (const food of selectedFoods) {
        await deleteFoodEntry(food.id);
      }
      loadData();
    }
  };

  const handleEdit = (food: FoodEntry) => {
    setOpenMenuId(null);
    setEditingId(food.id);
    setFormData({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber || ''),
      sugar: String(food.sugar || ''),
      count: String(food.count || 1),
      mealType: food.mealType || 'snack',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const foodData = {
      date: selectedDate,
      name: formData.name,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
      fiber: parseFloat(formData.fiber) || undefined,
      sugar: parseFloat(formData.sugar) || undefined,
      count: parseFloat(formData.count) || 1, // Allow fractional servings
      mealType: formData.mealType,
    };

    if (editingId) {
      await updateFoodEntry(editingId, foodData);
    } else {
      const entry: FoodEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...foodData,
        timestamp: new Date().toISOString(),
      };
      await addFoodEntries(userId, [entry]);
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
    setFoodSuggestions([]);
    setApiSuggestions([]);
  };

  const handleFoodNameChange = async (value: string) => {
    setFormData({ ...formData, name: value });
    
    if (value.length >= 2) {
      // Search user's previously added foods
      const lowerQuery = value.toLowerCase();
      const userFoodMatches = foods
        .filter(f => f.name.toLowerCase().includes(lowerQuery))
        .reduce((acc, food) => {
          // Create unique entries based on name+calories combo
          const key = `${food.name}-${food.calories}`;
          if (!acc.has(key)) {
            acc.set(key, {
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              fiber: food.fiber,
              sugar: food.sugar,
              category: 'cooked' as const,
              servingSize: undefined,
            });
          }
          return acc;
        }, new Map<string, FoodItem>());

      const userFoods = Array.from(userFoodMatches.values()).slice(0, 5);
      
      // Search local NIN database
      const ninFoods = searchFoods(value);
      
      // Combine: user foods first, then NIN foods (remove duplicates)
      const combined = [...userFoods];
      ninFoods.forEach(ninFood => {
        if (!combined.some(uf => uf.name === ninFood.name)) {
          combined.push(ninFood);
        }
      });
      
      setFoodSuggestions(combined.slice(0, 15));
      
      // Also search online if enabled
      if (searchSource === 'online') {
        setIsSearchingApi(true);
        try {
          const response = await fetch(`/api/food-search?q=${encodeURIComponent(value)}`);
          const data = await response.json();
          if (data.foods) {
            setApiSuggestions(data.foods.map((f: { name: string; calories: number; protein: number; carbs: number; fat: number; serving?: string }) => ({
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              fiber: undefined, // FatSecret API doesn't provide fiber/sugar
              sugar: undefined, // FatSecret API doesn't provide fiber/sugar
              category: 'cooked' as const,
              servingSize: f.serving,
            })));
          }
        } catch (error) {
          console.error('API search error:', error);
          setApiSuggestions([]);
        } finally {
          setIsSearchingApi(false);
        }
      }
    } else {
      setFoodSuggestions([]);
      setApiSuggestions([]);
    }
  };

  const selectFoodSuggestion = (food: FoodItem) => {
    setFormData({
      ...formData,
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber || ''),
      sugar: String(food.sugar || ''),
    });
    setFoodSuggestions([]);
    setApiSuggestions([]);
  };

  const quickAddFood = (food: FoodItem) => {
    setFormData({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
      fiber: String(food.fiber || ''),
      sugar: String(food.sugar || ''),
      count: '1',
      mealType: 'snack',
    });
    setShowForm(true);
    setShowQuickAdd(false);
  };

  const navigateDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(formatDate(current));
  };

  // Helper to calculate totals with count (rounded to 2 decimal places)
  const getTotalCalories = (food: FoodEntry) => Math.round(food.calories * (food.count || 1));
  const getTotalProtein = (food: FoodEntry) => Math.round(food.protein * (food.count || 1) * 100) / 100;
  const getTotalCarbs = (food: FoodEntry) => Math.round(food.carbs * (food.count || 1) * 100) / 100;
  const getTotalFat = (food: FoodEntry) => Math.round(food.fat * (food.count || 1) * 100) / 100;

  const foodsByDate = groupByDate(foods);
  const dates = Array.from(foodsByDate.keys()).sort((a, b) => b.localeCompare(a));
  const selectedFoods = foodsByDate.get(selectedDate) || [];

  const dailyTotals = dates.map((date) => {
    const dayFoods = foodsByDate.get(date) || [];
    return {
      date: formatDisplayDate(date),
      fullDate: date,
      calories: dayFoods.reduce((sum, f) => sum + getTotalCalories(f), 0),
      protein: dayFoods.reduce((sum, f) => sum + getTotalProtein(f), 0),
      carbs: dayFoods.reduce((sum, f) => sum + getTotalCarbs(f), 0),
      fat: dayFoods.reduce((sum, f) => sum + getTotalFat(f), 0),
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
          {(['daily', 'analysis'] as const).map((mode) => (
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

      {viewMode === 'daily' && (
        <>
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

          {/* Add/Edit Food Form */}
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>🍽️</span> <span className="hidden sm:inline">{formatDisplayDate(selectedDate)}</span><span className="sm:hidden">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {!showForm && !showQuickAdd && (
                  <>
                    <button
                      onClick={() => setShowQuickAdd(true)}
                      className="px-3 sm:px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm whitespace-nowrap"
                    >
                      📋 <span className="hidden sm:inline">Quick Add</span><span className="sm:hidden">Quick</span>
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-coral to-amber-glow text-midnight font-semibold hover:glow-sm transition-all text-sm whitespace-nowrap"
                    >
                      + <span className="hidden sm:inline">Custom</span><span className="sm:hidden">Add</span>
                    </button>
                    <button
                      onClick={() => handleToggleDayComplete(!isDayComplete)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap ${
                        isDayComplete 
                          ? 'bg-electric/20 text-electric border border-electric/30' 
                          : 'glass hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDayComplete}
                        onChange={(e) => handleToggleDayComplete(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-midnight text-electric focus:ring-electric cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="hidden sm:inline">Day Done</span><span className="sm:hidden">Done</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Add from Database */}
            {showQuickAdd && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Quick Add Food</h4>
                  <button
                    onClick={() => setShowQuickAdd(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs ${selectedCategory === 'all' ? 'bg-coral text-midnight' : 'bg-white/10'}`}
                  >
                    All
                  </button>
                  {getAllCategories().map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs capitalize ${selectedCategory === cat ? 'bg-coral text-midnight' : 'bg-white/10'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {(selectedCategory === 'all' 
                    ? searchFoods('') || [] 
                    : getFoodsByCategory(selectedCategory as FoodItem['category'])
                  ).slice(0, 20).map(food => (
                    <button
                      key={food.name}
                      onClick={() => quickAddFood(food)}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left text-sm transition-all"
                    >
                      <p className="font-medium truncate">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.calories} cal · {food.protein}g P</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-3 sm:p-4 rounded-xl bg-white/5 animate-slide-up">
                {/* Search Source Toggle */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500 shrink-0">Search:</span>
                  <button
                    type="button"
                    onClick={() => setSearchSource('local')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-all shrink-0 ${
                      searchSource === 'local' ? 'bg-electric text-midnight' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    🇮🇳 NIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchSource('online')}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-all shrink-0 ${
                      searchSource === 'online' ? 'bg-coral text-midnight' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    🌐 Online
                  </button>
                  {isSearchingApi && <span className="text-xs text-gray-500 animate-pulse">Searching...</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-4">
                  <div className="sm:col-span-2 lg:col-span-2 relative">
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Food name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFoodNameChange(e.target.value)}
                      placeholder="Search food..."
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                      required
                      autoComplete="off"
                    />
                    {/* Suggestions dropdown */}
                    {(foodSuggestions.length > 0 || apiSuggestions.length > 0) && (
                      <div className="absolute z-10 w-full mt-1 bg-midnight border border-white/20 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {/* User's Previous Foods + NIN Database */}
                        {foodSuggestions.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 text-xs text-electric bg-electric/10 sticky top-0">
                              📜 Your Foods + NIN Database ({foodSuggestions.length})
                            </div>
                            {foodSuggestions.slice(0, 15).map(food => (
                              <button
                                key={`local-${food.name}`}
                                type="button"
                                onClick={() => selectFoodSuggestion(food)}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 text-sm border-b border-white/5"
                              >
                                <span className="font-medium">{food.name}</span>
                                <span className="text-gray-400 ml-2 text-xs">
                                  {food.calories} cal · {food.protein.toFixed(1)}g P
                                  {food.fiber && ` · ${food.fiber.toFixed(1)}g Fiber`}
                                  {food.sugar && ` · ${food.sugar.toFixed(1)}g Sugar`}
                                </span>
                                {food.servingSize && <span className="text-gray-500 ml-1 text-xs">({food.servingSize})</span>}
                              </button>
                            ))}
                          </>
                        )}
                        {/* Online FatSecret Results */}
                        {apiSuggestions.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 text-xs text-coral bg-coral/10 sticky top-0">
                              🌐 FatSecret - Limited Data ({apiSuggestions.length})
                            </div>
                            {apiSuggestions.map((food, i) => (
                              <button
                                key={`api-${i}-${food.name}`}
                                type="button"
                                onClick={() => selectFoodSuggestion(food)}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 text-sm border-b border-white/5"
                              >
                                <span className="font-medium">{food.name}</span>
                                <span className="text-gray-400 ml-2 text-xs">
                                  {food.calories} cal · {food.protein.toFixed(1)}g P
                                  {food.fiber && ` · ${food.fiber.toFixed(1)}g Fiber`}
                                  {food.sugar && ` · ${food.sugar.toFixed(1)}g Sugar`}
                                  {!food.fiber && !food.sugar && ' · (No fiber/sugar data)'}
                                </span>
                                {food.servingSize && <span className="text-gray-500 ml-1 text-xs">({food.servingSize})</span>}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Servings</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.count}
                      onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                      placeholder="1"
                      min="0.01"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Calories</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Protein</label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      placeholder="0g"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Carbs</label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      placeholder="0g"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Fat</label>
                    <input
                      type="number"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                      placeholder="0g"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Fiber (optional)</label>
                    <input
                      type="number"
                      value={formData.fiber}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                      placeholder="0g"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Sugar (optional)</label>
                    <input
                      type="number"
                      value={formData.sugar}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                      placeholder="0g"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm"
                    />
                  </div>
                </div>
                {/* Show total preview */}
                {(parseFloat(formData.calories) > 0 && parseFloat(formData.count) > 1) && (
                  <div className="mb-4 p-2.5 rounded-lg bg-electric/10 text-electric text-sm font-medium">
                    Total: {Math.round((parseFloat(formData.calories) || 0) * (parseFloat(formData.count) || 1))} cal 
                    <span className="text-xs ml-1">({formData.count} × {formData.calories})</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value as FormState['mealType'] })}
                    className="px-3 py-2.5 sm:py-2 rounded-lg bg-midnight border border-white/10 focus:border-coral focus:outline-none text-sm flex-1 sm:flex-none"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🍿 Snack</option>
                  </select>
                  <div className="flex gap-3 flex-1 sm:flex-none">
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(editingId)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg border border-coral/30 text-coral hover:bg-coral/10 transition-all text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-coral to-amber-glow text-midnight font-semibold hover:glow-sm transition-all text-sm"
                    >
                      {editingId ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Food List */}
            {selectedFoods.length > 0 ? (
              <>
                {/* Day Total - Moved to Top */}
                <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 font-semibold">
                    <span className="text-sm sm:text-base">Day Total ({selectedFoods.length} items)</span>
                    <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-mono flex-wrap">
                      <span className="text-electric">
                        {Math.round(selectedFoods.reduce((s, f) => s + getTotalCalories(f), 0))} cal
                      </span>
                      <span className="text-coral">
                        {selectedFoods.reduce((s, f) => s + getTotalProtein(f), 0).toFixed(1)}g P
                      </span>
                      <span className="text-amber-glow">
                        {selectedFoods.reduce((s, f) => s + getTotalCarbs(f), 0).toFixed(1)}g C
                      </span>
                      <span className="text-neon-cyan">
                        {selectedFoods.reduce((s, f) => s + getTotalFat(f), 0).toFixed(1)}g F
                      </span>
                      {selectedFoods.some(f => f.fiber) && (
                        <span className="text-green-400">
                          {selectedFoods.reduce((s, f) => s + (f.fiber || 0) * (f.count || 1), 0).toFixed(1)}g Fiber
                        </span>
                      )}
                      {selectedFoods.some(f => f.sugar) && (
                        <span className="text-pink-400">
                          {selectedFoods.reduce((s, f) => s + (f.sugar || 0) * (f.count || 1), 0).toFixed(1)}g Sugar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedFoods.map((food) => (
                  <div
                    key={food.id}
                    className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm sm:text-base truncate">{food.name}</p>
                        {(food.count || 1) > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-electric/20 text-electric shrink-0">
                            ×{food.count}
                          </span>
                        )}
                        {food.mealType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-coral/20 text-coral capitalize shrink-0">
                            {food.mealType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono mt-1 flex-wrap">
                        <span className="text-electric">{getTotalCalories(food)} cal</span>
                        <span className="text-coral">{getTotalProtein(food).toFixed(1)}g P</span>
                        <span className="text-amber-glow hidden sm:inline">{getTotalCarbs(food).toFixed(1)}g C</span>
                        <span className="text-neon-cyan hidden sm:inline">{getTotalFat(food).toFixed(1)}g F</span>
                        {food.fiber && food.fiber > 0 && (
                          <span className="text-green-400 hidden sm:inline">{(food.fiber * (food.count || 1)).toFixed(1)}g Fiber</span>
                        )}
                        {food.sugar && food.sugar > 0 && (
                          <span className="text-pink-400 hidden sm:inline">{(food.sugar * (food.count || 1)).toFixed(1)}g Sugar</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Menu Button */}
                    <div className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === food.id ? null : food.id);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Options"
                      >
                        <span className="text-lg">⋯</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openMenuId === food.id && (
                        <div 
                          className="absolute right-0 mt-1 w-32 bg-midnight border border-white/20 rounded-lg shadow-lg z-10 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEdit(food)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                          >
                            <span>✎</span> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(food.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-coral/20 text-coral transition-all flex items-center gap-2"
                          >
                            <span>✕</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Delete All Button - At Bottom */}
              <button
                onClick={handleDeleteAllDay}
                className="w-full mt-3 px-4 py-2 rounded-lg border border-coral/30 text-coral text-sm hover:bg-coral/10 transition-all flex items-center justify-center gap-2"
              >
                <span>🗑️</span> Delete All Entries for This Day
              </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">🍽️</p>
                <p>No food entries for this date</p>
                <p className="text-sm">Click &quot;+ Add Food&quot; to log something</p>
              </div>
            )}
          </div>

          {/* Daily Charts */}
          {dailyTotals.length > 0 && (
            <>
              {/* Calories Bar Chart */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">🔥 Daily Calories (Last 14 Days)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTotals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                      <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Bar
                        dataKey="calories"
                        name="Calories"
                        fill="#00ff88"
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => setSelectedDate(data.fullDate)}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Macros Trend Chart */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4">📊 Macro Trends (Last 14 Days)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyTotals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                      <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="protein"
                        name="Protein (g)"
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        dot={{ fill: '#ff6b6b', r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="carbs"
                        name="Carbs (g)"
                        stroke="#ffc93c"
                        strokeWidth={2}
                        dot={{ fill: '#ffc93c', r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fat"
                        name="Fat (g)"
                        stroke="#00d4ff"
                        strokeWidth={2}
                        dot={{ fill: '#00d4ff', r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {viewMode === 'analysis' && (() => {
        // Filter foods by date range
        const getFilteredFoods = () => {
          if (analysisRange === 'all') return foods;

          let startDate: string;
          let endDate = customEndDate;

          if (analysisRange === 'custom') {
            startDate = customStartDate;
          } else {
            startDate = getDateNDaysAgo(parseInt(analysisRange));
            endDate = formatDate(new Date());
          }

          return foods.filter(f => f.date >= startDate && f.date <= endDate);
        };

        const getDailyMacros = () => {
          const filtered = getFilteredFoods();
          console.log('Filtered foods for sugar/fiber chart:', filtered);
          const dailyMap = new Map<string, { sugar: number; fiber: number }>();

          filtered.forEach(food => {
            console.log(`Food: ${food.name}, sugar: ${food.sugar}, fiber: ${food.fiber}`);
            const existing = dailyMap.get(food.date) || { sugar: 0, fiber: 0 };
            dailyMap.set(food.date, {
              sugar: existing.sugar + (food.sugar || 0) * (food.count || 1),
              fiber: existing.fiber + (food.fiber || 0) * (food.count || 1),
            });
          });

          const result = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
              date,
              sugar: Math.round(data.sugar * 10) / 10,
              fiber: Math.round(data.fiber * 10) / 10,
            }));
          console.log('Daily macros data:', result);
          return result;
        };
        
        const filteredFoods = getFilteredFoods();
        const filteredContributions = calculateFoodContributions(filteredFoods);
        const totalCals = filteredFoods.reduce((sum, f) => sum + f.calories * (f.count || 1), 0);
        const totalProtein = filteredFoods.reduce((sum, f) => sum + f.protein * (f.count || 1), 0);
        const totalFiber = filteredFoods.reduce((sum, f) => sum + (f.fiber || 0) * (f.count || 1), 0);
        const totalSugar = filteredFoods.reduce((sum, f) => sum + (f.sugar || 0) * (f.count || 1), 0);
        
        return (
        <>
          {/* Date Range Selector */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-400 text-sm">📅 Date Range:</span>
              {(['7', '14', '30', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setAnalysisRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    analysisRange === range
                      ? 'bg-coral text-midnight'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {range === 'all' ? 'All Time' : `${range}D`}
                </button>
              ))}
              <button
                onClick={() => setAnalysisRange('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  analysisRange === 'custom'
                    ? 'bg-coral text-midnight'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Custom
              </button>
              
              {analysisRange === 'custom' && (
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2 py-1 rounded bg-midnight border border-white/20 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2 py-1 rounded bg-midnight border border-white/20 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-gray-400">
                📊 {filteredFoods.length} entries |
                🔥 {totalCals.toLocaleString()} cal |
                🥩 {totalProtein.toFixed(1)}g protein |
                🌱 {totalFiber.toFixed(1)}g fiber |
                🍬 {totalSugar.toFixed(1)}g sugar
              </span>
            </div>
          </div>

          {/* Food Contribution Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Foods Chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4">🏆 Top Calorie Sources</h3>
              <div className="h-64">
                {filteredContributions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredContributions.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="totalCalories"
                        nameKey="name"
                      >
                        {filteredContributions.slice(0, 8).map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(value: number, name: string) => [`${value.toLocaleString()} cal`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No data for selected range</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {filteredContributions.slice(0, 8).map((food, i) => (
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
                {filteredContributions.slice(0, 15).map((food, i) => (
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
                        <span>{Math.round(food.avgCalories)} cal avg</span>
                        <span>{food.avgProtein.toFixed(1)}g protein avg</span>
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
                {filteredContributions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No data for selected range</p>
                )}
              </div>
            </div>
          </div>

          {/* Sugar & Fiber Tracking Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">🍬 Sugar & Fiber Intake Trend</h3>
            <div className="h-64">
              {(() => {
                const dailyData = getDailyMacros();
                return dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis
                        dataKey="date"
                        stroke="#ffffff60"
                        fontSize={12}
                        tickFormatter={(date) => formatDisplayDate(date)}
                      />
                      <YAxis stroke="#ffffff60" fontSize={12} />
                      <Tooltip
                        {...tooltipStyle}
                        labelFormatter={(date) => formatDisplayDate(date)}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}g`,
                          name === 'sugar' ? 'Sugar' : 'Fiber'
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sugar"
                        stroke="#ec4899"
                        strokeWidth={2}
                        name="Sugar"
                        dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fiber"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Fiber"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No sugar/fiber data for selected range</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
        );
      })()}

    </div>
  );
}
