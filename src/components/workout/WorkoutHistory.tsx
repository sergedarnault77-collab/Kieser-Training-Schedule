import { Calendar, Dumbbell, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WorkoutSession, Exercise } from '@/types/workout';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  onSelectExercise: (exerciseId: string) => void;
}

export function WorkoutHistory({ sessions, exercises, onSelectExercise }: WorkoutHistoryProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getExerciseName = (id: string) => {
    return exercises.find((e) => e.id === id)?.name || id;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Workout History</h2>
      </div>

      {sessions.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {sessions.map((session) => (
              <Card
                key={session.date.toISOString()}
                className="bg-slate-800/50 border-slate-700/50"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {formatDate(session.date)}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        <span>{session.totalSets} sets</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{session.totalVolume} kg</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(session.avgTime)}s avg</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {session.entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => onSelectExercise(entry.exerciseId)}
                        className="text-left p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-mono text-xs">
                            {entry.exerciseId}
                          </span>
                          <span className="text-slate-300 text-sm truncate">
                            {getExerciseName(entry.exerciseId)}
                          </span>
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {entry.weightKg} kg
                          <span className="text-slate-400 text-xs font-normal ml-2">
                            {entry.timeSeconds}s
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-400 font-medium mb-1">No workouts yet</h3>
            <p className="text-slate-500 text-sm">
              Start logging your first session!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
