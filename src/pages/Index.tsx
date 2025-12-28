import React, { useState, useEffect, useCallback } from "react";
import { QuestCard } from "@/components/QuestCard";
import { XPBar } from "@/components/XPBar";
import { AddQuestForm } from "@/components/AddQuestForm";
import { PixelCharacter } from "@/components/PixelCharacter";
import { QuestStats } from "@/components/QuestStats";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CompletedQuestsPanel } from "@/components/CompletedQuestsPanel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { toast } from "sonner";
import { Sword, Shield, Scroll, Trophy, Award } from "lucide-react";
import { 
  Quest, 
  QuestRarity, 
  RepeatFrequency, 
  getXPReward, 
  getLevelFromTotalXP 
} from "@/types/quest";
import { PixelButton } from "@/components/PixelButton";

const Index = () => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("pixel-quests-v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((q: Quest) => ({ 
        ...q, 
        createdAt: new Date(q.createdAt),
        completedAt: q.completedAt ? new Date(q.completedAt) : undefined,
        repeatFrequency: q.repeatFrequency || "none",
      }));
    }
    return [
      {
        id: "1",
        title: "Complete your first quest",
        rarity: "common" as QuestRarity,
        xpReward: 10,
        completed: false,
        createdAt: new Date(),
        repeatFrequency: "none" as RepeatFrequency,
      },
      {
        id: "2",
        title: "Add 3 new quests to the board",
        rarity: "rare" as QuestRarity,
        xpReward: 25,
        completed: false,
        createdAt: new Date(),
        repeatFrequency: "none" as RepeatFrequency,
      },
    ];
  });

  const [totalXP, setTotalXP] = useState(() => {
    const saved = localStorage.getItem("pixel-xp");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("pixel-streak");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [todayQuestsCompleted, setTodayQuestsCompleted] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`pixel-daily-progress-${today}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [todayXPEarned, setTodayXPEarned] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`pixel-daily-xp-${today}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [showAchievements, setShowAchievements] = useState(false);

  const { achievements, checkAchievements } = useAchievements();
  const { challenges, updateProgress, completedCount: dailyChallengesCompleted } = useDailyChallenges();

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("pixel-quests-v2", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("pixel-xp", totalXP.toString());
  }, [totalXP]);

  useEffect(() => {
    localStorage.setItem("pixel-streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`pixel-daily-progress-${today}`, todayQuestsCompleted.toString());
  }, [todayQuestsCompleted]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`pixel-daily-xp-${today}`, todayXPEarned.toString());
  }, [todayXPEarned]);

  // Calculate level with scaling
  const { level, currentLevelXP, xpForNextLevel } = getLevelFromTotalXP(totalXP);
  const completedCount = quests.filter((q) => q.completed).length;
  const legendaryCompleted = quests.filter((q) => q.completed && q.rarity === "legendary").length;
  const activeCount = quests.filter((q) => !q.completed).length;

  // Check achievements whenever stats change
  useEffect(() => {
    const newlyUnlocked = checkAchievements({
      questsCompleted: completedCount,
      xpEarned: totalXP,
      streak,
      legendaryCompleted,
      dailyChallengesCompleted,
    });

    newlyUnlocked.forEach(achievement => {
      toast.success(`Achievement Unlocked: ${achievement.name}!`, {
        description: achievement.description,
        icon: <Award className="w-4 h-4" />,
      });
    });
  }, [completedCount, totalXP, streak, legendaryCompleted, dailyChallengesCompleted, checkAchievements]);

  const handleAddQuest = (
    title: string, 
    rarity: QuestRarity,
    reminderTime?: string,
    repeatFrequency?: RepeatFrequency,
    repeatDays?: number[]
  ) => {
    const newQuest: Quest = {
      id: Date.now().toString(),
      title,
      rarity,
      xpReward: getXPReward(rarity),
      completed: false,
      createdAt: new Date(),
      reminderTime,
      repeatFrequency: repeatFrequency || "none",
      repeatDays,
    };
    setQuests((prev) => [newQuest, ...prev]);
    toast.success("Quest accepted!", {
      description: `${title} has been added to your quest log.`,
      icon: <Scroll className="w-4 h-4" />,
    });
  };

  const handleCompleteQuest = useCallback((id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (quest && !quest.completed) {
      const today = new Date().toISOString().split("T")[0];
      
      // Update quest
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { 
          ...q, 
          completed: true,
          completedAt: new Date(),
          lastCompletedDate: today,
        } : q))
      );
      
      // Add XP
      const xpGained = quest.xpReward;
      setTotalXP((prev) => prev + xpGained);
      
      // Update today's progress
      setTodayQuestsCompleted(prev => prev + 1);
      setTodayXPEarned(prev => prev + xpGained);
      
      // Update daily challenges
      updateProgress(todayQuestsCompleted + 1, todayXPEarned + xpGained, quest.rarity);

      const newTotalXP = totalXP + xpGained;
      const { level: newLevel } = getLevelFromTotalXP(newTotalXP);

      if (newLevel > level) {
        toast.success(`Level Up! You're now level ${newLevel}!`, {
          description: "Your power grows stronger, adventurer!",
          icon: <Shield className="w-4 h-4" />,
        });
      } else {
        toast.success("Quest Complete!", {
          description: `+${xpGained} XP earned!`,
          icon: <Sword className="w-4 h-4" />,
        });
      }

      // Handle repeating quests - create new instance
      if (quest.repeatFrequency !== "none") {
        setTimeout(() => {
          const newRepeatingQuest: Quest = {
            ...quest,
            id: Date.now().toString(),
            completed: false,
            createdAt: new Date(),
            completedAt: undefined,
          };
          setQuests(prev => [newRepeatingQuest, ...prev]);
          toast.info("Repeating quest renewed!", {
            description: `${quest.title} is ready to complete again.`,
          });
        }, 1000);
      }
    }
  }, [quests, totalXP, level, todayQuestsCompleted, todayXPEarned, updateProgress]);

  const handleDeleteQuest = (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    toast.info("Quest abandoned", {
      description: "The quest has been removed from your log.",
    });
  };

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dungeon background pattern */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-dungeon-dark/50 via-transparent to-dungeon-dark/80 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <PixelCharacter level={level} />
            <div>
              <h1 className="text-xl md:text-2xl text-primary pixel-text-shadow mb-2">
                Pixel Quest
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Complete Quests • Earn XP • Level Up
              </p>
            </div>
          </div>
          
          {/* Achievements Button */}
          <PixelButton
            variant="ghost"
            onClick={() => setShowAchievements(true)}
            className="mt-2"
          >
            <Trophy className="w-4 h-4 mr-2 text-quest-gold" />
            <span className="text-[10px]">Achievements ({unlockedAchievements}/{achievements.length})</span>
          </PixelButton>
        </header>

        {/* XP Bar */}
        <div className="mb-6">
          <XPBar 
            currentXP={totalXP} 
            level={level} 
            currentLevelXP={currentLevelXP}
            xpToNextLevel={xpForNextLevel} 
          />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <QuestStats
            completedQuests={completedCount}
            activeQuests={activeCount}
            streak={streak}
          />
        </div>

        {/* Daily Challenges */}
        <div className="mb-6">
          <DailyChallenges challenges={challenges} />
        </div>

        {/* Add Quest Form */}
        <div className="mb-6">
          <AddQuestForm onAdd={handleAddQuest} />
        </div>

        {/* Active Quests */}
        <section className="mb-8">
          <h2 className="text-xs text-primary uppercase mb-4 flex items-center gap-2">
            <Sword className="w-4 h-4" />
            Active Quests ({activeQuests.length})
          </h2>
          <div className="space-y-4">
            {activeQuests.length === 0 ? (
              <div className="bg-card pixel-border p-8 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  No active quests. Accept a new quest to begin your adventure!
                </p>
              </div>
            ) : (
              activeQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  {...quest}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              ))
            )}
          </div>
        </section>

        {/* Completed Quests Panel */}
        <section className="mb-8">
          <CompletedQuestsPanel 
            quests={completedQuests} 
            onDelete={handleDeleteQuest}
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
            Your quest awaits, brave adventurer
          </p>
        </footer>
      </div>

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsPanel 
          achievements={achievements} 
          onClose={() => setShowAchievements(false)} 
        />
      )}
    </div>
  );
};

export default Index;
