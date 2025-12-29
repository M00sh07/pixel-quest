import { useState, useEffect, useCallback } from "react";
import { SkillNode, SkillCategory, SkillEffect, PlayerSkills, SKILL_CATEGORIES } from "@/types/productivity";

const DEFAULT_SKILL_NODES: SkillNode[] = [
  // Time Management
  { id: "tm-1", name: "Early Bird", description: "Bonus XP for tasks completed before noon", category: "time-management", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "xp-bonus", value: 0.05, description: "+5% XP before noon" } },
  { id: "tm-2", name: "Time Boxer", description: "Better time estimates", category: "time-management", tier: 2, cost: 2, prerequisites: ["tm-1"], unlocked: false, effect: { type: "task-suggestion", value: 1, description: "Smart time suggestions" } },
  { id: "tm-3", name: "Deadline Warrior", description: "Warnings for approaching deadlines", category: "time-management", tier: 3, cost: 3, prerequisites: ["tm-2"], unlocked: false, effect: { type: "deadline-warning", value: 3, description: "3-day deadline warnings" } },
  { id: "tm-4", name: "Master Scheduler", description: "Optimal task ordering suggestions", category: "time-management", tier: 4, cost: 5, prerequisites: ["tm-3"], unlocked: false, effect: { type: "task-suggestion", value: 2, description: "Priority scheduling" } },
  { id: "tm-5", name: "Time Lord", description: "Significant time management bonuses", category: "time-management", tier: 5, cost: 8, prerequisites: ["tm-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.15, description: "+15% all XP" } },

  // Focus
  { id: "fo-1", name: "Focused Start", description: "Bonus for first focus session", category: "focus", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "xp-bonus", value: 0.10, description: "+10% first session XP" } },
  { id: "fo-2", name: "Deep Worker", description: "Extended focus duration bonuses", category: "focus", tier: 2, cost: 2, prerequisites: ["fo-1"], unlocked: false, effect: { type: "focus-duration", value: 0.15, description: "+15% long session XP" } },
  { id: "fo-3", name: "Flow State", description: "Reduced distraction impact", category: "focus", tier: 3, cost: 3, prerequisites: ["fo-2"], unlocked: false, effect: { type: "focus-duration", value: 0.25, description: "-25% distraction penalty" } },
  { id: "fo-4", name: "Zen Master", description: "Focus streak protection", category: "focus", tier: 4, cost: 5, prerequisites: ["fo-3"], unlocked: false, effect: { type: "streak-protection", value: 1, description: "1 focus streak miss protection" } },
  { id: "fo-5", name: "Singularity", description: "Maximum focus bonuses", category: "focus", tier: 5, cost: 8, prerequisites: ["fo-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.20, description: "+20% focus XP" } },

  // Discipline
  { id: "di-1", name: "Iron Will", description: "Reduced streak decay", category: "discipline", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "streak-protection", value: 0.10, description: "-10% streak decay" } },
  { id: "di-2", name: "Consistency", description: "Habit momentum builds faster", category: "discipline", tier: 2, cost: 2, prerequisites: ["di-1"], unlocked: false, effect: { type: "momentum-boost", value: 0.20, description: "+20% momentum growth" } },
  { id: "di-3", name: "Resilience", description: "Miss tolerance increased", category: "discipline", tier: 3, cost: 3, prerequisites: ["di-2"], unlocked: false, effect: { type: "streak-protection", value: 1, description: "+1 day miss tolerance" } },
  { id: "di-4", name: "Unbreakable", description: "Major streak protection", category: "discipline", tier: 4, cost: 5, prerequisites: ["di-3"], unlocked: false, effect: { type: "streak-protection", value: 0.25, description: "-25% streak decay" } },
  { id: "di-5", name: "Legendary Discipline", description: "Ultimate discipline mastery", category: "discipline", tier: 5, cost: 8, prerequisites: ["di-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.25, description: "+25% habit XP" } },

  // Learning
  { id: "le-1", name: "Quick Learner", description: "XP bonus for learning tasks", category: "learning", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "xp-bonus", value: 0.10, description: "+10% learning task XP" } },
  { id: "le-2", name: "Knowledge Seeker", description: "Skill points earned faster", category: "learning", tier: 2, cost: 2, prerequisites: ["le-1"], unlocked: false, effect: { type: "xp-bonus", value: 0.05, description: "+5% skill point gain" } },
  { id: "le-3", name: "Pattern Recognition", description: "Better task suggestions", category: "learning", tier: 3, cost: 3, prerequisites: ["le-2"], unlocked: false, effect: { type: "task-suggestion", value: 1, description: "Smart task matching" } },
  { id: "le-4", name: "Mastery Path", description: "Reduced skill costs", category: "learning", tier: 4, cost: 5, prerequisites: ["le-3"], unlocked: false, effect: { type: "coin-bonus", value: 0.10, description: "-10% skill point cost" } },
  { id: "le-5", name: "Enlightenment", description: "Maximum learning benefits", category: "learning", tier: 5, cost: 8, prerequisites: ["le-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.30, description: "+30% all learning XP" } },

  // Health
  { id: "he-1", name: "Energy Boost", description: "Less companion fatigue", category: "health", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "energy-efficiency", value: 0.10, description: "-10% companion fatigue" } },
  { id: "he-2", name: "Vitality", description: "Faster energy recovery", category: "health", tier: 2, cost: 2, prerequisites: ["he-1"], unlocked: false, effect: { type: "energy-efficiency", value: 0.15, description: "+15% energy recovery" } },
  { id: "he-3", name: "Balance", description: "Burnout warning improvements", category: "health", tier: 3, cost: 3, prerequisites: ["he-2"], unlocked: false, effect: { type: "energy-efficiency", value: 0.20, description: "Earlier burnout warnings" } },
  { id: "he-4", name: "Stamina", description: "More tasks without fatigue", category: "health", tier: 4, cost: 5, prerequisites: ["he-3"], unlocked: false, effect: { type: "energy-efficiency", value: 0.25, description: "+25% work capacity" } },
  { id: "he-5", name: "Immortal Vigor", description: "Peak health benefits", category: "health", tier: 5, cost: 8, prerequisites: ["he-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.15, description: "+15% all XP when healthy" } },

  // Creativity
  { id: "cr-1", name: "Spark", description: "Creative task bonuses", category: "creativity", tier: 1, cost: 1, prerequisites: [], unlocked: false, effect: { type: "xp-bonus", value: 0.10, description: "+10% creative XP" } },
  { id: "cr-2", name: "Innovation", description: "Coin bonuses for creative work", category: "creativity", tier: 2, cost: 2, prerequisites: ["cr-1"], unlocked: false, effect: { type: "coin-bonus", value: 0.15, description: "+15% creative coins" } },
  { id: "cr-3", name: "Inspiration", description: "Random bonus events", category: "creativity", tier: 3, cost: 3, prerequisites: ["cr-2"], unlocked: false, effect: { type: "coin-bonus", value: 0.05, description: "Random inspiration bonuses" } },
  { id: "cr-4", name: "Visionary", description: "Project milestone bonuses", category: "creativity", tier: 4, cost: 5, prerequisites: ["cr-3"], unlocked: false, effect: { type: "xp-bonus", value: 0.20, description: "+20% milestone XP" } },
  { id: "cr-5", name: "Genius", description: "Maximum creative potential", category: "creativity", tier: 5, cost: 8, prerequisites: ["cr-4"], unlocked: false, effect: { type: "xp-bonus", value: 0.35, description: "+35% creative XP" } },
];

export const useSkillTree = () => {
  const [skills, setSkills] = useState<PlayerSkills>(() => {
    const saved = localStorage.getItem("productivity-skills");
    return saved ? JSON.parse(saved) : {
      skillPoints: 0,
      totalPointsEarned: 0,
      unlockedNodes: [],
      activeEffects: [],
    };
  });

  const [nodes, setNodes] = useState<SkillNode[]>(() => {
    const saved = localStorage.getItem("productivity-skill-nodes");
    if (saved) {
      const parsed = JSON.parse(saved);
      return DEFAULT_SKILL_NODES.map(def => {
        const savedNode = parsed.find((n: SkillNode) => n.id === def.id);
        return savedNode ? { ...def, unlocked: savedNode.unlocked } : def;
      });
    }
    return DEFAULT_SKILL_NODES;
  });

  useEffect(() => {
    localStorage.setItem("productivity-skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem("productivity-skill-nodes", JSON.stringify(nodes));
  }, [nodes]);

  const earnSkillPoints = useCallback((amount: number) => {
    setSkills(prev => ({
      ...prev,
      skillPoints: prev.skillPoints + amount,
      totalPointsEarned: prev.totalPointsEarned + amount,
    }));
  }, []);

  const unlockNode = useCallback((nodeId: string): { success: boolean; message: string } => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { success: false, message: "Skill not found" };
    if (node.unlocked) return { success: false, message: "Already unlocked" };
    if (skills.skillPoints < node.cost) return { success: false, message: "Not enough skill points" };
    
    // Check prerequisites
    const prerequisitesMet = node.prerequisites.every(prereq => 
      nodes.find(n => n.id === prereq)?.unlocked
    );
    if (!prerequisitesMet) return { success: false, message: "Prerequisites not met" };

    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, unlocked: true } : n
    ));

    setSkills(prev => ({
      ...prev,
      skillPoints: prev.skillPoints - node.cost,
      unlockedNodes: [...prev.unlockedNodes, nodeId],
      activeEffects: [...prev.activeEffects, node.effect],
    }));

    return { success: true, message: `Unlocked ${node.name}!` };
  }, [nodes, skills.skillPoints]);

  const getNodesByCategory = useCallback((category: SkillCategory): SkillNode[] => {
    return nodes.filter(n => n.category === category).sort((a, b) => a.tier - b.tier);
  }, [nodes]);

  const getTotalBonus = useCallback((effectType: SkillEffect["type"]): number => {
    return skills.activeEffects
      .filter(e => e.type === effectType)
      .reduce((sum, e) => sum + e.value, 0);
  }, [skills.activeEffects]);

  const getUnlockedCount = useCallback((): { total: number; unlocked: number } => {
    return {
      total: nodes.length,
      unlocked: nodes.filter(n => n.unlocked).length,
    };
  }, [nodes]);

  const canUnlock = useCallback((nodeId: string): boolean => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.unlocked) return false;
    if (skills.skillPoints < node.cost) return false;
    return node.prerequisites.every(prereq => 
      nodes.find(n => n.id === prereq)?.unlocked
    );
  }, [nodes, skills.skillPoints]);

  return {
    skills,
    nodes,
    earnSkillPoints,
    unlockNode,
    getNodesByCategory,
    getTotalBonus,
    getUnlockedCount,
    canUnlock,
    categories: SKILL_CATEGORIES,
  };
};
