import React, { useState } from "react";
import { useTracker } from "@/hooks/use-tracker";
import { LogItemDialog } from "@/components/tracker/LogItemDialog";
import { ProgressCard } from "@/components/tracker/ProgressCard";
import { ItemsList } from "@/components/tracker/ItemsList";
import { ReportsCard } from "@/components/tracker/ReportsCard";
import { AchievementsCard } from "@/components/tracker/AchievementsCard";
import { SettingsCard } from "@/components/tracker/SettingsCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { createTrackerConfig } from "@/config/tracker-config.example";

const TrackerApp: React.FC = () => {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const { config: trackerConfig, achievements } = createTrackerConfig();
  const tracker = useTracker(trackerConfig);

  const todaysTotal = tracker.getDailyTotal();
  const todaysItems = tracker.getItemsForDay(new Date());

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{trackerConfig.appName}</h1>
          <p className="text-muted-foreground">
            Track and analyze your {trackerConfig.itemNamePlural.toLowerCase()}
          </p>
        </header>

        <div className="mb-6">
          <Button onClick={() => setLogDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Log {trackerConfig.itemName}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressCard
              currentAmount={todaysTotal}
              limit={tracker.settings.dailyLimit}
              itemNamePlural={trackerConfig.itemNamePlural}
            />

            <ItemsList
              items={todaysItems}
              presets={tracker.settings.presets}
              onDelete={tracker.deleteItem}
              itemName={trackerConfig.itemName}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsCard
              generateReport={tracker.generateReport}
              presets={tracker.settings.presets}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsCard achievements={achievements} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsCard
              settings={tracker.settings}
              onUpdateSettings={tracker.updateSettings}
              onExport={tracker.exportData}
              onImport={tracker.importData}
              defaultUnit={trackerConfig.defaultUnit}
            />
          </TabsContent>
        </Tabs>

        <LogItemDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          presets={tracker.settings.presets}
          onSubmit={tracker.addItem}
          itemName={trackerConfig.itemName}
          defaultUnit={trackerConfig.defaultUnit}
        />
      </div>
    </div>
  );
};

export default TrackerApp;
