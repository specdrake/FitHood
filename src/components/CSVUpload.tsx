'use client';

import { useState, useRef } from 'react';
import { parseFoodCSV, parseWorkoutCSV } from '@/lib/csv-parser';
import { addFoodEntries, addWorkoutEntries } from '@/lib/db';
import { FoodEntry, WorkoutEntry } from '@/lib/types';

interface CSVUploadProps {
  userId: string;
  onUploadComplete: () => void;
}

export default function CSVUpload({ userId, onUploadComplete }: CSVUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preview, setPreview] = useState<{ type: 'food' | 'workout'; data: FoodEntry[] | WorkoutEntry[] } | null>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const workoutInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'food' | 'workout'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const content = await file.text();
      
      if (type === 'food') {
        const entries = parseFoodCSV(content);
        setPreview({ type: 'food', data: entries });
      } else {
        const entries = parseWorkoutCSV(content);
        setPreview({ type: 'workout', data: entries });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to parse CSV: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!preview) return;

    setIsLoading(true);
    try {
      if (preview.type === 'food') {
        await addFoodEntries(userId, preview.data as FoodEntry[]);
        setMessage({ type: 'success', text: `Added ${preview.data.length} food entries!` });
      } else {
        await addWorkoutEntries(userId, preview.data as WorkoutEntry[]);
        setMessage({ type: 'success', text: `Added ${preview.data.length} workout entries!` });
      }
      setPreview(null);
      onUploadComplete();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save data: ${error}` });
    } finally {
      setIsLoading(false);
      // Reset file inputs
      if (foodInputRef.current) foodInputRef.current.value = '';
      if (workoutInputRef.current) workoutInputRef.current.value = '';
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    if (foodInputRef.current) foodInputRef.current.value = '';
    if (workoutInputRef.current) workoutInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl text-gradient mb-2">Upload Data</h2>
        <p className="text-gray-400">Import your food and workout CSV files</p>
      </div>

      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Food Upload */}
        <div className="glass rounded-2xl p-6 glass-hover transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-coral/20 to-coral/5 flex items-center justify-center text-3xl">
              🍎
            </div>
            <div>
              <h3 className="font-semibold text-lg">Food Data</h3>
              <p className="text-sm text-gray-400">Calories, macros & nutrition</p>
            </div>
          </div>
          
          <label className="block">
            <input
              ref={foodInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'food')}
              disabled={isLoading}
            />
            <div className="border-2 border-dashed border-gray-600 hover:border-electric/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-electric/5">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-sm text-gray-400">Click to upload food CSV</p>
              <p className="text-xs text-gray-500 mt-2">
                Columns: date, name, calories, protein, carbs, fat
              </p>
            </div>
          </label>
        </div>

        {/* Workout Upload */}
        <div className="glass rounded-2xl p-6 glass-hover transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 flex items-center justify-center text-3xl">
              💪
            </div>
            <div>
              <h3 className="font-semibold text-lg">Workout Data</h3>
              <p className="text-sm text-gray-400">Exercises, sets & reps</p>
            </div>
          </div>
          
          <label className="block">
            <input
              ref={workoutInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'workout')}
              disabled={isLoading}
            />
            <div className="border-2 border-dashed border-gray-600 hover:border-neon-cyan/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:bg-neon-cyan/5">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-sm text-gray-400">Click to upload workout CSV</p>
              <p className="text-xs text-gray-500 mt-2">
                Columns: date, exercise, category, sets, reps, weight, caloriesBurned
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl p-4 text-center ${
            message.type === 'success'
              ? 'bg-electric/20 text-electric border border-electric/30'
              : 'bg-coral/20 text-coral border border-coral/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>{preview.type === 'food' ? '🍎' : '💪'}</span>
            Preview: {preview.data.length} {preview.type} entries
          </h3>
          
          <div className="max-h-64 overflow-y-auto mb-4 rounded-lg bg-midnight/50 p-3">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">
                    {preview.type === 'food' ? 'Food' : 'Exercise'}
                  </th>
                  {preview.type === 'food' ? (
                    <>
                      <th className="text-right py-2 px-2">Cal</th>
                      <th className="text-right py-2 px-2">P</th>
                      <th className="text-right py-2 px-2">C</th>
                      <th className="text-right py-2 px-2">F</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-right py-2 px-2">Sets</th>
                      <th className="text-right py-2 px-2">Reps</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 10).map((entry, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 px-2 text-gray-400">{entry.date}</td>
                    <td className="py-2 px-2">
                      {'name' in entry ? entry.name : entry.exercise}
                    </td>
                    {preview.type === 'food' && 'calories' in entry ? (
                      <>
                        <td className="py-2 px-2 text-right text-electric">{entry.calories}</td>
                        <td className="py-2 px-2 text-right text-coral">{entry.protein}g</td>
                        <td className="py-2 px-2 text-right text-amber-glow">{entry.carbs}g</td>
                        <td className="py-2 px-2 text-right text-neon-cyan">{entry.fat}g</td>
                      </>
                    ) : 'category' in entry ? (
                      <>
                        <td className="py-2 px-2 capitalize text-gray-400">{entry.category}</td>
                        <td className="py-2 px-2 text-right">{entry.sets || '-'}</td>
                        <td className="py-2 px-2 text-right">{entry.reps || '-'}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.data.length > 10 && (
              <p className="text-center text-gray-500 text-sm py-2">
                ... and {preview.data.length - 10} more entries
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancelPreview}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-electric to-neon-cyan text-midnight font-semibold hover:glow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      )}

      {/* CSV Format Help */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">📋 CSV Format Guide</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-electric font-medium mb-2">Food CSV</h4>
            <pre className="bg-midnight/50 p-3 rounded-lg overflow-x-auto text-xs text-gray-400">
{`date,name,calories,protein,carbs,fat
2024-01-15,Chicken Breast,165,31,0,3.6
2024-01-15,Brown Rice,216,5,45,1.8
2024-01-15,Broccoli,55,4,11,0.5`}
            </pre>
          </div>
          <div>
            <h4 className="text-neon-cyan font-medium mb-2">Workout CSV</h4>
            <pre className="bg-midnight/50 p-3 rounded-lg overflow-x-auto text-xs text-gray-400">
{`date,exercise,category,sets,reps,weight,caloriesBurned
2024-01-15,Bench Press,strength,4,10,60,150
2024-01-15,Squats,strength,4,8,80,200
2024-01-15,Running,cardio,1,,,300`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
