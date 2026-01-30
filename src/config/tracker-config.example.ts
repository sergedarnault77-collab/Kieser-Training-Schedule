import type { AppConfig, Achievement } from "../types/tracker";

/**
 * Configuration function for the tracking application
 *
 * This function should be modified by AI to create the specific tracker configuration
 * based on user requirements. Customize all aspects of the tracker here.
 */
export function createTrackerConfig(): {
  config: AppConfig;
  achievements: Achievement[];
} {
  // TODO: AI will configure this based on user requirements
  const config: AppConfig = {
    appName: "Tracker App",
    itemName: "Item",
    itemNamePlural: "Items",
    defaultUnit: "units",
    enableTimeline: true,
    enableAchievements: true,
    enableReports: true,
    enableExport: true,
    defaultPresets: [],
  };

  // TODO: AI will configure achievements based on tracking goals
  const achievements: Achievement[] = [];

  return { config, achievements };
}
