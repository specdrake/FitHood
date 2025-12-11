import { FoodEntry, WorkoutEntry, WeightEntry } from './types';

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
  const headers = ['date', 'name', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'mealType'];
  const rows = foods.map(food => [
    food.date,
    `"${food.name.replace(/"/g, '""')}"`,
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

