import React from "react";
import { cn } from "@/lib/utils";
import { Trophy, Star } from "lucide-react";

interface XPBarProps {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, level, xpToNextLevel }) => {
  const xpInCurrentLevel = currentXP % xpToNextLevel;
  const progress = (xpInCurrentLevel / xpToNextLevel) * 100;

  return (
    <div className="bg-card pixel-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-quest-gold flex items-center justify-center pixel-border-gold">
            <Trophy className="w-5 h-5 text-dungeon-dark" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Adventurer</p>
            <p className="text-sm text-primary pixel-text-shadow">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-quest-xp">
            <Star className="w-4 h-4 fill-quest-xp" />
            <span className="text-xs">{currentXP} XP</span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative h-6 bg-dungeon-stone border-2 border-border overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 xp-bar-fill transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] text-foreground pixel-text-shadow">
            {xpInCurrentLevel} / {xpToNextLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
