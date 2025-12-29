import { useState, useEffect, useCallback, useRef } from "react";
import { FocusSession, FocusStreak, FocusSessionType, DistractionEntry } from "@/types/productivity";

const today = () => new Date().toISOString().split("T")[0];

export const useFocus = () => {
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem("productivity-focus-sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState<FocusStreak>(() => {
    const saved = localStorage.getItem("productivity-focus-streak");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if streak is still valid
      const lastSession = parsed.lastSessionDate;
      if (lastSession) {
        const lastDate = new Date(lastSession);
        const todayDate = new Date(today());
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          return { ...parsed, currentStreak: 0 };
        }
      }
      return parsed;
    }
    return {
      currentStreak: 0,
      bestStreak: 0,
      todayMinutes: 0,
      weeklyMinutes: 0,
      averageSessionQuality: 0,
    };
  });

  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isBreak, setIsBreak] = useState(false);
  const breakStartRef = useRef<Date | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem("productivity-focus-sessions", JSON.stringify(sessions.slice(-1000)));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("productivity-focus-streak", JSON.stringify(streak));
  }, [streak]);

  // Update today's minutes
  useEffect(() => {
    const todayStr = today();
    const todayMinutes = sessions
      .filter(s => s.startedAt && new Date(s.startedAt).toISOString().split("T")[0] === todayStr)
      .reduce((sum, s) => sum + s.actualMinutes, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyMinutes = sessions
      .filter(s => s.startedAt && new Date(s.startedAt) >= weekStart)
      .reduce((sum, s) => sum + s.actualMinutes, 0);

    setStreak(prev => ({
      ...prev,
      todayMinutes,
      weeklyMinutes,
    }));
  }, [sessions]);

  const startSession = useCallback((type: FocusSessionType, plannedMinutes: number, taskId?: string): FocusSession => {
    const session: FocusSession = {
      id: crypto.randomUUID(),
      type,
      taskId,
      plannedMinutes,
      actualMinutes: 0,
      startedAt: new Date(),
      breaks: [],
      distractionLog: [],
      focusQuality: 100,
      xpEarned: 0,
      coinsEarned: 0,
    };

    setActiveSession(session);

    // Start the ticker
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = setInterval(() => {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actualMinutes: Math.round((Date.now() - new Date(prev.startedAt).getTime()) / 60000),
        };
      });
    }, 1000);

    return session;
  }, []);

  const startBreak = useCallback(() => {
    if (!activeSession) return;
    setIsBreak(true);
    breakStartRef.current = new Date();
  }, [activeSession]);

  const endBreak = useCallback(() => {
    if (!activeSession || !breakStartRef.current) return;
    
    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        breaks: [...prev.breaks, { start: breakStartRef.current!, end: new Date() }],
      };
    });
    
    setIsBreak(false);
    breakStartRef.current = null;
  }, [activeSession]);

  const logDistraction = useCallback((description: string, durationMinutes: number) => {
    if (!activeSession) return;

    const entry: DistractionEntry = {
      timestamp: new Date(),
      description,
      durationMinutes,
    };

    setActiveSession(prev => {
      if (!prev) return null;
      const distractionPenalty = Math.min(durationMinutes * 2, 20);
      return {
        ...prev,
        distractionLog: [...prev.distractionLog, entry],
        focusQuality: Math.max(0, prev.focusQuality - distractionPenalty),
      };
    });
  }, [activeSession]);

  const endSession = useCallback((): { xp: number; coins: number; session: FocusSession } | null => {
    if (!activeSession) return null;

    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }

    const endTime = new Date();
    const actualMinutes = Math.round((endTime.getTime() - new Date(activeSession.startedAt).getTime()) / 60000);
    
    // Calculate break time
    const breakMinutes = activeSession.breaks.reduce((sum, b) => {
      return sum + Math.round((new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000);
    }, 0);

    const effectiveMinutes = Math.max(0, actualMinutes - breakMinutes);
    
    // Calculate rewards
    const baseXP = effectiveMinutes * 2;
    const qualityMultiplier = activeSession.focusQuality / 100;
    const xpEarned = Math.round(baseXP * qualityMultiplier);
    const coinsEarned = Math.round(effectiveMinutes * 0.5 * qualityMultiplier);

    const completedSession: FocusSession = {
      ...activeSession,
      actualMinutes: effectiveMinutes,
      endedAt: endTime,
      xpEarned,
      coinsEarned,
    };

    setSessions(prev => [...prev, completedSession]);

    // Update streak
    const todayStr = today();
    const hadSessionToday = sessions.some(
      s => new Date(s.startedAt).toISOString().split("T")[0] === todayStr
    );

    setStreak(prev => {
      const newStreak = hadSessionToday ? prev.currentStreak : prev.currentStreak + 1;
      const avgQuality = sessions.length > 0
        ? (prev.averageSessionQuality * sessions.length + completedSession.focusQuality) / (sessions.length + 1)
        : completedSession.focusQuality;
      
      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        todayMinutes: prev.todayMinutes + effectiveMinutes,
        weeklyMinutes: prev.weeklyMinutes + effectiveMinutes,
        averageSessionQuality: Math.round(avgQuality),
      };
    });

    setActiveSession(null);
    setIsBreak(false);

    return { xp: xpEarned, coins: coinsEarned, session: completedSession };
  }, [activeSession, sessions]);

  const cancelSession = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    setActiveSession(null);
    setIsBreak(false);
    breakStartRef.current = null;
  }, []);

  const getTodaySessions = useCallback((): FocusSession[] => {
    const todayStr = today();
    return sessions.filter(
      s => new Date(s.startedAt).toISOString().split("T")[0] === todayStr
    );
  }, [sessions]);

  const getSessionsByType = useCallback((type: FocusSessionType): FocusSession[] => {
    return sessions.filter(s => s.type === type);
  }, [sessions]);

  return {
    sessions,
    streak,
    activeSession,
    isBreak,
    startSession,
    startBreak,
    endBreak,
    logDistraction,
    endSession,
    cancelSession,
    getTodaySessions,
    getSessionsByType,
  };
};
