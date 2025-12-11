import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FoodEntry, WorkoutEntry, WeightEntry } from './types';

interface FitHoodDB extends DBSchema {
  foods: {
    key: string;
    value: FoodEntry;
    indexes: { 'by-date': string };
  };
  workouts: {
    key: string;
    value: WorkoutEntry;
    indexes: { 'by-date': string };
  };
  weights: {
    key: string;
    value: WeightEntry;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'fithood-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FitHoodDB>> | null = null;

function getDB(): Promise<IDBPDatabase<FitHoodDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FitHoodDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Foods store
        if (!db.objectStoreNames.contains('foods')) {
          const foodStore = db.createObjectStore('foods', { keyPath: 'id' });
          foodStore.createIndex('by-date', 'date');
        }
        // Workouts store
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('by-date', 'date');
        }
        // Weights store
        if (!db.objectStoreNames.contains('weights')) {
          const weightStore = db.createObjectStore('weights', { keyPath: 'id' });
          weightStore.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

// Food operations
export async function addFoodEntries(entries: FoodEntry[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('foods', 'readwrite');
  await Promise.all(entries.map((entry) => tx.store.put(entry)));
  await tx.done;
}

export async function getFoodsByDate(date: string): Promise<FoodEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('foods', 'by-date', date);
}

export async function getFoodsByDateRange(startDate: string, endDate: string): Promise<FoodEntry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('foods', 'by-date', range);
}

export async function getAllFoods(): Promise<FoodEntry[]> {
  const db = await getDB();
  return db.getAll('foods');
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('foods', id);
}

// Workout operations
export async function addWorkoutEntries(entries: WorkoutEntry[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('workouts', 'readwrite');
  await Promise.all(entries.map((entry) => tx.store.put(entry)));
  await tx.done;
}

export async function getWorkoutsByDate(date: string): Promise<WorkoutEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('workouts', 'by-date', date);
}

export async function getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutEntry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('workouts', 'by-date', range);
}

export async function getAllWorkouts(): Promise<WorkoutEntry[]> {
  const db = await getDB();
  return db.getAll('workouts');
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workouts', id);
}

// Weight operations
export async function addWeightEntry(entry: WeightEntry): Promise<void> {
  const db = await getDB();
  await db.put('weights', entry);
}

export async function getWeightsByDateRange(startDate: string, endDate: string): Promise<WeightEntry[]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('weights', 'by-date', range);
}

export async function getAllWeights(): Promise<WeightEntry[]> {
  const db = await getDB();
  return db.getAll('weights');
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('weights', id);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('foods'),
    db.clear('workouts'),
    db.clear('weights'),
  ]);
}

