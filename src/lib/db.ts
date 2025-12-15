import { getSupabase } from './supabase';
import { FoodEntry, WorkoutEntry, WeightEntry } from './types';

// Food operations
export async function addFoodEntries(userId: string, entries: FoodEntry[]): Promise<void> {
  const supabase = getSupabase();
  
  const rows = entries.map(entry => ({
    user_id: userId,
    date: entry.date,
    name: entry.name,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    fiber: entry.fiber,
    sugar: entry.sugar,
    count: entry.count || 1,
    meal_type: entry.mealType,
  }));

  const { error } = await supabase.from('foods').insert(rows);
  if (error) throw error;
          }

export async function updateFoodEntry(id: string, entry: Partial<FoodEntry>): Promise<void> {
  const supabase = getSupabase();
  
  // Build update object with all provided fields
  const updates: Record<string, unknown> = {
    date: entry.date,
    name: entry.name,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    fiber: entry.fiber ?? null,
    sugar: entry.sugar ?? null,
    count: entry.count || 1,
    meal_type: entry.mealType ?? null,
  };

  const { error } = await supabase.from('foods').update(updates).eq('id', id);
  if (error) {
    console.error('Update food error:', error);
    throw error;
  }
}

export async function getFoodsByDate(userId: string, date: string): Promise<FoodEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFoodRow);
}

export async function getFoodsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<FoodEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFoodRow);
}

export async function getAllFoods(userId: string): Promise<FoodEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFoodRow);
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('foods').delete().eq('id', id);
  if (error) throw error;
}

// Workout operations
export async function addWorkoutEntries(userId: string, entries: WorkoutEntry[]): Promise<void> {
  const supabase = getSupabase();
  
  const rows = entries.map(entry => ({
    user_id: userId,
    date: entry.date,
    exercise: entry.exercise,
    category: entry.category,
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight,
    duration: entry.duration,
    distance: entry.distance,
    calories_burned: entry.caloriesBurned,
    notes: entry.notes,
  }));

  const { error } = await supabase.from('workouts').insert(rows);
  if (error) throw error;
}

export async function getWorkoutsByDate(userId: string, date: string): Promise<WorkoutEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWorkoutRow);
}

export async function getWorkoutsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWorkoutRow);
}

export async function getAllWorkouts(userId: string): Promise<WorkoutEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWorkoutRow);
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) throw error;
}

export async function updateWorkoutEntry(id: string, entry: Partial<WorkoutEntry>): Promise<void> {
  const supabase = getSupabase();

  // Build update object with all provided fields
  const updates: Record<string, unknown> = {
    date: entry.date,
    exercise: entry.exercise,
    category: entry.category,
    sets: entry.sets ?? null,
    reps: entry.reps ?? null,
    weight: entry.weight ?? null,
    duration: entry.duration ?? null,
    distance: entry.distance ?? null,
    calories_burned: entry.caloriesBurned ?? null,
    notes: entry.notes ?? null,
  };

  const { error } = await supabase.from('workouts').update(updates).eq('id', id);
  if (error) {
    console.error('Update workout error:', error);
    throw error;
  }
}

// Weight operations
export async function addWeightEntry(userId: string, entry: WeightEntry): Promise<void> {
  const supabase = getSupabase();
  
  const { error } = await supabase.from('weights').insert({
    user_id: userId,
    date: entry.date,
    weight: entry.weight,
    body_fat: entry.bodyFat,
    notes: entry.notes,
  });

  if (error) throw error;
}

export async function getWeightsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeightEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWeightRow);
}

export async function getAllWeights(userId: string): Promise<WeightEntry[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapWeightRow);
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('weights').delete().eq('id', id);
  if (error) throw error;
}

// Clear all data for a user
export async function clearUserData(userId: string): Promise<void> {
  const supabase = getSupabase();
  
  await Promise.all([
    supabase.from('foods').delete().eq('user_id', userId),
    supabase.from('workouts').delete().eq('user_id', userId),
    supabase.from('weights').delete().eq('user_id', userId),
  ]);
}

// Helper functions to map database rows to types
function mapFoodRow(row: Record<string, unknown>): FoodEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    name: row.name as string,
    calories: row.calories as number,
    protein: row.protein as number,
    carbs: row.carbs as number,
    fat: row.fat as number,
    fiber: row.fiber as number | undefined,
    sugar: row.sugar as number | undefined,
    count: (row.count as number) || 1,
    mealType: row.meal_type as FoodEntry['mealType'],
    timestamp: row.created_at as string,
  };
}

function mapWorkoutRow(row: Record<string, unknown>): WorkoutEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    exercise: row.exercise as string,
    category: row.category as WorkoutEntry['category'],
    sets: row.sets as number | undefined,
    reps: row.reps as number | undefined,
    weight: row.weight as number | undefined,
    duration: row.duration as number | undefined,
    distance: row.distance as number | undefined,
    caloriesBurned: row.calories_burned as number | undefined,
    notes: row.notes as string | undefined,
    timestamp: row.created_at as string,
  };
}

function mapWeightRow(row: Record<string, unknown>): WeightEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    weight: row.weight as number,
    bodyFat: row.body_fat as number | undefined,
    notes: row.notes as string | undefined,
  };
}
