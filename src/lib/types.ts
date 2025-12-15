// Food entry from CSV
export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number; // calories per unit
  protein: number; // grams per unit
  carbs: number; // grams per unit
  fat: number; // grams per unit
  fiber?: number; // grams per unit
  sugar?: number; // grams per unit
  count: number; // number of servings/items (total = count * per unit values)
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string;
}

// Workout entry from CSV
export interface WorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD
  exercise: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'other';
  sets?: number;
  reps?: number;
  weight?: number; // kg or lbs
  duration?: number; // minutes
  distance?: number; // km or miles
  caloriesBurned?: number;
  notes?: string;
  timestamp?: string;
}

// Weight tracking
export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFat?: number; // percentage
  notes?: string;
}

// Daily summary (computed)
export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  foodEntries: FoodEntry[];
  workoutEntries: WorkoutEntry[];
  weight?: number;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MacroBreakdown {
  protein: number;
  carbs: number;
  fat: number;
}

// Food contribution analysis
export interface FoodContribution {
  name: string;
  totalCalories: number;
  totalProtein: number;
  count: number;
  avgCalories: number;
  avgProtein: number;
  percentOfTotal: number;
}

// User profile for BMI/BMR calculations
export interface UserProfile {
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goalWeight?: number; // kg
  weeklyGoal?: number; // kg to lose/gain per week
}

