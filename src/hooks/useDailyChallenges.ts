import { useState, useEffect, useCallback } from "react";
import { DailyChallenge, QuestRarity } from "@/types/quest";

const generateDailyChallenges = (date: string): DailyChallenge[] => {
  // Use date as seed for consistent daily challenges
  const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
  
  const challenges: DailyChallenge[] = [
    {
      id: `daily-${date}-1`,
      title: "Quest Warrior",
      description: `Complete ${2 + (seed % 3)} quests today`,
      xpReward: 30 + (seed % 20),
      requirement: 2 + (seed % 3),
      progress: 0,
      type: "complete_quests",
      completed: false,
      date,
    },
    {
      id: `daily-${date}-2`,
      title: "XP Seeker",
      description: `Earn ${50 + (seed % 50)} XP today`,
      xpReward: 25,
      requirement: 50 + (seed % 50),
      progress: 0,
      type: "earn_xp",
      completed: false,
      date,
    },
  ];

  // Add rarity-specific challenge based on day
  const rarities: QuestRarity[] = ["common", "rare", "legendary"];
  const rarity = rarities[seed % 3];
  const rarityRequirements = { common: 3, rare: 2, legendary: 1 };
  const rarityRewards = { common: 20, rare: 35, legendary: 75 };

  challenges.push({
    id: `daily-${date}-3`,
    title: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Hunter`,
    description: `Complete ${rarityRequirements[rarity]} ${rarity} quest${rarityRequirements[rarity] > 1 ? 's' : ''}`,
    xpReward: rarityRewards[rarity],
    requirement: rarityRequirements[rarity],
    progress: 0,
    type: "complete_rarity",
    rarityRequired: rarity,
    completed: false,
    date,
  });

  return challenges;
};

export const useDailyChallenges = () => {
  const today = new Date().toISOString().split("T")[0];
  
  const [challenges, setChallenges] = useState<DailyChallenge[]>(() => {
    const saved = localStorage.getItem("pixel-daily-challenges");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if challenges are from today
      if (parsed.length > 0 && parsed[0].date === today) {
        return parsed;
      }
    }
    return generateDailyChallenges(today);
  });

  const [completedCount, setCompletedCount] = useState(() => {
    const saved = localStorage.getItem("pixel-daily-completed-count");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("pixel-daily-challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("pixel-daily-completed-count", completedCount.toString());
  }, [completedCount]);

  // Reset challenges if it's a new day
  useEffect(() => {
    if (challenges.length > 0 && challenges[0].date !== today) {
      setChallenges(generateDailyChallenges(today));
    }
  }, [today, challenges]);

  const updateProgress = useCallback((questsCompletedToday: number, xpEarnedToday: number, rarityCompleted?: QuestRarity) => {
    let newCompletedCount = 0;
    
    setChallenges(prev => prev.map(challenge => {
      if (challenge.completed) {
        newCompletedCount++;
        return challenge;
      }

      let newProgress = challenge.progress;
      
      switch (challenge.type) {
        case "complete_quests":
          newProgress = questsCompletedToday;
          break;
        case "earn_xp":
          newProgress = xpEarnedToday;
          break;
        case "complete_rarity":
          if (rarityCompleted === challenge.rarityRequired) {
            newProgress = challenge.progress + 1;
          }
          break;
      }

      const isCompleted = newProgress >= challenge.requirement;
      if (isCompleted && !challenge.completed) {
        newCompletedCount++;
      }

      return {
        ...challenge,
        progress: newProgress,
        completed: isCompleted,
      };
    }));

    setCompletedCount(prev => prev + newCompletedCount);
    return newCompletedCount;
  }, []);

  const getDailyChallengeReward = useCallback((): number => {
    return challenges
      .filter(c => c.completed)
      .reduce((sum, c) => sum + c.xpReward, 0);
  }, [challenges]);

  return { 
    challenges, 
    updateProgress, 
    getDailyChallengeReward,
    completedCount,
  };
};
