import { useState, useEffect, useCallback } from "react";
import { Habit, HabitCompletion, HabitStats } from "@/types/productivity";

const today = () => new Date().toISOString().split("T")[0];

const calculateMomentum = (habit: Habit): number => {
  const baseMultiplier = 1;
  const streakBonus = Math.min(habit.currentStreak * habit.momentumGrowthRate, 1);
  return baseMultiplier + streakBonus;
};

const calculateStreakDecay = (currentStreak: number, decayRate: number): number => {
  return Math.max(0, Math.floor(currentStreak * (1 - decayRate)));
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("productivity-habits");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("productivity-habits", JSON.stringify(habits));
  }, [habits]);

  // Check for missed habits on load
  useEffect(() => {
    const todayStr = today();
    setHabits(prev => prev.map(habit => {
      if (!habit.lastCompletedDate) return habit;
      
      const lastDate = new Date(habit.lastCompletedDate);
      const currentDate = new Date(todayStr);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > habit.missToleranceDays + 1) {
        const missCount = daysDiff - habit.missToleranceDays - 1;
        let newStreak = habit.currentStreak;
        for (let i = 0; i < missCount; i++) {
          newStreak = calculateStreakDecay(newStreak, habit.streakDecayRate);
        }
        return {
          ...habit,
          currentStreak: newStreak,
          totalMisses: habit.totalMisses + missCount,
          momentumMultiplier: Math.max(1, habit.momentumMultiplier - (missCount * 0.1)),
        };
      }
      return habit;
    }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, "id" | "createdAt" | "currentStreak" | "bestStreak" | "totalCompletions" | "totalMisses" | "completionHistory" | "momentumMultiplier" | "difficultyLevel">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      totalMisses: 0,
      completionHistory: [],
      momentumMultiplier: 1,
      difficultyLevel: 1,
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const completeHabit = useCallback((habitId: string, value?: number): { xp: number; coins: number } => {
    const todayStr = today();
    let rewards = { xp: 0, coins: 0 };

    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const alreadyCompletedToday = habit.completionHistory.some(
        c => c.date === todayStr && c.completed
      );
      if (alreadyCompletedToday) return habit;

      const completion: HabitCompletion = {
        date: todayStr,
        completed: true,
        value: habit.type === "scaled" ? value : undefined,
      };

      const newStreak = habit.currentStreak + 1;
      const newMomentum = calculateMomentum({ ...habit, currentStreak: newStreak });
      
      rewards = {
        xp: Math.round(habit.baseXP * newMomentum * habit.difficultyLevel),
        coins: Math.round(habit.baseCoins * newMomentum),
      };

      return {
        ...habit,
        currentStreak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak),
        totalCompletions: habit.totalCompletions + 1,
        completionHistory: [...habit.completionHistory.slice(-365), completion],
        lastCompletedDate: todayStr,
        momentumMultiplier: newMomentum,
        difficultyLevel: Math.min(5, habit.difficultyLevel + (habit.difficultyScaleRate * (newStreak % 7 === 0 ? 1 : 0))),
        currentValue: habit.type === "scaled" ? value : undefined,
      };
    }));

    return rewards;
  }, []);

  const missHabit = useCallback((habitId: string) => {
    const todayStr = today();
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const completion: HabitCompletion = {
        date: todayStr,
        completed: false,
      };

      return {
        ...habit,
        currentStreak: calculateStreakDecay(habit.currentStreak, habit.streakDecayRate),
        totalMisses: habit.totalMisses + 1,
        completionHistory: [...habit.completionHistory.slice(-365), completion],
        lastMissedDate: todayStr,
        momentumMultiplier: Math.max(1, habit.momentumMultiplier - 0.1),
      };
    }));
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  }, []);

  const getHabitStats = useCallback((habitId: string): HabitStats | null => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;

    const completions = habit.completionHistory.filter(c => c.completed);
    const total = habit.completionHistory.length;
    
    // Find weakest day
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    habit.completionHistory.forEach(c => {
      if (!c.completed) {
        const dayOfWeek = new Date(c.date).getDay();
        dayCount[dayOfWeek]++;
      }
    });
    const weakestDay = dayCount.indexOf(Math.max(...dayCount));

    return {
      successRate: total > 0 ? (completions.length / total) * 100 : 0,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      averageValue: habit.type === "scaled" 
        ? completions.reduce((sum, c) => sum + (c.value || 0), 0) / completions.length 
        : undefined,
      weakestDay,
    };
  }, [habits]);

  const getTodayHabits = useCallback(() => {
    const todayStr = today();
    return habits.map(habit => ({
      ...habit,
      completedToday: habit.completionHistory.some(c => c.date === todayStr && c.completed),
    }));
  }, [habits]);

  return {
    habits,
    addHabit,
    completeHabit,
    missHabit,
    deleteHabit,
    getHabitStats,
    getTodayHabits,
  };
};
