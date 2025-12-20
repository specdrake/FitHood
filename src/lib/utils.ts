import { FoodEntry, WorkoutEntry, DailySummary, FoodContribution } from './types';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

export function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  items.forEach((item) => {
    const existing = grouped.get(item.date) || [];
    existing.push(item);
    grouped.set(item.date, existing);
  });
  return grouped;
}

export function calculateDailySummary(
  date: string,
  foods: FoodEntry[],
  workouts: WorkoutEntry[],
  weight?: number
): DailySummary {
  // Calculate totals with count multiplier
  const getTotal = (f: FoodEntry, val: number) => val * (f.count || 1);
  
  return {
    date,
    totalCalories: foods.reduce((sum, f) => sum + getTotal(f, f.calories), 0),
    totalProtein: foods.reduce((sum, f) => sum + getTotal(f, f.protein), 0),
    totalCarbs: foods.reduce((sum, f) => sum + getTotal(f, f.carbs), 0),
    totalFat: foods.reduce((sum, f) => sum + getTotal(f, f.fat), 0),
    totalFiber: foods.reduce((sum, f) => sum + getTotal(f, f.fiber || 0), 0),
    totalSugar: foods.reduce((sum, f) => sum + getTotal(f, f.sugar || 0), 0),
    foodEntries: foods,
    workoutEntries: workouts,
    weight,
  };
}

// Normalize food name for grouping similar items
// e.g., "Buffalo Milk (350ml)" and "Buffalo Milk (250ml)" -> "buffalo milk"
// e.g., "Milk, Buffalo (1 glass)" and "Buffalo Milk (350 ml)" -> "buffalo milk"
export function normalizeFoodName(name: string): string {
  let normalized = name
    .toLowerCase()
    .trim()
    // Remove ALL content in parentheses (not just with digits)
    .replace(/\s*\([^)]*\)/g, '')
    // Remove ALL content in brackets
    .replace(/\s*\[[^\]]*\]/g, '')
    // Remove trailing numbers with units
    .replace(/\s+\d+\s*(ml|g|kg|oz|cups?|pieces?|slices?|scoops?|tbsp|tsp|small|medium|large)s?\s*$/i, '')
    // Remove commas
    .replace(/,/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  // Sort words alphabetically to handle different word orders
  // "milk buffalo" and "buffalo milk" both become "buffalo milk"
  const words = normalized.split(' ').sort();
  return words.join(' ');
}

export function calculateFoodContributions(foods: FoodEntry[]): FoodContribution[] {
  // Helper to get total with count multiplier
  const getTotalCals = (f: FoodEntry) => f.calories * (f.count || 1);
  const getTotalProt = (f: FoodEntry) => f.protein * (f.count || 1);
  
  const totalCalories = foods.reduce((sum, f) => sum + getTotalCals(f), 0);
  
  // Group by normalized name for better matching
  const grouped = new Map<string, FoodEntry[]>();
  foods.forEach((food) => {
    const key = normalizeFoodName(food.name);
    const existing = grouped.get(key) || [];
    existing.push(food);
    grouped.set(key, existing);
  });

  const contributions: FoodContribution[] = [];
  grouped.forEach((entries) => {
    const totalCals = entries.reduce((sum, f) => sum + getTotalCals(f), 0);
    const totalProt = entries.reduce((sum, f) => sum + getTotalProt(f), 0);
    // Count total servings (sum of counts)
    const totalCount = entries.reduce((sum, f) => sum + (f.count || 1), 0);
    
    // Use the most common name variant or first one
    const nameFreq = new Map<string, number>();
    entries.forEach(e => nameFreq.set(e.name, (nameFreq.get(e.name) || 0) + 1));
    const mostCommonName = Array.from(nameFreq.entries()).sort((a, b) => b[1] - a[1])[0][0];
    
    contributions.push({
      name: mostCommonName,
      totalCalories: totalCals,
      totalProtein: totalProt,
      count: totalCount, // Total servings across all entries
      avgCalories: totalCount > 0 ? Math.round(totalCals / totalCount) : 0,
      avgProtein: totalCount > 0 ? Math.round(totalProt / totalCount) : 0,
      percentOfTotal: totalCalories > 0 ? (totalCals / totalCalories) * 100 : 0,
    });
  });

  return contributions.sort((a, b) => b.totalCalories - a.totalCalories);
}

export function getMacroPercentages(protein: number, carbs: number, fat: number): {
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
} {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const total = proteinCals + carbsCals + fatCals;
  
  if (total === 0) {
    return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };
  }

  return {
    proteinPercent: Math.round((proteinCals / total) * 100),
    carbsPercent: Math.round((carbsCals / total) * 100),
    fatPercent: Math.round((fatCals / total) * 100),
  };
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

