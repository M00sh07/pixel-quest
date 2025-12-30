import React from "react";
import { Habit, HabitStats } from "@/types/productivity";
import { HabitCard } from "./HabitCard";
import { AddHabitForm } from "./AddHabitForm";
import { Flame, Target } from "lucide-react";

interface HabitPanelProps {
  habits: (Habit & { completedToday: boolean })[];
  getStats: (id: string) => HabitStats | null;
  onComplete: (id: string, value?: number) => void;
  onMiss: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (data: Parameters<typeof AddHabitForm>[0]["onAdd"] extends (data: infer D) => void ? D : never) => void;
}

export const HabitPanel: React.FC<HabitPanelProps> = ({
  habits,
  getStats,
  onComplete,
  onMiss,
  onDelete,
  onAdd,
}) => {
  const todayProgress = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? Math.round((todayProgress / totalHabits) * 100) : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-card pixel-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-quest-xp" />
            Daily Habits
          </h2>
          <div className="flex items-center gap-2 text-[10px]">
            <Flame className="w-3 h-3 text-quest-legendary" />
            <span className="text-quest-legendary">{totalStreak} total streak</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Today's Progress</span>
            <span>{todayProgress}/{totalHabits} ({progressPercent}%)</span>
          </div>
          <div className="h-3 bg-muted border border-border">
            <div
              className="h-full bg-quest-xp transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      <AddHabitForm onAdd={onAdd} />

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No habits yet. Start building positive routines!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={getStats(habit.id)}
              onComplete={onComplete}
              onMiss={onMiss}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};