import Papa from 'papaparse';
import { FoodEntry, WorkoutEntry } from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeDate(dateStr: string): string {
  // Handle various date formats and normalize to YYYY-MM-DD
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Try parsing DD/MM/YYYY or MM/DD/YYYY
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      // Assume YYYY-MM-DD if first part is 4 digits
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      // Otherwise assume DD/MM/YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0]; // fallback to today
  }
  return date.toISOString().split('T')[0];
}

function parseNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

interface RawFoodRow {
  [key: string]: string | number | undefined;
}

interface RawWorkoutRow {
  [key: string]: string | number | undefined;
}

export function parseFoodCSV(csvContent: string): FoodEntry[] {
  const result = Papa.parse<RawFoodRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => normalizeColumnName(header),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data.map((row): FoodEntry => {
    // Find columns by various possible names
    const findValue = (possibleNames: string[]): string | number | undefined => {
      for (const name of possibleNames) {
        const normalized = normalizeColumnName(name);
        if (row[normalized] !== undefined) return row[normalized];
      }
      return undefined;
    };

    const dateValue = findValue(['date', 'day', 'datetime', 'timestamp']);
    const nameValue = findValue(['name', 'food', 'foodname', 'item', 'fooditem', 'description']);
    const caloriesValue = findValue(['calories', 'cals', 'kcal', 'energy', 'cal']);
    const proteinValue = findValue(['protein', 'proteins', 'prot']);
    const carbsValue = findValue(['carbs', 'carbohydrates', 'carb', 'carbohydrate']);
    const fatValue = findValue(['fat', 'fats', 'lipids', 'lipid']);
    const fiberValue = findValue(['fiber', 'fibre', 'dietary fiber']);
    const sugarValue = findValue(['sugar', 'sugars']);
    const mealValue = findValue(['meal', 'mealtype', 'type', 'category']);

    const mealType = String(mealValue || '').toLowerCase();
    let normalizedMealType: FoodEntry['mealType'] = undefined;
    if (mealType.includes('breakfast')) normalizedMealType = 'breakfast';
    else if (mealType.includes('lunch')) normalizedMealType = 'lunch';
    else if (mealType.includes('dinner')) normalizedMealType = 'dinner';
    else if (mealType.includes('snack')) normalizedMealType = 'snack';

    return {
      id: generateId(),
      date: normalizeDate(String(dateValue || new Date().toISOString())),
      name: String(nameValue || 'Unknown Food'),
      calories: parseNumber(caloriesValue),
      protein: parseNumber(proteinValue),
      carbs: parseNumber(carbsValue),
      fat: parseNumber(fatValue),
      fiber: fiberValue !== undefined ? parseNumber(fiberValue) : undefined,
      sugar: sugarValue !== undefined ? parseNumber(sugarValue) : undefined,
      mealType: normalizedMealType,
      timestamp: new Date().toISOString(),
    };
  });
}

export function parseWorkoutCSV(csvContent: string): WorkoutEntry[] {
  const result = Papa.parse<RawWorkoutRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => normalizeColumnName(header),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data.map((row): WorkoutEntry => {
    const findValue = (possibleNames: string[]): string | number | undefined => {
      for (const name of possibleNames) {
        const normalized = normalizeColumnName(name);
        if (row[normalized] !== undefined) return row[normalized];
      }
      return undefined;
    };

    const dateValue = findValue(['date', 'day', 'datetime', 'timestamp']);
    const exerciseValue = findValue(['exercise', 'name', 'workout', 'movement', 'activity']);
    const categoryValue = findValue(['category', 'type', 'workouttype', 'exercisetype']);
    const setsValue = findValue(['sets', 'set']);
    const repsValue = findValue(['reps', 'repetitions', 'rep']);
    const weightValue = findValue(['weight', 'load', 'kg', 'lbs']);
    const durationValue = findValue(['duration', 'time', 'minutes', 'mins']);
    const distanceValue = findValue(['distance', 'km', 'miles']);
    const caloriesBurnedValue = findValue(['caloriesburned', 'burned', 'calsburned']);
    const notesValue = findValue(['notes', 'note', 'comments', 'comment']);

    const categoryStr = String(categoryValue || '').toLowerCase();
    let normalizedCategory: WorkoutEntry['category'] = 'other';
    if (categoryStr.includes('strength') || categoryStr.includes('weight') || categoryStr.includes('resistance')) {
      normalizedCategory = 'strength';
    } else if (categoryStr.includes('cardio') || categoryStr.includes('aerobic') || categoryStr.includes('running')) {
      normalizedCategory = 'cardio';
    } else if (categoryStr.includes('flex') || categoryStr.includes('stretch') || categoryStr.includes('yoga')) {
      normalizedCategory = 'flexibility';
    }

    return {
      id: generateId(),
      date: normalizeDate(String(dateValue || new Date().toISOString())),
      exercise: String(exerciseValue || 'Unknown Exercise'),
      category: normalizedCategory,
      sets: setsValue !== undefined ? parseNumber(setsValue) : undefined,
      reps: repsValue !== undefined ? parseNumber(repsValue) : undefined,
      weight: weightValue !== undefined ? parseNumber(weightValue) : undefined,
      duration: durationValue !== undefined ? parseNumber(durationValue) : undefined,
      distance: distanceValue !== undefined ? parseNumber(distanceValue) : undefined,
      caloriesBurned: caloriesBurnedValue !== undefined ? parseNumber(caloriesBurnedValue) : undefined,
      notes: notesValue !== undefined ? String(notesValue) : undefined,
      timestamp: new Date().toISOString(),
    };
  });
}

