import { ArrowLeft, TrendingUp, Trophy, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Exercise, ExerciseStats } from '@/types/workout';

interface ExerciseHistoryProps {
  exercise: Exercise;
  stats: ExerciseStats;
  onBack: () => void;
}

export function ExerciseHistory({ exercise, stats, onBack }: ExerciseHistoryProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  // Simple progress visualization
  const maxWeight = stats.bestWeight || 1;
  const entries = stats.recentEntries || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono font-semibold">{exercise.id}</span>
                <h1 className="text-lg font-semibold">{exercise.name}</h1>
              </div>
              {exercise.machineSettings && (
                <p className="text-xs text-slate-500">{exercise.machineSettings}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs">Best Weight</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.bestWeight > 0 ? `${stats.bestWeight} kg` : '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs">Best Time</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.bestTime > 0 ? `${stats.bestTime}s` : '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Trend (4 weeks)</span>
              </div>
              <div className="text-xl font-bold">
                {stats.trend === 'up' && <span className="text-emerald-400">↑ Improving</span>}
                {stats.trend === 'down' && <span className="text-red-400">↓ Declining</span>}
                {stats.trend === 'steady' && <span className="text-slate-300">→ Steady</span>}
                {stats.trend === 'new' && <span className="text-cyan-400">New</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-xs">Total Sessions</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.totalSessions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart (Simple Bar) */}
        {entries.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {entries.slice(0, 10).reverse().map((entry, idx) => {
                  const height = (entry.weightKg / maxWeight) * 100;
                  const isLast = idx === entries.slice(0, 10).length - 1;
                  return (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-500">{entry.weightKg}</span>
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          isLast ? 'bg-cyan-500' : 'bg-slate-600'
                        }`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500 text-center mt-2">
                Last {Math.min(entries.length, 10)} sessions
              </div>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Session History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {entries.length > 0 ? (
                <div className="divide-y divide-slate-700/50">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`px-4 py-3 flex items-center justify-between ${
                        idx === 0 ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm text-slate-400">{formatDate(entry.date)}</div>
                        {entry.notes && (
                          <div className="text-xs text-slate-500 mt-1">{entry.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{entry.weightKg} kg</div>
                        <div className="text-xs text-slate-400">{entry.timeSeconds}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No sessions recorded yet. Start logging!
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
