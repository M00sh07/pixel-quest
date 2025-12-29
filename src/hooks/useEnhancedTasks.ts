import { useState, useEffect, useCallback } from "react";
import { 
  EnhancedTask, 
  TaskDifficulty, 
  EnergyType, 
  TaskPriority, 
  TaskStatus,
  Subtask,
  TaskReflection,
  TaskSuggestion,
  DIFFICULTY_MULTIPLIERS,
  DEFAULT_CATEGORIES
} from "@/types/productivity";
import { QuestRarity, RepeatFrequency, getXPReward } from "@/types/quest";

const today = () => new Date().toISOString().split("T")[0];

export const useEnhancedTasks = () => {
  const [tasks, setTasks] = useState<EnhancedTask[]>(() => {
    const saved = localStorage.getItem("productivity-enhanced-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("productivity-enhanced-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Check for missed deadlines daily
  useEffect(() => {
    const todayDate = new Date();
    setTasks(prev => prev.map(task => {
      if (task.status !== "active") return task;
      
      if (task.hardDeadline && new Date(task.hardDeadline) < todayDate) {
        return { ...task, status: "missed" as TaskStatus };
      }
      return task;
    }));
  }, []);

  const calculateRewards = useCallback((
    difficulty: TaskDifficulty,
    rarity: QuestRarity,
    estimatedMinutes?: number,
    actualMinutes?: number
  ): { xp: number; coins: number } => {
    const baseXP = getXPReward(rarity);
    const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
    
    let timeBonus = 1;
    if (estimatedMinutes && actualMinutes) {
      const efficiency = estimatedMinutes / actualMinutes;
      if (efficiency >= 1) {
        timeBonus = 1 + Math.min((efficiency - 1) * 0.2, 0.3); // Up to 30% bonus
      }
    }

    return {
      xp: Math.round(baseXP * diffMultiplier.xp * timeBonus),
      coins: Math.round(5 * diffMultiplier.coins * timeBonus),
    };
  }, []);

  const createTask = useCallback((data: {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    energyType: EnergyType;
    category: string;
    subcategory?: string;
    rarity: QuestRarity;
    estimatedMinutes?: number;
    softDeadline?: Date;
    hardDeadline?: Date;
    priority: TaskPriority;
    reminderTime?: string;
    repeatFrequency: RepeatFrequency;
    repeatDays?: number[];
    subtasks?: string[];
  }): EnhancedTask => {
    const rewards = calculateRewards(data.difficulty, data.rarity, data.estimatedMinutes);
    
    const task: EnhancedTask = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      energyType: data.energyType,
      category: data.category,
      subcategory: data.subcategory,
      subtasks: (data.subtasks || []).map(title => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      })),
      dependencies: [],
      softDeadline: data.softDeadline,
      hardDeadline: data.hardDeadline,
      priority: data.priority,
      status: "active",
      createdAt: new Date(),
      rarity: data.rarity,
      xpReward: rewards.xp,
      coinReward: rewards.coins,
      reminderTime: data.reminderTime,
      repeatFrequency: data.repeatFrequency,
      repeatDays: data.repeatDays,
      estimatedMinutes: data.estimatedMinutes,
    };

    setTasks(prev => [...prev, task]);
    return task;
  }, [calculateRewards]);

  const startTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, startedAt: new Date() } : task
    ));
  }, []);

  const completeSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        subtasks: task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: true, completedAt: new Date() } : st
        ),
      };
    }));
  }, []);

  const completeTask = useCallback((taskId: string): { xp: number; coins: number } | null => {
    let rewards: { xp: number; coins: number } | null = null;

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId || task.status === "completed") return task;

      const actualMinutes = task.startedAt 
        ? Math.round((Date.now() - new Date(task.startedAt).getTime()) / 60000)
        : undefined;

      rewards = calculateRewards(task.difficulty, task.rarity, task.estimatedMinutes, actualMinutes);

      // For repeating tasks, reset instead of complete
      if (task.repeatFrequency !== "none") {
        return {
          ...task,
          lastCompletedDate: today(),
          subtasks: task.subtasks.map(st => ({ ...st, completed: false, completedAt: undefined })),
          startedAt: undefined,
          actualMinutes: undefined,
        };
      }

      return {
        ...task,
        status: "completed" as TaskStatus,
        completedAt: new Date(),
        actualMinutes,
        xpReward: rewards.xp,
        coinReward: rewards.coins,
      };
    }));

    return rewards;
  }, [calculateRewards]);

  const addReflection = useCallback((taskId: string, reflection: Omit<TaskReflection, "createdAt">) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        reflection: { ...reflection, createdAt: new Date() },
      };
    }));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  }, []);

  const addDependency = useCallback((taskId: string, dependsOnTaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        dependencies: [...task.dependencies, { taskId: dependsOnTaskId, type: "blocked-by" }],
        status: "blocked" as TaskStatus,
      };
    }));
  }, []);

  const deleteTask = useCallback((taskId: string): EnhancedTask | null => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return task || null;
  }, [tasks]);

  const restoreTask = useCallback((task: EnhancedTask) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const getActiveTasks = useCallback((): EnhancedTask[] => {
    return tasks.filter(t => t.status === "active" || t.status === "blocked");
  }, [tasks]);

  const getCompletedTasks = useCallback((): EnhancedTask[] => {
    return tasks.filter(t => t.status === "completed");
  }, [tasks]);

  const getBlockedTasks = useCallback((): EnhancedTask[] => {
    return tasks.filter(t => t.status === "blocked");
  }, [tasks]);

  const getTasksByCategory = useCallback((category: string): EnhancedTask[] => {
    return tasks.filter(t => t.category === category);
  }, [tasks]);

  const getTasksByEnergy = useCallback((energy: EnergyType): EnhancedTask[] => {
    return tasks.filter(t => t.energyType === energy && t.status === "active");
  }, [tasks]);

  const getSuggestedTasks = useCallback((currentEnergy: EnergyType, availableMinutes: number): TaskSuggestion[] => {
    const activeTasks = getActiveTasks();
    const suggestions: TaskSuggestion[] = [];

    // Quick wins (under 15 minutes)
    const quickWins = activeTasks.filter(t => 
      (t.estimatedMinutes || 30) <= 15 && t.status === "active"
    );
    quickWins.forEach((t, i) => {
      if (i < 2) {
        suggestions.push({
          id: crypto.randomUUID(),
          reason: "Quick win - easy to start",
          taskId: t.id,
          priority: 80 - i * 10,
          category: "quick-win",
        });
      }
    });

    // Energy matches
    const energyMatches = activeTasks.filter(t => 
      t.energyType === currentEnergy && t.status === "active"
    );
    energyMatches.forEach((t, i) => {
      if (i < 2) {
        suggestions.push({
          id: crypto.randomUUID(),
          reason: `Matches your ${currentEnergy} energy`,
          taskId: t.id,
          priority: 70 - i * 10,
          category: "energy-match",
        });
      }
    });

    // Time sensitive
    const urgent = activeTasks.filter(t => {
      if (!t.hardDeadline) return false;
      const deadline = new Date(t.hardDeadline);
      const hoursUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursUntil < 48 && hoursUntil > 0;
    });
    urgent.forEach((t, i) => {
      suggestions.push({
        id: crypto.randomUUID(),
        reason: "Deadline approaching",
        taskId: t.id,
        priority: 90 - i * 5,
        category: "time-sensitive",
      });
    });

    // Sort by priority and return top suggestions
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [getActiveTasks]);

  const getUpcomingDeadlines = useCallback((days: number = 7): EnhancedTask[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return tasks.filter(t => {
      if (t.status !== "active" || !t.hardDeadline) return false;
      const deadline = new Date(t.hardDeadline);
      return deadline <= futureDate && deadline > new Date();
    }).sort((a, b) => 
      new Date(a.hardDeadline!).getTime() - new Date(b.hardDeadline!).getTime()
    );
  }, [tasks]);

  return {
    tasks,
    categories: DEFAULT_CATEGORIES,
    createTask,
    startTask,
    completeSubtask,
    completeTask,
    addReflection,
    updateTaskStatus,
    addDependency,
    deleteTask,
    restoreTask,
    getActiveTasks,
    getCompletedTasks,
    getBlockedTasks,
    getTasksByCategory,
    getTasksByEnergy,
    getSuggestedTasks,
    getUpcomingDeadlines,
    calculateRewards,
  };
};
