import { useState, useEffect, useCallback } from "react";
import { DailyStats, WeeklyReport, BurnoutIndicator, EnergyType } from "@/types/productivity";

const today = () => new Date().toISOString().split("T")[0];

const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
};

export const useAnalytics = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>(() => {
    const saved = localStorage.getItem("productivity-daily-stats");
    return saved ? JSON.parse(saved) : [];
  });

  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => {
    const saved = localStorage.getItem("productivity-weekly-reports");
    return saved ? JSON.parse(saved) : [];
  });

  const [burnout, setBurnout] = useState<BurnoutIndicator>(() => {
    const saved = localStorage.getItem("productivity-burnout");
    return saved ? JSON.parse(saved) : {
      level: 0,
      factors: { overwork: 0, missedBreaks: 0, streakPressure: 0, deadlineDensity: 0 },
      warnings: [],
      lastChecked: new Date(),
    };
  });

  useEffect(() => {
    localStorage.setItem("productivity-daily-stats", JSON.stringify(dailyStats.slice(-365)));
  }, [dailyStats]);

  useEffect(() => {
    localStorage.setItem("productivity-weekly-reports", JSON.stringify(weeklyReports.slice(-52)));
  }, [weeklyReports]);

  useEffect(() => {
    localStorage.setItem("productivity-burnout", JSON.stringify(burnout));
  }, [burnout]);

  const recordDayActivity = useCallback((activity: Partial<DailyStats>) => {
    const todayStr = today();
    
    setDailyStats(prev => {
      const existingIndex = prev.findIndex(s => s.date === todayStr);
      const existing = existingIndex >= 0 ? prev[existingIndex] : {
        date: todayStr,
        tasksCompleted: 0,
        tasksCreated: 0,
        xpEarned: 0,
        coinsEarned: 0,
        focusMinutes: 0,
        habitsCompleted: 0,
        habitsMissed: 0,
        energyDistribution: { mental: 0, physical: 0, creative: 0 },
        productivityScore: 0,
      };

      const updated: DailyStats = {
        ...existing,
        tasksCompleted: existing.tasksCompleted + (activity.tasksCompleted || 0),
        tasksCreated: existing.tasksCreated + (activity.tasksCreated || 0),
        xpEarned: existing.xpEarned + (activity.xpEarned || 0),
        coinsEarned: existing.coinsEarned + (activity.coinsEarned || 0),
        focusMinutes: existing.focusMinutes + (activity.focusMinutes || 0),
        habitsCompleted: existing.habitsCompleted + (activity.habitsCompleted || 0),
        habitsMissed: existing.habitsMissed + (activity.habitsMissed || 0),
        energyDistribution: activity.energyDistribution 
          ? {
              mental: existing.energyDistribution.mental + (activity.energyDistribution.mental || 0),
              physical: existing.energyDistribution.physical + (activity.energyDistribution.physical || 0),
              creative: existing.energyDistribution.creative + (activity.energyDistribution.creative || 0),
            }
          : existing.energyDistribution,
      };

      // Calculate productivity score
      updated.productivityScore = Math.min(100, Math.round(
        (updated.tasksCompleted * 10) +
        (updated.focusMinutes * 0.5) +
        (updated.habitsCompleted * 15) -
        (updated.habitsMissed * 5)
      ));

      if (existingIndex >= 0) {
        const newStats = [...prev];
        newStats[existingIndex] = updated;
        return newStats;
      }
      return [...prev, updated];
    });
  }, []);

  const updateBurnoutIndicator = useCallback((factors: Partial<BurnoutIndicator["factors"]>) => {
    setBurnout(prev => {
      const newFactors = { ...prev.factors, ...factors };
      const level = Math.min(100, Math.round(
        (newFactors.overwork * 0.4) +
        (newFactors.missedBreaks * 0.2) +
        (newFactors.streakPressure * 0.2) +
        (newFactors.deadlineDensity * 0.2)
      ));

      const warnings: string[] = [];
      if (level >= 80) warnings.push("Critical burnout risk - consider taking a break");
      else if (level >= 60) warnings.push("High stress detected - pace yourself");
      else if (level >= 40) warnings.push("Moderate stress - remember to take breaks");
      
      if (newFactors.overwork > 70) warnings.push("Working too many hours today");
      if (newFactors.missedBreaks > 60) warnings.push("Missing regular breaks");
      if (newFactors.streakPressure > 50) warnings.push("Don't let streak pressure control you");
      if (newFactors.deadlineDensity > 60) warnings.push("Many deadlines approaching");

      return {
        level,
        factors: newFactors,
        warnings,
        lastChecked: new Date(),
      };
    });
  }, []);

  const generateWeeklyReport = useCallback((): WeeklyReport => {
    const todayDate = new Date();
    const weekStart = getWeekStart(todayDate);
    const weekEnd = new Date(todayDate);
    
    const weekStats = dailyStats.filter(s => s.date >= weekStart);
    
    const totalTasks = weekStats.reduce((sum, s) => sum + s.tasksCompleted, 0);
    const totalXP = weekStats.reduce((sum, s) => sum + s.xpEarned, 0);
    const totalCoins = weekStats.reduce((sum, s) => sum + s.coinsEarned, 0);
    const totalFocus = weekStats.reduce((sum, s) => sum + s.focusMinutes, 0);
    const totalHabits = weekStats.reduce((sum, s) => sum + s.habitsCompleted, 0);
    const totalMissed = weekStats.reduce((sum, s) => sum + s.habitsMissed, 0);

    // Find most productive hour/day (simplified - would need hourly data for accuracy)
    const dayScores = [0, 0, 0, 0, 0, 0, 0];
    weekStats.forEach(s => {
      const dayOfWeek = new Date(s.date).getDay();
      dayScores[dayOfWeek] += s.productivityScore;
    });
    const mostProductiveDay = dayScores.indexOf(Math.max(...dayScores));

    // Generate insights
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (totalTasks > 20) insights.push(`Great week! Completed ${totalTasks} tasks.`);
    if (totalFocus > 300) insights.push(`Strong focus: ${Math.round(totalFocus / 60)} hours of deep work.`);
    if (totalHabits > 0 && totalMissed === 0) insights.push("Perfect habit completion!");
    
    const habitRate = totalHabits + totalMissed > 0 
      ? totalHabits / (totalHabits + totalMissed) 
      : 0;
    if (habitRate < 0.7 && totalHabits + totalMissed > 0) {
      recommendations.push("Focus on habit consistency - aim for 70%+ completion");
    }
    if (totalFocus < 120) {
      recommendations.push("Try adding more focus sessions to boost productivity");
    }
    if (burnout.level > 50) {
      recommendations.push("Your burnout indicator is elevated - consider more rest");
    }

    const report: WeeklyReport = {
      weekStart,
      weekEnd: weekEnd.toISOString().split("T")[0],
      totalTasks,
      completedTasks: totalTasks,
      missedTasks: 0,
      totalXP,
      totalCoins,
      totalFocusMinutes: totalFocus,
      averageFocusQuality: 75, // Would calculate from actual sessions
      habitSuccessRate: habitRate * 100,
      mostProductiveHour: 10, // Would need hourly tracking
      mostProductiveDay,
      insights,
      recommendations,
      generatedAt: new Date(),
    };

    setWeeklyReports(prev => {
      const existingIndex = prev.findIndex(r => r.weekStart === weekStart);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = report;
        return updated;
      }
      return [...prev, report];
    });

    return report;
  }, [dailyStats, burnout.level]);

  const getTodayStats = useCallback((): DailyStats | null => {
    return dailyStats.find(s => s.date === today()) || null;
  }, [dailyStats]);

  const getProductivityTrend = useCallback((days: number = 7): { date: string; score: number }[] => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return dailyStats
      .filter(s => s.date >= startDate.toISOString().split("T")[0])
      .map(s => ({ date: s.date, score: s.productivityScore }))
      .slice(-days);
  }, [dailyStats]);

  const getEnergyBalance = useCallback((): Record<EnergyType, number> => {
    const recent = dailyStats.slice(-7);
    return recent.reduce(
      (acc, s) => ({
        mental: acc.mental + s.energyDistribution.mental,
        physical: acc.physical + s.energyDistribution.physical,
        creative: acc.creative + s.energyDistribution.creative,
      }),
      { mental: 0, physical: 0, creative: 0 }
    );
  }, [dailyStats]);

  return {
    dailyStats,
    weeklyReports,
    burnout,
    recordDayActivity,
    updateBurnoutIndicator,
    generateWeeklyReport,
    getTodayStats,
    getProductivityTrend,
    getEnergyBalance,
  };
};
