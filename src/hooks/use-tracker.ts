import { useState, useEffect } from "react";
import type {
  TrackedItem,
  Preset,
  Settings,
  Report,
  Achievement,
  AppConfig,
} from "../types/tracker";

const STORAGE_PREFIX = "tracker_";

export function useTracker(config: AppConfig) {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    presets: config.defaultPresets,
    theme: "system",
    notifications: {
      enabled: false,
      limitWarning: true,
    },
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem(`${STORAGE_PREFIX}items`);
    const storedSettings = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    const storedAchievements = localStorage.getItem(
      `${STORAGE_PREFIX}achievements`
    );

    if (storedItems) {
      const parsed = JSON.parse(storedItems);
      // Convert timestamp strings back to Date objects
      setItems(
        parsed.map((item: TrackedItem) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      );
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings({
        presets: config.defaultPresets,
        theme: "system",
        notifications: {
          enabled: false,
          limitWarning: true,
        },
      });
    }

    if (storedAchievements) {
      const parsed = JSON.parse(storedAchievements);
      setAchievements(
        parsed.map((ach: Achievement) => ({
          ...ach,
          unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : undefined,
        }))
      );
    }
  }, [config.defaultPresets]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX}settings`,
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX}achievements`,
      JSON.stringify(achievements)
    );
  }, [achievements]);

  const addItem = (item: Omit<TrackedItem, "id">) => {
    const newItem: TrackedItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<TrackedItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const getItemsForDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return items.filter(
      (item) => item.timestamp >= start && item.timestamp <= end
    );
  };

  const getDailyTotal = (date: Date = new Date()) => {
    const dayItems = getItemsForDay(date);
    return dayItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const generateReport = (
    period: "daily" | "weekly" | "monthly",
    endDate: Date = new Date()
  ): Report => {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    switch (period) {
      case "daily":
        start.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
    }

    const periodItems = items.filter(
      (item) => item.timestamp >= start && item.timestamp <= end
    );

    const totalAmount = periodItems.reduce((sum, item) => sum + item.amount, 0);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) ||
      1;

    const itemsByPreset: Record<string, number> = {};
    let peakAmount = 0;
    let peakDate = start;

    periodItems.forEach((item) => {
      const key = item.presetId || item.customName || "other";
      itemsByPreset[key] = (itemsByPreset[key] || 0) + item.amount;
    });

    // Calculate peak day
    const dayTotals = new Map<string, number>();
    periodItems.forEach((item) => {
      const dayKey = new Date(item.timestamp).toDateString();
      dayTotals.set(dayKey, (dayTotals.get(dayKey) || 0) + item.amount);
    });

    dayTotals.forEach((amount, dateStr) => {
      if (amount > peakAmount) {
        peakAmount = amount;
        peakDate = new Date(dateStr);
      }
    });

    return {
      period,
      startDate: start,
      endDate: end,
      totalAmount,
      averagePerDay: totalAmount / days,
      peakAmount,
      peakDate,
      itemsByPreset,
    };
  };

  const exportData = () => {
    const data = {
      items,
      settings,
      achievements,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.items) {
        setItems(
          data.items.map((item: TrackedItem) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.achievements) {
        setAchievements(
          data.achievements.map((ach: Achievement) => ({
            ...ach,
            unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : undefined,
          }))
        );
      }
      return true;
    } catch {
      return false;
    }
  };

  const addPreset = (preset: Omit<Preset, "id">) => {
    const newPreset: Preset = {
      ...preset,
      id: crypto.randomUUID(),
    };
    setSettings((prev) => ({
      ...prev,
      presets: [...prev.presets, newPreset],
    }));
  };

  const deletePreset = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
  };

  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === id && !ach.unlocked
          ? { ...ach, unlocked: true, unlockedAt: new Date() }
          : ach
      )
    );
  };

  return {
    items,
    settings,
    achievements,
    addItem,
    deleteItem,
    updateItem,
    getItemsForDay,
    getDailyTotal,
    generateReport,
    exportData,
    importData,
    addPreset,
    deletePreset,
    updateSettings: setSettings,
    unlockAchievement,
  };
}
