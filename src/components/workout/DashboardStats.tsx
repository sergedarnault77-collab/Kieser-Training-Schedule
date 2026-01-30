import { Flame, Target, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ExerciseStats, WorkoutSession } from '@/types/workout';

interface DashboardStatsProps {
  allStats: Map<string, ExerciseStats>;
  sessions: WorkoutSession[];
}

export function DashboardStats({ allStats, sessions }: DashboardStatsProps) {
  // Calculate stats
  const totalSessions = sessions.length;
  
  const thisWeekSessions = sessions.filter((s) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return s.date >= weekAgo;
  }).length;

  const exercisesImproving = Array.from(allStats.values()).filter(
    (s) => s.trend === 'up'
  ).length;

  const totalPRs = Array.from(allStats.values()).filter(
    (s) => s.totalSessions > 0 && s.lastWeight === s.bestWeight
  ).length;

  const stats = [
    {
      icon: Flame,
      label: 'This Week',
      value: thisWeekSessions,
      suffix: 'sessions',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Target,
      label: 'Total Sessions',
      value: totalSessions,
      suffix: 'workouts',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Improving',
      value: exercisesImproving,
      suffix: 'exercises',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Award,
      label: 'Recent PRs',
      value: totalPRs,
      suffix: 'personal bests',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.suffix}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
