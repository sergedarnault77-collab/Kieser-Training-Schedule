import { useState, useEffect, useCallback } from 'react';
import type { WorkoutEntry, ExerciseStats, WorkoutSession, Exercise } from '../types/workout';
import { KIESER_EXERCISES } from '../types/workout';

const STORAGE_KEY = 'kieser_workout_entries';
const SEEDED_KEY = 'kieser_data_seeded';

// Historical data from paper logs
const HISTORICAL_SESSIONS = [
  {
    date: new Date('2026-01-21'),
    exercises: [
      { exerciseId: 'A3', weightKg: 80, timeSeconds: 120 },
      { exerciseId: 'B6', weightKg: 180, timeSeconds: 120 },
      { exerciseId: 'F3.1', weightKg: 120, timeSeconds: 120 },
      { exerciseId: 'F2.1', weightKg: 50, timeSeconds: 120 },
      { exerciseId: 'C2', weightKg: 140, timeSeconds: 120 },
      { exerciseId: 'C5', weightKg: 60, timeSeconds: 120 },
      { exerciseId: 'D6', weightKg: 80, timeSeconds: 120 },
      { exerciseId: 'J1', weightKg: 40, timeSeconds: 120 },
    ],
  },
  {
    date: new Date('2026-01-23'),
    exercises: [
      { exerciseId: 'A3', weightKg: 82, timeSeconds: 120 },
      { exerciseId: 'B6', weightKg: 184, timeSeconds: 120 },
      { exerciseId: 'F3.1', weightKg: 126, timeSeconds: 120 },
      { exerciseId: 'F2.1', weightKg: 54, timeSeconds: 120 },
      { exerciseId: 'C2', weightKg: 150, timeSeconds: 120 },
      { exerciseId: 'C5', weightKg: 64, timeSeconds: 120 },
      { exerciseId: 'D6', weightKg: 100, timeSeconds: 120 },
      { exerciseId: 'J1', weightKg: 46, timeSeconds: 120 },
    ],
  },
];

function generateHistoricalEntries(): WorkoutEntry[] {
  const entries: WorkoutEntry[] = [];
  
  HISTORICAL_SESSIONS.forEach((session) => {
    session.exercises.forEach((exercise) => {
      entries.push({
        id: crypto.randomUUID(),
        date: session.date,
        exerciseId: exercise.exerciseId,
        weightKg: exercise.weightKg,
        timeSeconds: exercise.timeSeconds,
      });
    });
  });
  
  return entries;
}

export function useWorkout() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage and seed historical data if needed
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const hasBeenSeeded = localStorage.getItem(SEEDED_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setEntries(
        parsed.map((e: WorkoutEntry) => ({
          ...e,
          date: new Date(e.date),
        }))
      );
      
      // If we have stored data but haven't seeded yet, merge historical data
      if (!hasBeenSeeded) {
        const historicalEntries = generateHistoricalEntries();
        const existingDates = new Set(parsed.map((e: WorkoutEntry) => new Date(e.date).toDateString()));
        
        // Only add historical entries for dates that don't exist
        const newEntries = historicalEntries.filter(
          (entry) => !existingDates.has(entry.date.toDateString())
        );
        
        if (newEntries.length > 0) {
          const merged = [...parsed.map((e: WorkoutEntry) => ({ ...e, date: new Date(e.date) })), ...newEntries];
          setEntries(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        localStorage.setItem(SEEDED_KEY, 'true');
      }
    } else {
      // No stored data, seed with historical entries
      const historicalEntries = generateHistoricalEntries();
      setEntries(historicalEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historicalEntries));
      localStorage.setItem(SEEDED_KEY, 'true');
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded && entries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const addEntry = useCallback((entry: Omit<WorkoutEntry, 'id'>) => {
    const newEntry: WorkoutEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<WorkoutEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const getExerciseEntries = useCallback(
    (exerciseId: string): WorkoutEntry[] => {
      return entries
        .filter((e) => e.exerciseId === exerciseId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [entries]
  );

  const getExerciseStats = useCallback(
    (exerciseId: string): ExerciseStats => {
      const exerciseEntries = getExerciseEntries(exerciseId);
      
      if (exerciseEntries.length === 0) {
        return {
          exerciseId,
          lastWeight: null,
          lastTime: null,
          bestWeight: 0,
          bestTime: 0,
          totalSessions: 0,
          trend: 'new',
          recentEntries: [],
        };
      }

      const lastEntry = exerciseEntries[0];
      const bestWeight = Math.max(...exerciseEntries.map((e) => e.weightKg));
      const bestTime = Math.max(...exerciseEntries.map((e) => e.timeSeconds));

      // Calculate trend based on last 4 entries
      let trend: 'up' | 'down' | 'steady' | 'new' = 'steady';
      if (exerciseEntries.length >= 2) {
        const recent = exerciseEntries.slice(0, 4);
        const avgRecent = recent.reduce((sum, e) => sum + e.weightKg, 0) / recent.length;
        const older = exerciseEntries.slice(4, 8);
        if (older.length > 0) {
          const avgOlder = older.reduce((sum, e) => sum + e.weightKg, 0) / older.length;
          if (avgRecent > avgOlder * 1.05) trend = 'up';
          else if (avgRecent < avgOlder * 0.95) trend = 'down';
        }
      } else {
        trend = 'new';
      }

      return {
        exerciseId,
        lastWeight: lastEntry.weightKg,
        lastTime: lastEntry.timeSeconds,
        bestWeight,
        bestTime,
        totalSessions: exerciseEntries.length,
        trend,
        recentEntries: exerciseEntries.slice(0, 10),
      };
    },
    [getExerciseEntries]
  );

  const getAllStats = useCallback((): Map<string, ExerciseStats> => {
    const statsMap = new Map<string, ExerciseStats>();
    KIESER_EXERCISES.forEach((exercise) => {
      statsMap.set(exercise.id, getExerciseStats(exercise.id));
    });
    return statsMap;
  }, [getExerciseStats]);

  const getWorkoutSessions = useCallback((): WorkoutSession[] => {
    const sessionMap = new Map<string, WorkoutEntry[]>();
    
    entries.forEach((entry) => {
      const dateKey = new Date(entry.date).toDateString();
      const existing = sessionMap.get(dateKey) || [];
      sessionMap.set(dateKey, [...existing, entry]);
    });

    const sessions: WorkoutSession[] = [];
    sessionMap.forEach((sessionEntries, dateKey) => {
      const totalVolume = sessionEntries.reduce((sum, e) => sum + e.weightKg, 0);
      const avgTime = sessionEntries.reduce((sum, e) => sum + e.timeSeconds, 0) / sessionEntries.length;
      
      sessions.push({
        date: new Date(dateKey),
        entries: sessionEntries,
        totalVolume,
        totalSets: sessionEntries.length,
        avgTime,
      });
    });

    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  const getLastSessionForExercise = useCallback(
    (exerciseId: string): WorkoutEntry | null => {
      const exerciseEntries = getExerciseEntries(exerciseId);
      return exerciseEntries[0] || null;
    },
    [getExerciseEntries]
  );

  const getTodayEntries = useCallback((): WorkoutEntry[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= today && entryDate < tomorrow;
    });
  }, [entries]);

  const exportData = useCallback(() => {
    return JSON.stringify(entries, null, 2);
  }, [entries]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const imported = parsed.map((e: WorkoutEntry) => ({
        ...e,
        id: e.id || crypto.randomUUID(),
        date: new Date(e.date),
      }));
      setEntries(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    entries,
    isLoaded,
    addEntry,
    deleteEntry,
    updateEntry,
    getExerciseEntries,
    getExerciseStats,
    getAllStats,
    getWorkoutSessions,
    getLastSessionForExercise,
    getTodayEntries,
    exportData,
    importData,
    exercises: KIESER_EXERCISES,
  };
}
