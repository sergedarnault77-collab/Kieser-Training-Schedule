import { useState } from 'react';
import { Plus, Check, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Exercise, ExerciseStats } from '@/types/workout';

interface QuickLogCardProps {
  exercise: Exercise;
  stats: ExerciseStats;
  onLog: (exerciseId: string, weightKg: number, timeSeconds: number, notes?: string) => void;
  isLoggedToday: boolean;
}

export function QuickLogCard({ exercise, stats, onLog, isLoggedToday }: QuickLogCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState(stats.lastWeight?.toString() || '');
  const [time, setTime] = useState(stats.lastTime?.toString() || '120');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const weightNum = parseFloat(weight) || 0;
    const timeNum = parseInt(time) || 120;
    onLog(exercise.id, weightNum, timeNum, notes || undefined);
    setIsOpen(false);
    setNotes('');
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <span className="text-emerald-400 text-sm font-medium">↑</span>;
      case 'down':
        return <span className="text-red-400 text-sm font-medium">↓</span>;
      case 'steady':
        return <span className="text-slate-400 text-sm font-medium">→</span>;
      default:
        return <span className="text-cyan-400 text-sm font-medium">NEW</span>;
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <Card 
        className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group ${
          isLoggedToday ? 'ring-1 ring-emerald-500/50' : ''
        } ${exercise.optional ? 'opacity-70' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-cyan-400 font-mono text-sm font-semibold">{exercise.id}</span>
                {isLoggedToday && <Check className="w-4 h-4 text-emerald-400" />}
                {getTrendIcon()}
              </div>
              <h3 className="text-white font-medium text-sm leading-tight mb-1">
                {exercise.name}
                {exercise.optional && <span className="text-slate-500 text-xs ml-1">(opt)</span>}
              </h3>
              <p className="text-cyan-400/70 text-xs mb-2">{today}</p>
              
              {stats.lastWeight !== null ? (
                <div className="flex items-baseline gap-3">
                  <div>
                    <span className="text-2xl font-bold text-white">{stats.lastWeight}</span>
                    <span className="text-slate-400 text-sm ml-1">kg</span>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {stats.lastTime}s
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No data yet</div>
              )}
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-mono">{exercise.id}</span>
              <span>{exercise.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-slate-300">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="5"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white text-2xl font-bold h-14 text-center"
                placeholder={stats.lastWeight?.toString() || '0'}
                autoFocus
              />
              {stats.lastWeight !== null && (
                <p className="text-xs text-slate-500">Last: {stats.lastWeight} kg • Best: {stats.bestWeight} kg</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-slate-300">Time (seconds)</Label>
              <Input
                id="time"
                type="number"
                step="5"
                min="0"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white text-xl h-12 text-center"
                placeholder="120"
              />
              <p className="text-xs text-slate-500">Target: 90-120 seconds (Tempo 4-2-4-2)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">Notes (optional)</Label>
              <Input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="e.g., felt strong, adjust seat..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
