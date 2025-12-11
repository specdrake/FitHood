import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FoodEntry, WorkoutEntry, WeightEntry } from './types';

interface FitHoodDB extends DBSchema {
  foods: {
    key: string;
    value: FoodEntry & { userId: string };
    indexes: { 'by-date': string; 'by-user': string; 'by-user-date': [string, string] };
  };
  workouts: {
    key: string;
    value: WorkoutEntry & { userId: string };
    indexes: { 'by-date': string; 'by-user': string; 'by-user-date': [string, string] };
  };
  weights: {
    key: string;
    value: WeightEntry & { userId: string };
    indexes: { 'by-date': string; 'by-user': string; 'by-user-date': [string, string] };
  };
}

const DB_NAME = 'fithood-db';
const DB_VERSION = 2; // Bumped version for user support

let dbPromise: Promise<IDBPDatabase<FitHoodDB>> | null = null;

function getDB(): Promise<IDBPDatabase<FitHoodDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FitHoodDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Delete old stores if upgrading from v1
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains('foods')) {
            db.deleteObjectStore('foods');
          }
          if (db.objectStoreNames.contains('workouts')) {
            db.deleteObjectStore('workouts');
          }
          if (db.objectStoreNames.contains('weights')) {
            db.deleteObjectStore('weights');
          }
        }

        // Foods store with user index
        if (!db.objectStoreNames.contains('foods')) {
          const foodStore = db.createObjectStore('foods', { keyPath: 'id' });
          foodStore.createIndex('by-date', 'date');
          foodStore.createIndex('by-user', 'userId');
          foodStore.createIndex('by-user-date', ['userId', 'date']);
        }
        
        // Workouts store with user index
        if (!db.objectStoreNames.contains('workouts')) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('by-date', 'date');
          workoutStore.createIndex('by-user', 'userId');
          workoutStore.createIndex('by-user-date', ['userId', 'date']);
        }
        
        // Weights store with user index
        if (!db.objectStoreNames.contains('weights')) {
          const weightStore = db.createObjectStore('weights', { keyPath: 'id' });
          weightStore.createIndex('by-date', 'date');
          weightStore.createIndex('by-user', 'userId');
          weightStore.createIndex('by-user-date', ['userId', 'date']);
        }
      },
    });
  }
  return dbPromise;
}

// Food operations (user-scoped)
export async function addFoodEntries(userId: string, entries: FoodEntry[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('foods', 'readwrite');
  await Promise.all(
    entries.map((entry) => tx.store.put({ ...entry, userId }))
  );
  await tx.done;
}

export async function getFoodsByDate(userId: string, date: string): Promise<FoodEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('foods', 'by-user-date', [userId, date]);
  return entries.map(({ userId: _, ...entry }) => entry as FoodEntry);
}

export async function getFoodsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<FoodEntry[]> {
  const db = await getDB();
  const allUserFoods = await db.getAllFromIndex('foods', 'by-user', userId);
  return allUserFoods
    .filter((f) => f.date >= startDate && f.date <= endDate)
    .map(({ userId: _, ...entry }) => entry as FoodEntry);
}

export async function getAllFoods(userId: string): Promise<FoodEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('foods', 'by-user', userId);
  return entries.map(({ userId: _, ...entry }) => entry as FoodEntry);
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('foods', id);
}

// Workout operations (user-scoped)
export async function addWorkoutEntries(userId: string, entries: WorkoutEntry[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('workouts', 'readwrite');
  await Promise.all(
    entries.map((entry) => tx.store.put({ ...entry, userId }))
  );
  await tx.done;
}

export async function getWorkoutsByDate(userId: string, date: string): Promise<WorkoutEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('workouts', 'by-user-date', [userId, date]);
  return entries.map(({ userId: _, ...entry }) => entry as WorkoutEntry);
}

export async function getWorkoutsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutEntry[]> {
  const db = await getDB();
  const allUserWorkouts = await db.getAllFromIndex('workouts', 'by-user', userId);
  return allUserWorkouts
    .filter((w) => w.date >= startDate && w.date <= endDate)
    .map(({ userId: _, ...entry }) => entry as WorkoutEntry);
}

export async function getAllWorkouts(userId: string): Promise<WorkoutEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('workouts', 'by-user', userId);
  return entries.map(({ userId: _, ...entry }) => entry as WorkoutEntry);
}

export async function deleteWorkoutEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workouts', id);
}

// Weight operations (user-scoped)
export async function addWeightEntry(userId: string, entry: WeightEntry): Promise<void> {
  const db = await getDB();
  await db.put('weights', { ...entry, userId });
}

export async function getWeightsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeightEntry[]> {
  const db = await getDB();
  const allUserWeights = await db.getAllFromIndex('weights', 'by-user', userId);
  return allUserWeights
    .filter((w) => w.date >= startDate && w.date <= endDate)
    .map(({ userId: _, ...entry }) => entry as WeightEntry);
}

export async function getAllWeights(userId: string): Promise<WeightEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex('weights', 'by-user', userId);
  return entries.map(({ userId: _, ...entry }) => entry as WeightEntry);
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('weights', id);
}

// Clear all data for a user
export async function clearUserData(userId: string): Promise<void> {
  const db = await getDB();
  
  const foods = await db.getAllFromIndex('foods', 'by-user', userId);
  const workouts = await db.getAllFromIndex('workouts', 'by-user', userId);
  const weights = await db.getAllFromIndex('weights', 'by-user', userId);

  const tx = db.transaction(['foods', 'workouts', 'weights'], 'readwrite');
  
  await Promise.all([
    ...foods.map((f) => tx.objectStore('foods').delete(f.id)),
    ...workouts.map((w) => tx.objectStore('workouts').delete(w.id)),
    ...weights.map((w) => tx.objectStore('weights').delete(w.id)),
  ]);
  
  await tx.done;
}
