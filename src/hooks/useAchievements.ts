import { useState, useEffect, useCallback } from "react";
import { Achievement } from "@/types/quest";

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_quest",
    name: "First Steps",
    description: "Complete your first quest",
    icon: "sword",
    requirement: 1,
    type: "quests_completed",
    unlocked: false,
  },
  {
    id: "quest_10",
    name: "Quest Hunter",
    description: "Complete 10 quests",
    icon: "trophy",
    requirement: 10,
    type: "quests_completed",
    unlocked: false,
  },
  {
    id: "quest_50",
    name: "Quest Master",
    description: "Complete 50 quests",
    icon: "crown",
    requirement: 50,
    type: "quests_completed",
    unlocked: false,
  },
  {
    id: "quest_100",
    name: "Legendary Adventurer",
    description: "Complete 100 quests",
    icon: "star",
    requirement: 100,
    type: "quests_completed",
    unlocked: false,
  },
  {
    id: "xp_500",
    name: "Rising Star",
    description: "Earn 500 XP",
    icon: "star",
    requirement: 500,
    type: "xp_earned",
    unlocked: false,
  },
  {
    id: "xp_2000",
    name: "XP Collector",
    description: "Earn 2000 XP",
    icon: "star",
    requirement: 2000,
    type: "xp_earned",
    unlocked: false,
  },
  {
    id: "xp_10000",
    name: "XP Legend",
    description: "Earn 10000 XP",
    icon: "crown",
    requirement: 10000,
    type: "xp_earned",
    unlocked: false,
  },
  {
    id: "streak_3",
    name: "Consistent",
    description: "Maintain a 3 day streak",
    icon: "flame",
    requirement: 3,
    type: "streak",
    unlocked: false,
  },
  {
    id: "streak_7",
    name: "Dedicated",
    description: "Maintain a 7 day streak",
    icon: "flame",
    requirement: 7,
    type: "streak",
    unlocked: false,
  },
  {
    id: "streak_30",
    name: "Unstoppable",
    description: "Maintain a 30 day streak",
    icon: "flame",
    requirement: 30,
    type: "streak",
    unlocked: false,
  },
  {
    id: "legendary_1",
    name: "Dragon Slayer",
    description: "Complete a legendary quest",
    icon: "crown",
    requirement: 1,
    type: "legendary_completed",
    unlocked: false,
  },
  {
    id: "legendary_10",
    name: "Mythic Hero",
    description: "Complete 10 legendary quests",
    icon: "crown",
    requirement: 10,
    type: "legendary_completed",
    unlocked: false,
  },
  {
    id: "daily_5",
    name: "Daily Warrior",
    description: "Complete 5 daily challenges",
    icon: "target",
    requirement: 5,
    type: "daily_challenges",
    unlocked: false,
  },
  {
    id: "daily_20",
    name: "Daily Champion",
    description: "Complete 20 daily challenges",
    icon: "target",
    requirement: 20,
    type: "daily_challenges",
    unlocked: false,
  },
];

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem("pixel-achievements");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new achievements
      return DEFAULT_ACHIEVEMENTS.map(def => {
        const saved = parsed.find((a: Achievement) => a.id === def.id);
        return saved ? { ...def, ...saved } : def;
      });
    }
    return DEFAULT_ACHIEVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem("pixel-achievements", JSON.stringify(achievements));
  }, [achievements]);

  const checkAchievements = useCallback((stats: {
    questsCompleted: number;
    xpEarned: number;
    streak: number;
    legendaryCompleted: number;
    dailyChallengesCompleted: number;
  }): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      switch (achievement.type) {
        case "quests_completed":
          shouldUnlock = stats.questsCompleted >= achievement.requirement;
          break;
        case "xp_earned":
          shouldUnlock = stats.xpEarned >= achievement.requirement;
          break;
        case "streak":
          shouldUnlock = stats.streak >= achievement.requirement;
          break;
        case "legendary_completed":
          shouldUnlock = stats.legendaryCompleted >= achievement.requirement;
          break;
        case "daily_challenges":
          shouldUnlock = stats.dailyChallengesCompleted >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        newlyUnlocked.push({ ...achievement, unlocked: true, unlockedAt: new Date() });
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      return achievement;
    }));

    return newlyUnlocked;
  }, []);

  return { achievements, checkAchievements };
};
