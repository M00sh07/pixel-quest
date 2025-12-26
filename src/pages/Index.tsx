import React, { useState, useEffect } from "react";
import { QuestCard, QuestRarity } from "@/components/QuestCard";
import { XPBar } from "@/components/XPBar";
import { AddQuestForm } from "@/components/AddQuestForm";
import { PixelCharacter } from "@/components/PixelCharacter";
import { QuestStats } from "@/components/QuestStats";
import { toast } from "sonner";
import { Sword, Shield, Scroll } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  rarity: QuestRarity;
  xpReward: number;
  completed: boolean;
  createdAt: Date;
}

const XP_PER_LEVEL = 100;

const getXPReward = (rarity: QuestRarity): number => {
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

const Index = () => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("pixel-quests");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((q: Quest) => ({ ...q, createdAt: new Date(q.createdAt) }));
    }
    return [
      {
        id: "1",
        title: "Complete your first quest",
        rarity: "common" as QuestRarity,
        xpReward: 10,
        completed: false,
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Add 3 new quests to the board",
        rarity: "rare" as QuestRarity,
        xpReward: 25,
        completed: false,
        createdAt: new Date(),
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

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("pixel-quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("pixel-xp", totalXP.toString());
  }, [totalXP]);

  useEffect(() => {
    localStorage.setItem("pixel-streak", streak.toString());
  }, [streak]);

  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const completedCount = quests.filter((q) => q.completed).length;
  const activeCount = quests.filter((q) => !q.completed).length;

  const handleAddQuest = (title: string, rarity: QuestRarity) => {
    const newQuest: Quest = {
      id: Date.now().toString(),
      title,
      rarity,
      xpReward: getXPReward(rarity),
      completed: false,
      createdAt: new Date(),
    };
    setQuests((prev) => [newQuest, ...prev]);
    toast.success("Quest accepted!", {
      description: `${title} has been added to your quest log.`,
      icon: <Scroll className="w-4 h-4" />,
    });
  };

  const handleCompleteQuest = (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (quest && !quest.completed) {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, completed: true } : q))
      );
      setTotalXP((prev) => prev + quest.xpReward);

      const newTotalXP = totalXP + quest.xpReward;
      const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;

      if (newLevel > level) {
        toast.success(`Level Up! You're now level ${newLevel}!`, {
          description: "Your power grows stronger, adventurer!",
          icon: <Shield className="w-4 h-4" />,
        });
      } else {
        toast.success("Quest Complete!", {
          description: `+${quest.xpReward} XP earned!`,
          icon: <Sword className="w-4 h-4" />,
        });
      }
    }
  };

  const handleDeleteQuest = (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    toast.info("Quest abandoned", {
      description: "The quest has been removed from your log.",
    });
  };

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

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
        </header>

        {/* XP Bar */}
        <div className="mb-6">
          <XPBar currentXP={totalXP} level={level} xpToNextLevel={XP_PER_LEVEL} />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <QuestStats
            completedQuests={completedCount}
            activeQuests={activeCount}
            streak={streak}
          />
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

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <section>
            <h2 className="text-xs text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Completed Quests ({completedQuests.length})
            </h2>
            <div className="space-y-4">
              {completedQuests.slice(0, 5).map((quest) => (
                <QuestCard
                  key={quest.id}
                  {...quest}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
            Your quest awaits, brave adventurer
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
