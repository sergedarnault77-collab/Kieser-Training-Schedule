import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Dumbbell, History, LayoutDashboard, Settings, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkout } from '@/hooks/use-workout';
import { QuickLogCard } from '@/components/workout/QuickLogCard';
import { ExerciseHistory } from '@/components/workout/ExerciseHistory';
import { WorkoutHistory } from '@/components/workout/WorkoutHistory';
import { DashboardStats } from '@/components/workout/DashboardStats';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const {
    addEntry,
    getExerciseStats,
    getAllStats,
    getWorkoutSessions,
    getTodayEntries,
    exercises,
    exportData,
    importData,
  } = useWorkout();

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('quick-log');
  const [showSettings, setShowSettings] = useState(false);
  const [importText, setImportText] = useState('');

  const todayEntries = getTodayEntries();
  const todayExerciseIds = new Set(todayEntries.map((e) => e.exerciseId));
  
  const allStats = useMemo(() => getAllStats(), [getAllStats]);
  const sessions = useMemo(() => getWorkoutSessions(), [getWorkoutSessions]);

  const handleLog = (exerciseId: string, weightKg: number, timeSeconds: number, notes?: string) => {
    addEntry({
      date: new Date(),
      exerciseId,
      weightKg,
      timeSeconds,
      notes,
    });
    toast.success(`Logged ${weightKg}kg for ${exerciseId}`, {
      description: `${timeSeconds} seconds`,
    });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kieser-workout-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = () => {
    if (importData(importText)) {
      toast.success('Data imported successfully');
      setImportText('');
      setShowSettings(false);
    } else {
      toast.error('Failed to import data. Check the format.');
    }
  };

  // Show exercise detail view
  if (selectedExercise) {
    const exercise = exercises.find((e) => e.id === selectedExercise);
    const stats = getExerciseStats(selectedExercise);
    if (exercise) {
      return (
        <ExerciseHistory
          exercise={exercise}
          stats={stats}
          onBack={() => setSelectedExercise(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">True North Strength</h1>
                <p className="text-xs text-slate-400">Kieser Training Tracker</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="quick-log" className="mt-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Log</h2>
                <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="text-sm text-slate-400">
                {todayExerciseIds.size}/{exercises.length} today
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {exercises.map((exercise) => (
                <QuickLogCard
                  key={exercise.id}
                  exercise={exercise}
                  stats={allStats.get(exercise.id) || getExerciseStats(exercise.id)}
                  onLog={handleLog}
                  isLoggedToday={todayExerciseIds.has(exercise.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0 p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <DashboardStats allStats={allStats} sessions={sessions} />
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3">All Exercises</h3>
              <div className="space-y-2">
                {exercises.map((exercise) => {
                  const stats = allStats.get(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise.id)}
                      className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-mono text-sm font-semibold">
                          {exercise.id}
                        </span>
                        <span className="text-white text-sm">{exercise.name}</span>
                      </div>
                      <div className="text-right">
                        {stats && stats.lastWeight !== null ? (
                          <>
                            <span className="text-white font-semibold">{stats.lastWeight} kg</span>
                            <span className="text-slate-500 text-xs ml-2">
                              best: {stats.bestWeight}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 text-sm">No data</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <WorkoutHistory
              sessions={sessions}
              exercises={exercises}
              onSelectExercise={setSelectedExercise}
            />
          </TabsContent>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-2 z-20">
            <TabsList className="w-full bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="quick-log"
                className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 text-slate-500"
              >
                <Dumbbell className="w-5 h-5" />
                <span className="text-xs">Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 text-slate-500"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 flex flex-col items-center gap-1 py-2 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 text-slate-500"
              >
                <History className="w-5 h-5" />
                <span className="text-xs">History</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Export or import your workout data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button
              onClick={handleExport}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <div className="space-y-2">
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON data here to import..."
                className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
              />
              <Button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
