import { FoodEntry, WorkoutEntry, WeightEntry, DailySummary, UserProfile } from './types';

export interface DailyDeficitData {
  date: string;
  caloriesIn: number;
  caloriesBurned: number;
  tdee: number;
  deficit: number;
  netCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight?: number;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFoodsToCSV(foods: FoodEntry[]) {
  const headers = ['date', 'name', 'count', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'mealType'];
  const rows = foods.map(food => [
    food.date,
    `"${food.name.replace(/"/g, '""')}"`,
    food.count || 1,
    food.calories,
    food.protein,
    food.carbs,
    food.fat,
    food.fiber || '',
    food.sugar || '',
    food.mealType || '',
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `fithood-food-${date}.csv`);
}

export function exportWorkoutsToCSV(workouts: WorkoutEntry[]) {
  const headers = ['date', 'exercise', 'category', 'sets', 'reps', 'weight', 'duration', 'caloriesBurned', 'distance', 'notes'];
  const rows = workouts.map(workout => [
    workout.date,
    `"${workout.exercise.replace(/"/g, '""')}"`,
    workout.category,
    workout.sets || '',
    workout.reps || '',
    workout.weight || '',
    workout.duration || '',
    workout.caloriesBurned || '',
    workout.distance || '',
    workout.notes ? `"${workout.notes.replace(/"/g, '""')}"` : '',
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `fithood-workouts-${date}.csv`);
}

export function exportWeightsToCSV(weights: WeightEntry[]) {
  const headers = ['date', 'weight', 'bodyFat', 'notes'];
  const rows = weights.map(weight => [
    weight.date,
    weight.weight,
    weight.bodyFat || '',
    weight.notes ? `"${weight.notes.replace(/"/g, '""')}"` : '',
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `fithood-weight-${date}.csv`);
}

export function exportAllDataToCSV(
  foods: FoodEntry[],
  workouts: WorkoutEntry[],
  weights: WeightEntry[]
) {
  // Export each type as separate file
  if (foods.length > 0) exportFoodsToCSV(foods);
  if (workouts.length > 0) exportWorkoutsToCSV(workouts);
  if (weights.length > 0) exportWeightsToCSV(weights);
}

// Activity multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function exportDailyDeficitToCSV(
  summaries: DailySummary[],
  weights: WeightEntry[],
  profile: UserProfile | null
) {
  // Create weight lookup
  const weightByDate = new Map(weights.map(w => [w.date, w.weight]));
  
  // Calculate BMR helper
  const calculateBMR = (weight: number): number => {
    if (!profile || weight <= 0) return 0;
    if (profile.gender === 'male') {
      return 10 * weight + 6.25 * profile.height - 5 * profile.age + 5;
    }
    return 10 * weight + 6.25 * profile.height - 5 * profile.age - 161;
  };

  // Find the most recent weight for days without weight entries
  const getWeightForDate = (date: string): number => {
    if (weightByDate.has(date)) return weightByDate.get(date)!;
    
    // Find most recent weight before this date
    const sortedWeights = weights.sort((a, b) => b.date.localeCompare(a.date));
    const recentWeight = sortedWeights.find(w => w.date <= date);
    return recentWeight?.weight || 0;
  };

  const headers = [
    'date',
    'calories_in',
    'calories_burned',
    'net_calories',
    'tdee',
    'deficit',
    'weekly_projection_kg',
    'protein_g',
    'carbs_g',
    'fat_g',
    'weight_kg'
  ];

  const rows = summaries.map(summary => {
    const weight = getWeightForDate(summary.date);
    const bmr = calculateBMR(weight);
    const tdee = profile ? Math.round(bmr * (ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.55)) : 0;
    
    const caloriesBurned = summary.workoutEntries.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const netCalories = summary.totalCalories - caloriesBurned;
    // Deficit = Net - TDEE (negative = deficit/losing, positive = surplus/gaining)
    const deficit = tdee > 0 ? netCalories - tdee : 0;
    // Weekly projection: negative deficit means weight loss
    const weeklyProjection = deficit !== 0 ? ((deficit * 7) / 7700).toFixed(2) : '0';

    return [
      summary.date,
      summary.totalCalories,
      caloriesBurned,
      netCalories,
      tdee,
      deficit,
      weeklyProjection,
      Math.round(summary.totalProtein),
      Math.round(summary.totalCarbs),
      Math.round(summary.totalFat),
      weight || '',
    ];
  });

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `fithood-daily-deficit-${date}.csv`);
}

