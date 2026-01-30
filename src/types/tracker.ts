// Generic tracking types for building tracking applications

export interface TrackedItem {
  id: string;
  presetId?: string; // Reference to a preset if used
  customName?: string; // Custom name if not using preset
  amount: number;
  unit: string; // e.g., "mg", "ml", "units", "servings"
  timestamp: Date;
  notes?: string;
}

export interface Preset {
  id: string;
  name: string;
  category?: string;
  defaultAmount: number;
  unit: string;
  icon?: string;
  color?: string;
}

export interface DailyLimit {
  maxAmount: number;
  unit: string;
  warningThreshold?: number; // Percentage (0-100) to show warning
}

export interface TimelineEntry {
  timestamp: Date;
  level: number; // Calculated level at this time
  source?: TrackedItem; // The item that contributed to this level
}

export interface Report {
  period: "daily" | "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  averagePerDay: number;
  peakAmount: number;
  peakDate: Date;
  itemsByPreset: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100 for progressive achievements
  criteria: {
    type: "streak" | "total" | "limit" | "custom";
    target: number;
    current: number;
  };
}

export interface Settings {
  dailyLimit?: DailyLimit;
  presets: Preset[];
  theme: "light" | "dark" | "system";
  notifications: {
    enabled: boolean;
    reminderTimes?: string[]; // e.g., ["09:00", "15:00"]
    limitWarning: boolean;
  };
  timelineCalculation?: {
    decayRate?: number; // For items that decay over time (e.g., caffeine half-life)
    decayUnit?: "hours" | "minutes";
  };
}

export interface AppConfig {
  appName: string;
  itemName: string; // e.g., "Drink", "Meal", "Activity"
  itemNamePlural: string; // e.g., "Drinks", "Meals", "Activities"
  defaultUnit: string;
  enableTimeline: boolean;
  enableAchievements: boolean;
  enableReports: boolean;
  enableExport: boolean;
  defaultPresets: Preset[];
}
