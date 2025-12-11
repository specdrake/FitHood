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
  return {
    date,
    totalCalories: foods.reduce((sum, f) => sum + f.calories, 0),
    totalProtein: foods.reduce((sum, f) => sum + f.protein, 0),
    totalCarbs: foods.reduce((sum, f) => sum + f.carbs, 0),
    totalFat: foods.reduce((sum, f) => sum + f.fat, 0),
    totalFiber: foods.reduce((sum, f) => sum + (f.fiber || 0), 0),
    foodEntries: foods,
    workoutEntries: workouts,
    weight,
  };
}

export function calculateFoodContributions(foods: FoodEntry[]): FoodContribution[] {
  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  
  const grouped = new Map<string, FoodEntry[]>();
  foods.forEach((food) => {
    const key = food.name.toLowerCase().trim();
    const existing = grouped.get(key) || [];
    existing.push(food);
    grouped.set(key, existing);
  });

  const contributions: FoodContribution[] = [];
  grouped.forEach((entries, name) => {
    const totalCals = entries.reduce((sum, f) => sum + f.calories, 0);
    const totalProt = entries.reduce((sum, f) => sum + f.protein, 0);
    contributions.push({
      name: entries[0].name, // Use original casing
      totalCalories: totalCals,
      totalProtein: totalProt,
      count: entries.length,
      avgCalories: Math.round(totalCals / entries.length),
      avgProtein: Math.round(totalProt / entries.length),
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

