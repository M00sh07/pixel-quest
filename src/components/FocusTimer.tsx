import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  AlertTriangle,
  Target,
  Flame,
  Clock
} from "lucide-react";
import { FocusSession, FocusStreak, FocusSessionType } from "@/types/productivity";

interface FocusTimerProps {
  activeSession: FocusSession | null;
  streak: FocusStreak;
  isBreak: boolean;
  onStart: (type: FocusSessionType, minutes: number, taskId?: string) => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
  onLogDistraction: (description: string, duration: number) => void;
  onEnd: () => { xp: number; coins: number; session: FocusSession } | null;
  onCancel: () => void;
}

const sessionTypes: { value: FocusSessionType; label: string; icon: string; defaultMinutes: number }[] = [
  { value: "deep-work", label: "Deep Work", icon: "🎯", defaultMinutes: 90 },
  { value: "shallow", label: "Shallow", icon: "📋", defaultMinutes: 25 },
  { value: "creative", label: "Creative", icon: "🎨", defaultMinutes: 45 },
  { value: "learning", label: "Learning", icon: "📚", defaultMinutes: 60 },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  activeSession,
  streak,
  isBreak,
  onStart,
  onStartBreak,
  onEndBreak,
  onLogDistraction,
  onEnd,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<FocusSessionType>("deep-work");
  const [plannedMinutes, setPlannedMinutes] = useState(45);
  const [displayTime, setDisplayTime] = useState("00:00");
  const [showDistractionForm, setShowDistractionForm] = useState(false);
  const [distractionText, setDistractionText] = useState("");

  // Update display time
  useEffect(() => {
    if (!activeSession) {
      setDisplayTime("00:00");
      return;
    }

    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setDisplayTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleLogDistraction = () => {
    if (distractionText.trim()) {
      onLogDistraction(distractionText.trim(), 2); // Default 2 minutes
      setDistractionText("");
      setShowDistractionForm(false);
    }
  };

  const progressPercent = activeSession && activeSession.plannedMinutes > 0
    ? Math.min(100, (activeSession.actualMinutes / activeSession.plannedMinutes) * 100)
    : 0;

  if (!activeSession) {
    return (
      <div className="bg-card pixel-border p-4 space-y-4">
        {/* Streak Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-quest-mana" />
            Focus Session
          </h2>
          <div className="flex items-center gap-2 text-[10px]">
            <Flame className="w-3 h-3 text-quest-legendary" />
            <span>{streak.currentStreak} day streak</span>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-mana">{streak.todayMinutes}</div>
            <div className="text-[8px] text-muted-foreground">Today (min)</div>
          </div>
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-xp">{streak.weeklyMinutes}</div>
            <div className="text-[8px] text-muted-foreground">This Week</div>
          </div>
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-rare">{streak.averageSessionQuality}%</div>
            <div className="text-[8px] text-muted-foreground">Avg Quality</div>
          </div>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-2">
            Session Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sessionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setSelectedType(type.value);
                  setPlannedMinutes(type.defaultMinutes);
                }}
                className={cn(
                  "p-3 border-2 text-[10px] transition-all flex items-center gap-2",
                  selectedType === type.value
                    ? "border-quest-mana bg-quest-mana/20"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <span>{type.icon}</span>
                <div className="text-left">
                  <div className="uppercase">{type.label}</div>
                  <div className="text-[8px] text-muted-foreground">{type.defaultMinutes} min</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase mb-2">
            Duration: {plannedMinutes} minutes
          </label>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={plannedMinutes}
            onChange={(e) => setPlannedMinutes(Number(e.target.value))}
            className="w-full accent-quest-mana"
          />
        </div>

        {/* Start Button */}
        <PixelButton
          variant="quest"
          className="w-full"
          onClick={() => onStart(selectedType, plannedMinutes)}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Focus Session
        </PixelButton>
      </div>
    );
  }

  // Active session view
  return (
    <div className="bg-card pixel-border p-4 space-y-4">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {sessionTypes.find(t => t.value === activeSession.type)?.icon}
          </span>
          <span className="text-[10px] uppercase text-muted-foreground">
            {activeSession.type.replace("-", " ")}
          </span>
        </div>
        <div className={cn(
          "px-2 py-1 text-[10px] uppercase",
          isBreak ? "bg-quest-xp/20 text-quest-xp" : "bg-quest-mana/20 text-quest-mana"
        )}>
          {isBreak ? "Break" : "Focusing"}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center py-6">
        <div className="text-4xl font-pixel text-quest-mana pixel-text-shadow">
          {displayTime}
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">
          Goal: {activeSession.plannedMinutes} minutes
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="h-4 bg-muted border border-border">
          <div
            className={cn(
              "h-full transition-all duration-1000",
              progressPercent >= 100 ? "bg-quest-xp" : "bg-quest-mana"
            )}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
          <span>{activeSession.actualMinutes} min</span>
          <span>{activeSession.plannedMinutes} min</span>
        </div>
      </div>

      {/* Quality Indicator */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Focus Quality</span>
        <span className={cn(
          activeSession.focusQuality >= 80 ? "text-quest-xp" :
          activeSession.focusQuality >= 50 ? "text-quest-gold" : "text-destructive"
        )}>
          {activeSession.focusQuality}%
        </span>
      </div>

      {/* Distraction Log Button */}
      {!showDistractionForm ? (
        <button
          onClick={() => setShowDistractionForm(true)}
          className="w-full text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 py-2 border border-dashed border-border"
        >
          <AlertTriangle className="w-3 h-3" />
          Log a distraction
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={distractionText}
            onChange={(e) => setDistractionText(e.target.value)}
            placeholder="What distracted you?"
            className="w-full bg-input border-2 border-border p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive font-pixel"
            autoFocus
          />
          <div className="flex gap-2">
            <PixelButton
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={handleLogDistraction}
            >
              Log
            </PixelButton>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDistractionForm(false);
                setDistractionText("");
              }}
            >
              Cancel
            </PixelButton>
          </div>
        </div>
      )}

      {/* Session Controls */}
      <div className="flex gap-2">
        {!isBreak ? (
          <PixelButton
            variant="ghost"
            className="flex-1"
            onClick={onStartBreak}
          >
            <Coffee className="w-4 h-4 mr-2" />
            Take Break
          </PixelButton>
        ) : (
          <PixelButton
            variant="xp"
            className="flex-1"
            onClick={onEndBreak}
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </PixelButton>
        )}
        <PixelButton
          variant="quest"
          className="flex-1"
          onClick={onEnd}
        >
          <Square className="w-4 h-4 mr-2" />
          End Session
        </PixelButton>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-full text-[10px] text-muted-foreground hover:text-destructive"
      >
        Cancel without saving
      </button>
    </div>
  );
};