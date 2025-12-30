import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { Heart, Zap, Star, Edit2, Check } from "lucide-react";
import { 
  Companion, 
  COMPANION_ARCHETYPES, 
  EVOLUTION_REQUIREMENTS 
} from "@/types/productivity";

interface CompanionPanelProps {
  companion: Companion;
  onFeed: (amount: number) => void;
  onRename: (name: string) => void;
  canFeed: boolean; // Based on having companion treats
}

const moodEmojis: Record<string, string> = {
  ecstatic: "😄",
  happy: "😊",
  content: "🙂",
  neutral: "😐",
  tired: "😔",
  exhausted: "😫",
  sad: "😢",
};

const skinOptions = ["default", "forest", "fire", "water", "shadow", "gold"];

export const CompanionPanel: React.FC<CompanionPanelProps> = ({
  companion,
  onFeed,
  onRename,
  canFeed,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(companion.name);

  const archetype = COMPANION_ARCHETYPES[companion.archetype];
  const currentEvolution = EVOLUTION_REQUIREMENTS[companion.evolutionStage];
  const nextEvolution = companion.evolutionStage < 5 
    ? EVOLUTION_REQUIREMENTS[(companion.evolutionStage + 1) as keyof typeof EVOLUTION_REQUIREMENTS]
    : null;

  const progressToNext = nextEvolution 
    ? Math.min(100, (companion.evolutionPoints / nextEvolution.points) * 100)
    : 100;

  const handleRename = () => {
    if (newName.trim() && newName !== companion.name) {
      onRename(newName.trim());
    }
    setIsEditing(false);
  };

  // Get companion sprite based on evolution stage and mood
  const getCompanionVisual = () => {
    const stageSprites: Record<number, string> = {
      1: "🥚",
      2: "🐣",
      3: "🐤",
      4: "🦅",
      5: "🐉",
    };
    return stageSprites[companion.evolutionStage] || "🥚";
  };

  return (
    <div className="bg-card pixel-border p-4 space-y-4">
      {/* Companion Visual */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className={cn(
            "text-6xl floating-animation",
            companion.mood === "ecstatic" && "animate-bounce-pixel"
          )}>
            {getCompanionVisual()}
          </div>
          <div className="absolute -top-2 -right-2 text-2xl">
            {moodEmojis[companion.mood]}
          </div>
        </div>

        {/* Name */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-input border-2 border-border px-2 py-1 text-sm text-center font-pixel w-32"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <button onClick={handleRename} className="text-quest-xp">
                <Check className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm">{companion.name}</h3>
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Archetype */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-lg">{archetype.icon}</span>
          <span className="text-[10px] text-muted-foreground">{archetype.name}</span>
        </div>
      </div>

      {/* Stats Bars */}
      <div className="space-y-3">
        {/* Energy */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-quest-legendary" />
              Energy
            </span>
            <span>{companion.energy}/100</span>
          </div>
          <div className="h-3 bg-muted border border-border">
            <div
              className={cn(
                "h-full transition-all duration-300",
                companion.energy > 50 ? "bg-quest-legendary" : 
                companion.energy > 20 ? "bg-quest-gold" : "bg-destructive"
              )}
              style={{ width: `${companion.energy}%` }}
            />
          </div>
        </div>

        {/* Happiness */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-quest-health" />
              Happiness
            </span>
            <span>{companion.happiness}/100</span>
          </div>
          <div className="h-3 bg-muted border border-border">
            <div
              className={cn(
                "h-full transition-all duration-300",
                companion.happiness > 50 ? "bg-quest-health" : 
                companion.happiness > 20 ? "bg-quest-gold" : "bg-muted-foreground"
              )}
              style={{ width: `${companion.happiness}%` }}
            />
          </div>
        </div>

        {/* Evolution Progress */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-quest-rare" />
              Evolution Stage {companion.evolutionStage}
            </span>
            <span>{companion.evolutionPoints.toFixed(0)} pts</span>
          </div>
          <div className="h-3 bg-muted border border-border">
            <div
              className="h-full bg-quest-rare transition-all duration-300"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          {nextEvolution && (
            <p className="text-[8px] text-muted-foreground mt-1">
              Next: {nextEvolution.points} pts → {nextEvolution.bonusUnlock}
            </p>
          )}
        </div>
      </div>

      {/* Active Bonus */}
      {companion.activeBonus && (
        <div className="bg-muted p-2 text-center">
          <span className="text-[10px] text-quest-xp">
            {companion.activeBonus.description}
          </span>
        </div>
      )}

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted p-2">
          <div className="text-xs text-quest-xp">{companion.totalTasksWitnessed}</div>
          <div className="text-[8px] text-muted-foreground">Tasks</div>
        </div>
        <div className="bg-muted p-2">
          <div className="text-xs text-quest-mana">{Math.round(companion.totalFocusMinutes)}</div>
          <div className="text-[8px] text-muted-foreground">Focus min</div>
        </div>
        <div className="bg-muted p-2">
          <div className="text-xs text-quest-legendary">{companion.totalHabitsWitnessed}</div>
          <div className="text-[8px] text-muted-foreground">Habits</div>
        </div>
      </div>

      {/* Streak */}
      <div className="text-center text-[10px] text-muted-foreground">
        🔥 {companion.consecutiveDaysActive} days together
      </div>

      {/* Feed Button */}
      <PixelButton
        variant="quest"
        className="w-full"
        onClick={() => onFeed(20)}
        disabled={!canFeed || companion.energy >= 100}
      >
        🍎 Feed Companion
      </PixelButton>
      {!canFeed && (
        <p className="text-[8px] text-center text-muted-foreground">
          Get Companion Treats from the shop!
        </p>
      )}
    </div>
  );
};