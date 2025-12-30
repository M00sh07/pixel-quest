import React, { useState, useEffect, useCallback } from "react";
import { QuestCard } from "@/components/QuestCard";
import { XPBar } from "@/components/XPBar";
import { AddQuestForm } from "@/components/AddQuestForm";
import { PixelCharacter } from "@/components/PixelCharacter";
import { QuestStats } from "@/components/QuestStats";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CompletedQuestsPanel } from "@/components/CompletedQuestsPanel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { TaskPanel } from "@/components/TaskPanel";
import { HabitPanel } from "@/components/HabitPanel";
import { CompanionPanel } from "@/components/CompanionPanel";
import { CoinDisplay } from "@/components/CoinDisplay";
import { ShopPanel } from "@/components/ShopPanel";
import { SkillTreePanel } from "@/components/SkillTreePanel";
import { FocusTimer } from "@/components/FocusTimer";
import { ProjectPanel } from "@/components/ProjectPanel";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SmartSuggestions } from "@/components/SmartSuggestions";
import { UndoToast } from "@/components/UndoToast";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useEnhancedTasks } from "@/hooks/useEnhancedTasks";
import { useHabits } from "@/hooks/useHabits";
import { useCompanion } from "@/hooks/useCompanion";
import { useCoins } from "@/hooks/useCoins";
import { useSkillTree } from "@/hooks/useSkillTree";
import { useProjects } from "@/hooks/useProjects";
import { useFocus } from "@/hooks/useFocus";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useUndo } from "@/hooks/useUndo";
import { useAccessibility } from "@/hooks/useAccessibility";
import { toast } from "sonner";
import { 
  Sword, Shield, Scroll, Trophy, Award, Target, 
  Store, TreeDeciduous, BarChart3, Zap, FolderKanban
} from "lucide-react";
import { 
  Quest, 
  QuestRarity, 
  RepeatFrequency, 
  getXPReward, 
  getLevelFromTotalXP 
} from "@/types/quest";
import { PixelButton } from "@/components/PixelButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // ============ QUEST STATE (EXISTING) ============
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
    return [];
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
  const [showShop, setShowShop] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("quests");

  // ============ NEW HOOKS ============
  const { achievements, checkAchievements } = useAchievements();
  const { challenges, updateProgress, completedCount: dailyChallengesCompleted } = useDailyChallenges();
  const enhancedTasks = useEnhancedTasks();
  const habits = useHabits();
  const companion = useCompanion();
  const coins = useCoins();
  const skillTree = useSkillTree();
  const projects = useProjects();
  const focus = useFocus();
  const analytics = useAnalytics();
  const undo = useUndo();
  const accessibility = useAccessibility();

  // ============ PERSISTENCE ============
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

  // ============ DERIVED STATE ============
  const { level, currentLevelXP, xpForNextLevel } = getLevelFromTotalXP(totalXP);
  const completedCount = quests.filter((q) => q.completed).length;
  const legendaryCompleted = quests.filter((q) => q.completed && q.rarity === "legendary").length;
  const activeCount = quests.filter((q) => !q.completed).length;

  // ============ ACHIEVEMENT CHECKING ============
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

  // ============ QUEST HANDLERS ============
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
      
      // Store for undo
      const originalQuest = { ...quest };
      
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { 
          ...q, 
          completed: true,
          completedAt: new Date(),
          lastCompletedDate: today,
        } : q))
      );
      
      const xpGained = quest.xpReward;
      const coinsGained = Math.floor(xpGained * 0.5);
      
      setTotalXP((prev) => prev + xpGained);
      setTodayQuestsCompleted(prev => prev + 1);
      setTodayXPEarned(prev => prev + xpGained);
      
      // Award coins
      coins.earnCoins(coinsGained, "quest", `Completed quest: ${quest.title}`);
      
      // Update companion
      companion.feedCompanion(5);
      companion.updateFromActivity({ tasksCompleted: 1 });
      
      // Track analytics
      analytics.recordDayActivity({ tasksCompleted: 1, xpEarned: xpGained, coinsEarned: coinsGained });
      
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
          description: `+${xpGained} XP, +${coinsGained} coins earned!`,
          icon: <Sword className="w-4 h-4" />,
        });
      }

      // Undo support
      undo.pushUndo({
        type: 'task-complete',
        data: originalQuest,
        description: `Complete quest: ${quest.title}`
      });

      // Handle repeating quests
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
  }, [quests, totalXP, level, todayQuestsCompleted, todayXPEarned, updateProgress, coins, companion, analytics, undo]);

  const handleDeleteQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (quest) {
      undo.pushUndo({
        type: 'task-delete',
        data: quest,
        description: `Delete quest: ${quest.title}`
      });
    }
    setQuests((prev) => prev.filter((q) => q.id !== id));
    toast.info("Quest abandoned", {
      description: "The quest has been removed from your log.",
    });
  };

  // ============ TASK HANDLERS ============
  const handleTaskComplete = (taskId: string) => {
    const task = enhancedTasks.tasks.find(t => t.id === taskId);
    if (task) {
      const rewards = enhancedTasks.completeTask(taskId);
      if (rewards) {
        setTotalXP(prev => prev + rewards.xp);
        coins.earnCoins(rewards.coins, "task", `Task: ${task.title}`);
        companion.feedCompanion(task.difficulty === 'boss' ? 20 : 5);
        companion.updateFromActivity({ tasksCompleted: 1 });
        analytics.recordDayActivity({ 
          tasksCompleted: 1, 
          xpEarned: rewards.xp, 
          coinsEarned: rewards.coins 
        });
      }
    }
  };

  // ============ HABIT HANDLERS ============
  const handleHabitComplete = (habitId: string, value?: number) => {
    const result = habits.completeHabit(habitId, value);
    if (result) {
      setTotalXP(prev => prev + result.xp);
      coins.earnCoins(result.coins, "habit", "Habit completed");
      companion.feedCompanion(3);
      companion.updateFromActivity({ habitsCompleted: 1 });
      analytics.recordDayActivity({ habitsCompleted: 1, xpEarned: result.xp, coinsEarned: result.coins });
    }
  };

  // ============ FOCUS HANDLERS ============
  const handleFocusEnd = () => {
    const result = focus.endSession();
    if (result) {
      setTotalXP(prev => prev + result.xp);
      coins.earnCoins(result.coins, "focus", "Focus session");
      companion.updateFromActivity({ focusMinutes: result.session.actualMinutes });
      analytics.recordDayActivity({ 
        focusMinutes: result.session.actualMinutes, 
        xpEarned: result.xp, 
        coinsEarned: result.coins 
      });
    }
    return result;
  };

  // ============ PROJECT HANDLERS ============
  const handleCompleteMilestone = (projectId: string, milestoneId: string) => {
    const rewards = projects.completeMilestone(projectId, milestoneId);
    setTotalXP(prev => prev + rewards.xp);
    coins.earnCoins(rewards.coins, "project", "Milestone completed");
    analytics.recordDayActivity({ xpEarned: rewards.xp, coinsEarned: rewards.coins });
  };

  // ============ UNDO HANDLER ============
  const handleUndo = () => {
    const action = undo.popUndo();
    if (action) {
      if (action.type === 'task-complete' || action.type === 'task-delete') {
        setQuests(prev => [action.data as Quest, ...prev.filter(q => q.id !== (action.data as Quest).id)]);
      }
      toast.info("Action undone", { description: action.description });
    }
  };

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  // Get suggestions for smart suggestions component
  const suggestions = enhancedTasks.getSuggestedTasks(
    companion.companion?.mood === 'happy' || companion.companion?.mood === 'ecstatic' ? 'mental' : 'physical',
    60
  );

  return (
    <div className={`min-h-screen bg-background relative overflow-hidden ${accessibility.settings.reducedMotion ? 'reduce-motion' : ''} ${accessibility.settings.highContrast ? 'high-contrast' : ''}`}>
      {/* Background */}
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
      <div className="fixed inset-0 bg-gradient-to-b from-dungeon-dark/50 via-transparent to-dungeon-dark/80 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <PixelCharacter level={level} />
            <div>
              <h1 className="text-lg md:text-xl text-primary pixel-text-shadow">
                Pixel Quest
              </h1>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
                Gamified Productivity System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <CoinDisplay coins={coins.coins} />
            
            <PixelButton variant="ghost" size="sm" onClick={() => setShowShop(true)}>
              <Store className="w-4 h-4 text-quest-gold" />
            </PixelButton>
            
            <PixelButton variant="ghost" size="sm" onClick={() => setShowSkillTree(true)}>
              <TreeDeciduous className="w-4 h-4 text-accent" />
            </PixelButton>
            
            <PixelButton variant="ghost" size="sm" onClick={() => setShowAchievements(true)}>
              <Trophy className="w-4 h-4 text-quest-gold" />
              <span className="text-[8px] ml-1">{unlockedAchievements}</span>
            </PixelButton>
            
            <PixelButton variant="ghost" size="sm" onClick={() => setShowAnalytics(true)}>
              <BarChart3 className="w-4 h-4 text-quest-mana" />
            </PixelButton>
          </div>
        </header>

        {/* XP Bar */}
        <div className="mb-4">
          <XPBar 
            currentXP={totalXP} 
            level={level} 
            currentLevelXP={currentLevelXP}
            xpToNextLevel={xpForNextLevel} 
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuestStats
                completedQuests={completedCount}
                activeQuests={activeCount}
                streak={streak}
              />
              <DailyChallenges challenges={challenges} />
            </div>

            {/* Smart Suggestions */}
            <SmartSuggestions 
              suggestions={suggestions}
              tasks={enhancedTasks.tasks}
              onSelectTask={handleTaskComplete}
            />

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card pixel-border mb-4">
                <TabsTrigger value="quests" className="text-[8px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Sword className="w-3 h-3 mr-1" />
                  Quests
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-[8px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Target className="w-3 h-3 mr-1" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="habits" className="text-[8px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  Habits
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-[8px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FolderKanban className="w-3 h-3 mr-1" />
                  Projects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quests" className="space-y-4">
                <AddQuestForm onAdd={handleAddQuest} />
                <section>
                  <h2 className="text-[10px] text-primary uppercase mb-3 flex items-center gap-2">
                    <Sword className="w-3 h-3" />
                    Active Quests ({activeQuests.length})
                  </h2>
                  <div className="space-y-3">
                    {activeQuests.length === 0 ? (
                      <div className="bg-card pixel-border p-6 text-center">
                        <p className="text-[9px] text-muted-foreground">
                          No active quests. Accept a quest to begin!
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
                <CompletedQuestsPanel 
                  quests={completedQuests} 
                  onDelete={handleDeleteQuest}
                />
              </TabsContent>

              <TabsContent value="tasks">
                <TaskPanel 
                  tasks={enhancedTasks.tasks}
                  onAdd={enhancedTasks.createTask}
                  onStart={enhancedTasks.startTask}
                  onComplete={handleTaskComplete}
                  onDelete={enhancedTasks.deleteTask}
                  onCompleteSubtask={enhancedTasks.completeSubtask}
                />
              </TabsContent>

              <TabsContent value="habits">
                <HabitPanel 
                  habits={habits.getTodayHabits()}
                  getStats={habits.getHabitStats}
                  onComplete={handleHabitComplete}
                  onMiss={habits.missHabit}
                  onDelete={habits.deleteHabit}
                  onAdd={habits.addHabit}
                />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectPanel 
                  projects={projects.projects}
                  onCreate={projects.createProject}
                  onCompleteMilestone={handleCompleteMilestone}
                  onUpdateStatus={projects.updateProjectStatus}
                  onDelete={projects.deleteProject}
                  getProgress={projects.getProjectProgress}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Focus Timer */}
            <FocusTimer 
              activeSession={focus.activeSession}
              streak={focus.streak}
              isBreak={focus.isBreak}
              onStart={focus.startSession}
              onStartBreak={focus.startBreak}
              onEndBreak={focus.endBreak}
              onLogDistraction={focus.logDistraction}
              onEnd={handleFocusEnd}
              onCancel={focus.cancelSession}
            />

            {/* Companion Panel */}
            <CompanionPanel 
              companion={companion.companion}
              onFeed={companion.feedCompanion}
              onRename={companion.renameCompanion}
              canFeed={true}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-[7px] text-muted-foreground uppercase tracking-widest">
            Your quest awaits, brave adventurer
          </p>
        </footer>
      </div>

      {/* Modals */}
      {showAchievements && (
        <AchievementsPanel 
          achievements={achievements} 
          onClose={() => setShowAchievements(false)} 
        />
      )}

      {showShop && (
        <ShopPanel 
          coins={coins.coins}
          items={coins.getShopItems()}
          onPurchase={(itemId) => {
            const result = coins.purchaseItem(itemId);
            if (result.success) {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
            return result;
          }}
        />
      )}

      {showSkillTree && (
        <SkillTreePanel 
          skills={skillTree.skills}
          nodes={skillTree.nodes}
          onUnlock={skillTree.unlockNode}
          canUnlock={(nodeId) => skillTree.skills.skillPoints > 0}
          getNodesByCategory={skillTree.getNodesByCategory}
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard 
          todayStats={analytics.getTodayStats()}
          burnout={analytics.burnout}
          weeklyReport={analytics.weeklyReports[analytics.weeklyReports.length - 1] || null}
          productivityTrend={analytics.getProductivityTrend(7)}
          energyBalance={analytics.getEnergyBalance()}
          onGenerateReport={analytics.generateWeeklyReport}
        />
      )}

      {/* Undo Toast */}
      <UndoToast 
        action={undo.getLatestUndo()}
        onUndo={handleUndo}
        onDismiss={() => undo.removeUndo(undo.getLatestUndo()?.id || '')}
      />
    </div>
  );
};

export default Index;
