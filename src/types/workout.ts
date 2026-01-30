// Kieser Training Workout Types

export interface Exercise {
  id: string;
  name: string;
  optional?: boolean;
  machineSettings?: string;
}

export interface WorkoutEntry {
  id: string;
  date: Date;
  exerciseId: string;
  weightKg: number;
  timeSeconds: number;
  notes?: string;
}

export interface ExerciseStats {
  exerciseId: string;
  lastWeight: number | null;
  lastTime: number | null;
  bestWeight: number;
  bestTime: number;
  totalSessions: number;
  trend: 'up' | 'down' | 'steady' | 'new';
  recentEntries: WorkoutEntry[];
}

export interface WorkoutSession {
  date: Date;
  entries: WorkoutEntry[];
  totalVolume: number;
  totalSets: number;
  avgTime: number;
}

export const KIESER_EXERCISES: Exercise[] = [
  { id: 'A3', name: 'Leg Press', machineSettings: 'Lehne, Beine, Loch' },
  { id: 'B6', name: 'Back/Lat Pull-Row', machineSettings: '2 Sitz, 3 Lehne, 3 Schultern' },
  { id: 'F3.1', name: 'Back Extension', machineSettings: '16 Sitzp., 2 Fuß, 8 Beine' },
  { id: 'F2.1', name: 'Leg Curl', machineSettings: 'Sitzp., Loch, Fuß' },
  { id: 'C2', name: 'Chest Press', machineSettings: 'nein Sitz, 5 Griffe, 8 Hebel' },
  { id: 'C5', name: 'Shoulder/Arms', machineSettings: 'Sitz, Polster, Arme' },
  { id: 'D6', name: 'Grip/Arms', machineSettings: '5 Sitz, 13 Lehne, horiz. Griffe' },
  { id: 'J1', name: 'Rotation/Core', optional: true, machineSettings: 'Turm' },
];
