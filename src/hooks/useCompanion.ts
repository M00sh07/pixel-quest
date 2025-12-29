import { useState, useEffect, useCallback } from "react";
import { Companion, CompanionMood, CompanionArchetype, EVOLUTION_REQUIREMENTS, CompanionBonus } from "@/types/productivity";

const today = () => new Date().toISOString().split("T")[0];

const getMoodFromStats = (energy: number, happiness: number): CompanionMood => {
  const combined = (energy + happiness) / 2;
  if (combined >= 90) return "ecstatic";
  if (combined >= 70) return "happy";
  if (combined >= 50) return "content";
  if (combined >= 30) return "neutral";
  if (combined >= 15) return "tired";
  if (combined >= 5) return "exhausted";
  return "sad";
};

const getArchetypeBonus = (archetype: CompanionArchetype, stage: number): CompanionBonus | null => {
  if (stage < 2) return null;
  
  const bonuses: Record<CompanionArchetype, CompanionBonus[]> = {
    focus: [
      { type: "focus", value: 0.05, description: "+5% focus session XP" },
      { type: "focus", value: 0.10, description: "+10% focus session XP" },
      { type: "focus", value: 0.15, description: "+15% focus session XP" },
      { type: "focus", value: 0.25, description: "+25% focus session XP" },
    ],
    habit: [
      { type: "habit-streak", value: 0.05, description: "+5% habit streak protection" },
      { type: "habit-streak", value: 0.10, description: "+10% habit streak protection" },
      { type: "habit-streak", value: 0.15, description: "+15% habit streak protection" },
      { type: "habit-streak", value: 0.25, description: "+25% habit streak protection" },
    ],
    project: [
      { type: "xp", value: 0.05, description: "+5% project XP" },
      { type: "xp", value: 0.10, description: "+10% project XP" },
      { type: "xp", value: 0.15, description: "+15% project XP" },
      { type: "coins", value: 0.25, description: "+25% project coins" },
    ],
    balanced: [
      { type: "xp", value: 0.03, description: "+3% all XP" },
      { type: "coins", value: 0.05, description: "+5% all coins" },
      { type: "task-efficiency", value: 0.08, description: "+8% task efficiency" },
      { type: "xp", value: 0.12, description: "+12% all XP" },
    ],
  };
  
  return bonuses[archetype][Math.min(stage - 2, 3)];
};

const DEFAULT_COMPANION: Companion = {
  id: crypto.randomUUID(),
  name: "Pixel",
  archetype: "balanced",
  evolutionStage: 1,
  mood: "content",
  energy: 100,
  happiness: 70,
  totalTasksWitnessed: 0,
  totalFocusMinutes: 0,
  totalHabitsWitnessed: 0,
  evolutionPoints: 0,
  evolutionPath: [],
  activeBonus: null,
  skin: "default",
  accessories: [],
  lastInteractionDate: today(),
  consecutiveDaysActive: 0,
  createdAt: new Date(),
};

export const useCompanion = () => {
  const [companion, setCompanion] = useState<Companion>(() => {
    const saved = localStorage.getItem("productivity-companion");
    return saved ? JSON.parse(saved) : DEFAULT_COMPANION;
  });

  useEffect(() => {
    localStorage.setItem("productivity-companion", JSON.stringify(companion));
  }, [companion]);

  // Daily check for activity streak and energy recovery
  useEffect(() => {
    const todayStr = today();
    if (companion.lastInteractionDate !== todayStr) {
      const lastDate = new Date(companion.lastInteractionDate);
      const currentDate = new Date(todayStr);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setCompanion(prev => ({
        ...prev,
        lastInteractionDate: todayStr,
        consecutiveDaysActive: daysDiff === 1 ? prev.consecutiveDaysActive + 1 : 1,
        energy: Math.min(100, prev.energy + 20), // Recover 20 energy overnight
        happiness: daysDiff === 1 ? Math.min(100, prev.happiness + 5) : Math.max(0, prev.happiness - 10 * daysDiff),
      }));
    }
  }, [companion.lastInteractionDate]);

  const updateFromActivity = useCallback((activity: {
    tasksCompleted?: number;
    focusMinutes?: number;
    habitsCompleted?: number;
    isOverworking?: boolean;
  }) => {
    setCompanion(prev => {
      const tasksWitnessed = prev.totalTasksWitnessed + (activity.tasksCompleted || 0);
      const focusMinutes = prev.totalFocusMinutes + (activity.focusMinutes || 0);
      const habitsWitnessed = prev.totalHabitsWitnessed + (activity.habitsCompleted || 0);
      
      // Calculate evolution points
      const newPoints = prev.evolutionPoints + 
        (activity.tasksCompleted || 0) * 5 + 
        (activity.focusMinutes || 0) * 0.5 + 
        (activity.habitsCompleted || 0) * 3;
      
      // Determine dominant archetype
      let dominantArchetype: CompanionArchetype = "balanced";
      const focusScore = focusMinutes / 60;
      const habitScore = habitsWitnessed * 2;
      const taskScore = tasksWitnessed;
      
      if (focusScore > habitScore && focusScore > taskScore) dominantArchetype = "focus";
      else if (habitScore > focusScore && habitScore > taskScore) dominantArchetype = "habit";
      else if (taskScore > focusScore && taskScore > habitScore) dominantArchetype = "project";
      
      // Check for evolution
      let newStage = prev.evolutionStage;
      for (const [stage, req] of Object.entries(EVOLUTION_REQUIREMENTS)) {
        if (newPoints >= req.points && Number(stage) > prev.evolutionStage) {
          newStage = Number(stage) as typeof prev.evolutionStage;
        }
      }
      
      // Update energy based on overworking
      const energyChange = activity.isOverworking ? -15 : -3;
      const newEnergy = Math.max(0, Math.min(100, prev.energy + energyChange));
      
      // Update happiness based on activity
      const happinessBoost = (activity.tasksCompleted || 0) * 3 + (activity.habitsCompleted || 0) * 2;
      const newHappiness = Math.max(0, Math.min(100, prev.happiness + happinessBoost - (activity.isOverworking ? 10 : 0)));
      
      const newArchetype = newStage > prev.evolutionStage ? dominantArchetype : prev.archetype;
      
      return {
        ...prev,
        totalTasksWitnessed: tasksWitnessed,
        totalFocusMinutes: focusMinutes,
        totalHabitsWitnessed: habitsWitnessed,
        evolutionPoints: newPoints,
        evolutionStage: newStage,
        archetype: newArchetype,
        evolutionPath: newStage > prev.evolutionStage 
          ? [...prev.evolutionPath, dominantArchetype]
          : prev.evolutionPath,
        activeBonus: getArchetypeBonus(newArchetype, newStage),
        energy: newEnergy,
        happiness: newHappiness,
        mood: getMoodFromStats(newEnergy, newHappiness),
        lastInteractionDate: today(),
      };
    });
  }, []);

  const feedCompanion = useCallback((energyAmount: number) => {
    setCompanion(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + energyAmount),
      happiness: Math.min(100, prev.happiness + 5),
      mood: getMoodFromStats(Math.min(100, prev.energy + energyAmount), Math.min(100, prev.happiness + 5)),
    }));
  }, []);

  const renameCompanion = useCallback((name: string) => {
    setCompanion(prev => ({ ...prev, name }));
  }, []);

  const updateSkin = useCallback((skin: string) => {
    setCompanion(prev => ({ ...prev, skin }));
  }, []);

  const addAccessory = useCallback((accessory: string) => {
    setCompanion(prev => ({
      ...prev,
      accessories: [...prev.accessories, accessory],
    }));
  }, []);

  return {
    companion,
    updateFromActivity,
    feedCompanion,
    renameCompanion,
    updateSkin,
    addAccessory,
  };
};
