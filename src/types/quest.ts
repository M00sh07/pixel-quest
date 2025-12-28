export type QuestRarity = "common" | "rare" | "legendary";

export type RepeatFrequency = "none" | "daily" | "weekly" | "custom";

export interface Quest {
  id: string;
  title: string;
  rarity: QuestRarity;
  xpReward: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  reminderTime?: string; // HH:mm format
  repeatFrequency: RepeatFrequency;
  repeatDays?: number[]; // 0-6 for Sun-Sat
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "quests_completed" | "xp_earned" | "streak" | "legendary_completed" | "daily_challenges";
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  requirement: number;
  progress: number;
  type: "complete_quests" | "earn_xp" | "complete_rarity";
  rarityRequired?: QuestRarity;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface PlayerRole {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  icon: string;
}

export const PLAYER_ROLES: PlayerRole[] = [
  { name: "Novice", minLevel: 1, maxLevel: 4, color: "text-muted-foreground", icon: "🗡️" },
  { name: "Apprentice", minLevel: 5, maxLevel: 9, color: "text-quest-xp", icon: "⚔️" },
  { name: "Warrior", minLevel: 10, maxLevel: 19, color: "text-quest-rare", icon: "🛡️" },
  { name: "Knight", minLevel: 20, maxLevel: 34, color: "text-primary", icon: "🏰" },
  { name: "Champion", minLevel: 35, maxLevel: 49, color: "text-quest-mana", icon: "👑" },
  { name: "Hero", minLevel: 50, maxLevel: 74, color: "text-quest-legendary", icon: "🌟" },
  { name: "Legend", minLevel: 75, maxLevel: 99, color: "text-quest-gold", icon: "⭐" },
  { name: "Mythic", minLevel: 100, maxLevel: Infinity, color: "text-quest-health", icon: "🔥" },
];

export const getPlayerRole = (level: number): PlayerRole => {
  return PLAYER_ROLES.find(role => level >= role.minLevel && level <= role.maxLevel) || PLAYER_ROLES[0];
};

// XP scaling formula: each level requires more XP
export const getXPForLevel = (level: number): number => {
  // Base 100 XP, increases by 20% per level
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

export const getLevelFromTotalXP = (totalXP: number): { level: number; currentLevelXP: number; xpForNextLevel: number } => {
  let level = 1;
  let xpUsed = 0;
  
  while (true) {
    const xpNeeded = getXPForLevel(level);
    if (xpUsed + xpNeeded > totalXP) {
      return {
        level,
        currentLevelXP: totalXP - xpUsed,
        xpForNextLevel: xpNeeded,
      };
    }
    xpUsed += xpNeeded;
    level++;
  }
};

export const getXPReward = (rarity: QuestRarity): number => {
  switch (rarity) {
    case "common":
      return 10;
    case "rare":
      return 25;
    case "legendary":
      return 50;
    default:
      return 10;
  }
};