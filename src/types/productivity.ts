// ========== TASK SYSTEM ==========

export type TaskDifficulty = "trivial" | "easy" | "normal" | "hard" | "epic" | "boss";
export type EnergyType = "mental" | "physical" | "creative";
export type TaskPriority = "urgent-important" | "urgent" | "important" | "neither";
export type TaskStatus = "active" | "completed" | "missed" | "abandoned" | "postponed" | "blocked";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TaskDependency {
  taskId: string;
  type: "blocks" | "blocked-by";
}

export interface TaskReflection {
  whatWentWell: string;
  whatDidntWork: string;
  createdAt: Date;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  energyType: EnergyType;
  category: string;
  subcategory?: string;
  
  // Time tracking
  estimatedMinutes?: number;
  actualMinutes?: number;
  startedAt?: Date;
  
  // Subtasks
  subtasks: Subtask[];
  
  // Dependencies
  dependencies: TaskDependency[];
  
  // Deadlines
  softDeadline?: Date;
  hardDeadline?: Date;
  
  // Priority
  priority: TaskPriority;
  
  // Status
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  
  // Reflection
  reflection?: TaskReflection;
  
  // Existing quest fields
  rarity: import("./quest").QuestRarity;
  xpReward: number;
  coinReward: number;
  reminderTime?: string;
  repeatFrequency: import("./quest").RepeatFrequency;
  repeatDays?: number[];
  lastCompletedDate?: string;
}

// Difficulty multipliers for XP and coins
export const DIFFICULTY_MULTIPLIERS: Record<TaskDifficulty, { xp: number; coins: number; baseMinutes: number }> = {
  trivial: { xp: 0.5, coins: 0.25, baseMinutes: 5 },
  easy: { xp: 0.75, coins: 0.5, baseMinutes: 15 },
  normal: { xp: 1, coins: 1, baseMinutes: 30 },
  hard: { xp: 1.5, coins: 1.5, baseMinutes: 60 },
  epic: { xp: 2.5, coins: 2.5, baseMinutes: 120 },
  boss: { xp: 5, coins: 5, baseMinutes: 240 },
};

export const ENERGY_TYPE_ICONS: Record<EnergyType, string> = {
  mental: "🧠",
  physical: "💪",
  creative: "🎨",
};

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  "urgent-important": { label: "Do First", color: "text-quest-health" },
  "urgent": { label: "Schedule", color: "text-quest-legendary" },
  "important": { label: "Delegate", color: "text-quest-mana" },
  "neither": { label: "Eliminate", color: "text-muted-foreground" },
};

// ========== HABIT SYSTEM ==========

export type HabitType = "binary" | "scaled";
export type HabitPolarity = "positive" | "negative";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  polarity: HabitPolarity;
  
  // For scaled habits
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  
  // Streak with decay
  currentStreak: number;
  bestStreak: number;
  missToleranceDays: number; // Days can miss before streak decays
  streakDecayRate: number; // How much streak decays per miss (0-1)
  
  // Momentum
  momentumMultiplier: number; // Current multiplier (starts at 1)
  momentumGrowthRate: number; // How fast momentum builds
  
  // Difficulty scaling
  difficultyLevel: number;
  difficultyScaleRate: number; // How fast difficulty increases
  
  // Analytics
  totalCompletions: number;
  totalMisses: number;
  completionHistory: HabitCompletion[];
  
  // Rewards
  baseXP: number;
  baseCoins: number;
  
  createdAt: Date;
  lastCompletedDate?: string;
  lastMissedDate?: string;
}

export interface HabitCompletion {
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // For scaled habits
}

export interface HabitStats {
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  averageValue?: number;
  weakestDay: number; // 0-6 for day of week
}

// ========== COMPANION SYSTEM ==========

export type CompanionMood = "ecstatic" | "happy" | "content" | "neutral" | "tired" | "exhausted" | "sad";
export type CompanionArchetype = "focus" | "habit" | "project" | "balanced";
export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export interface CompanionBonus {
  type: "xp" | "coins" | "focus" | "habit-streak" | "task-efficiency";
  value: number;
  description: string;
}

export interface Companion {
  id: string;
  name: string;
  archetype: CompanionArchetype;
  evolutionStage: EvolutionStage;
  
  // Mood and energy
  mood: CompanionMood;
  energy: number; // 0-100
  happiness: number; // 0-100
  
  // Progress
  totalTasksWitnessed: number;
  totalFocusMinutes: number;
  totalHabitsWitnessed: number;
  evolutionPoints: number;
  
  // Evolution
  evolutionPath: CompanionArchetype[]; // History of dominant behaviors
  
  // Bonuses (unlock with evolution)
  activeBonus: CompanionBonus | null;
  
  // Customization
  skin: string;
  accessories: string[];
  
  // Status
  lastInteractionDate: string;
  consecutiveDaysActive: number;
  
  createdAt: Date;
}

export const COMPANION_ARCHETYPES: Record<CompanionArchetype, { name: string; icon: string; description: string }> = {
  focus: { name: "Focus Master", icon: "🎯", description: "Excels in deep work sessions" },
  habit: { name: "Habit Guardian", icon: "🌱", description: "Thrives on consistency" },
  project: { name: "Quest Champion", icon: "⚔️", description: "Loves big achievements" },
  balanced: { name: "Harmony Keeper", icon: "⚖️", description: "Balanced approach" },
};

export const EVOLUTION_REQUIREMENTS: Record<EvolutionStage, { points: number; bonusUnlock: string }> = {
  1: { points: 0, bonusUnlock: "None" },
  2: { points: 100, bonusUnlock: "+5% XP" },
  3: { points: 500, bonusUnlock: "+10% Coins" },
  4: { points: 2000, bonusUnlock: "+15% Focus time" },
  5: { points: 10000, bonusUnlock: "Unique archetype bonus" },
};

// ========== COIN ECONOMY ==========

export interface CoinTransaction {
  id: string;
  amount: number;
  type: "earn" | "spend";
  source: string;
  description: string;
  timestamp: Date;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "consumable" | "cosmetic" | "boost" | "companion";
  stock: number; // -1 for unlimited
  maxOwnable: number;
  effect?: ShopItemEffect;
}

export interface ShopItemEffect {
  type: "streak-freeze" | "deadline-extend" | "challenge-reroll" | "xp-boost" | "companion-item";
  value: number;
  duration?: number; // In hours for time-limited effects
}

export interface PlayerInventory {
  coins: number;
  ownedItems: { itemId: string; quantity: number }[];
  activeEffects: { effectType: string; expiresAt: Date; value: number }[];
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "streak-freeze",
    name: "Streak Shield",
    description: "Protect your streak for one missed day",
    cost: 50,
    category: "consumable",
    stock: -1,
    maxOwnable: 3,
    effect: { type: "streak-freeze", value: 1 },
  },
  {
    id: "deadline-extend-1d",
    name: "Time Crystal",
    description: "Extend a hard deadline by 1 day (max 2 per task)",
    cost: 75,
    category: "consumable",
    stock: -1,
    maxOwnable: 5,
    effect: { type: "deadline-extend", value: 1 },
  },
  {
    id: "challenge-reroll",
    name: "Destiny Dice",
    description: "Reroll one daily challenge",
    cost: 30,
    category: "consumable",
    stock: 3, // Limited per day
    maxOwnable: 1,
    effect: { type: "challenge-reroll", value: 1 },
  },
  {
    id: "xp-boost-small",
    name: "Minor XP Scroll",
    description: "+10% XP for 1 hour",
    cost: 40,
    category: "boost",
    stock: -1,
    maxOwnable: 3,
    effect: { type: "xp-boost", value: 0.1, duration: 1 },
  },
  {
    id: "xp-boost-medium",
    name: "Greater XP Scroll",
    description: "+25% XP for 2 hours",
    cost: 100,
    category: "boost",
    stock: -1,
    maxOwnable: 2,
    effect: { type: "xp-boost", value: 0.25, duration: 2 },
  },
  {
    id: "companion-treat",
    name: "Companion Treat",
    description: "Restore 20 companion energy",
    cost: 25,
    category: "companion",
    stock: -1,
    maxOwnable: 10,
    effect: { type: "companion-item", value: 20 },
  },
];

// ========== SKILL TREES ==========

export type SkillCategory = "time-management" | "focus" | "discipline" | "learning" | "health" | "creativity";

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  tier: number; // 1-5
  cost: number; // Skill points
  prerequisites: string[];
  unlocked: boolean;
  effect: SkillEffect;
}

export interface SkillEffect {
  type: "xp-bonus" | "coin-bonus" | "focus-duration" | "streak-protection" | "task-suggestion" | "deadline-warning" | "energy-efficiency" | "momentum-boost";
  value: number;
  description: string;
}

export interface PlayerSkills {
  skillPoints: number;
  totalPointsEarned: number;
  unlockedNodes: string[];
  activeEffects: SkillEffect[];
}

export const SKILL_CATEGORIES: Record<SkillCategory, { name: string; icon: string; color: string }> = {
  "time-management": { name: "Time Management", icon: "⏱️", color: "text-quest-mana" },
  "focus": { name: "Focus", icon: "🎯", color: "text-quest-rare" },
  "discipline": { name: "Discipline", icon: "⚔️", color: "text-quest-health" },
  "learning": { name: "Learning", icon: "📚", color: "text-quest-xp" },
  "health": { name: "Health", icon: "❤️", color: "text-destructive" },
  "creativity": { name: "Creativity", icon: "🎨", color: "text-quest-legendary" },
};

// ========== PROJECTS ==========

export type ProjectStatus = "planning" | "active" | "paused" | "completed" | "abandoned";

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  completedAt?: Date;
  xpReward: number;
  tasks: string[]; // Task IDs
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  
  // Progress
  milestones: ProjectMilestone[];
  currentMilestoneIndex: number;
  
  // Risk tracking
  riskLevel: number; // 0-100
  riskFactors: string[];
  
  // Dates
  startDate: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  
  // Rewards
  totalXPEarned: number;
  totalCoinsEarned: number;
  
  // Retrospective
  retrospective?: ProjectRetrospective;
  
  createdAt: Date;
}

export interface ProjectRetrospective {
  completedAt: Date;
  achievements: string[];
  challenges: string[];
  lessonsLearned: string[];
  rating: number; // 1-5
}

// ========== FOCUS SYSTEM ==========

export type FocusSessionType = "deep-work" | "shallow" | "creative" | "learning";

export interface FocusSession {
  id: string;
  type: FocusSessionType;
  taskId?: string;
  
  // Timing
  plannedMinutes: number;
  actualMinutes: number;
  startedAt: Date;
  endedAt?: Date;
  
  // Breaks
  breaks: { start: Date; end: Date }[];
  
  // Distractions
  distractionLog: DistractionEntry[];
  
  // Quality
  focusQuality: number; // 0-100
  
  // Rewards
  xpEarned: number;
  coinsEarned: number;
}

export interface DistractionEntry {
  timestamp: Date;
  description: string;
  durationMinutes: number;
}

export interface FocusStreak {
  currentStreak: number; // Consecutive days with focus sessions
  bestStreak: number;
  todayMinutes: number;
  weeklyMinutes: number;
  averageSessionQuality: number;
}

// ========== ANALYTICS ==========

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  xpEarned: number;
  coinsEarned: number;
  focusMinutes: number;
  habitsCompleted: number;
  habitsMissed: number;
  energyDistribution: Record<EnergyType, number>;
  productivityScore: number; // Calculated 0-100
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  
  // Task metrics
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  
  // XP and coins
  totalXP: number;
  totalCoins: number;
  
  // Focus
  totalFocusMinutes: number;
  averageFocusQuality: number;
  
  // Habits
  habitSuccessRate: number;
  
  // Time analysis
  mostProductiveHour: number;
  mostProductiveDay: number;
  
  // Insights
  insights: string[];
  recommendations: string[];
  
  generatedAt: Date;
}

export interface BurnoutIndicator {
  level: number; // 0-100
  factors: {
    overwork: number;
    missedBreaks: number;
    streakPressure: number;
    deadlineDensity: number;
  };
  warnings: string[];
  lastChecked: Date;
}

// ========== UNDO SYSTEM ==========

export interface UndoAction {
  id: string;
  type: "task-delete" | "task-complete" | "habit-miss" | "item-purchase" | "skill-unlock";
  data: unknown;
  description: string;
  timestamp: Date;
  expiresAt: Date;
}

// ========== ACCESSIBILITY ==========

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  keyboardOnlyMode: boolean;
}

// ========== QUICK TASK SUGGESTIONS ==========

export interface TaskSuggestion {
  id: string;
  reason: string;
  taskId: string;
  priority: number;
  category: "quick-win" | "time-sensitive" | "energy-match" | "streak-risk" | "dependency-clear";
}

// ========== DEFAULT CATEGORIES ==========

export const DEFAULT_CATEGORIES = [
  { id: "work", name: "Work", icon: "💼", color: "text-quest-mana" },
  { id: "personal", name: "Personal", icon: "🏠", color: "text-quest-xp" },
  { id: "health", name: "Health", icon: "❤️", color: "text-quest-health" },
  { id: "learning", name: "Learning", icon: "📚", color: "text-quest-legendary" },
  { id: "creative", name: "Creative", icon: "🎨", color: "text-quest-rare" },
  { id: "social", name: "Social", icon: "👥", color: "text-primary" },
  { id: "finance", name: "Finance", icon: "💰", color: "text-quest-gold" },
  { id: "other", name: "Other", icon: "📌", color: "text-muted-foreground" },
];
