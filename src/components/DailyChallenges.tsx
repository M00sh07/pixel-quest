import React from "react";
import { cn } from "@/lib/utils";
import { DailyChallenge } from "@/types/quest";
import { Target, Star, CheckCircle, Zap } from "lucide-react";

interface DailyChallengesProps {
  challenges: DailyChallenge[];
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ challenges }) => {
  if (challenges.length === 0) return null;

  return (
    <div className="bg-card pixel-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-quest-legendary" />
        <h3 className="text-xs text-quest-legendary uppercase">Daily Challenges</h3>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => {
          const progress = Math.min((challenge.progress / challenge.requirement) * 100, 100);
          
          return (
            <div
              key={challenge.id}
              className={cn(
                "p-3 border-2 transition-all",
                challenge.completed
                  ? "border-quest-xp bg-quest-xp/10"
                  : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {challenge.completed ? (
                    <CheckCircle className="w-4 h-4 text-quest-xp" />
                  ) : (
                    <Target className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-[10px]",
                    challenge.completed ? "text-quest-xp line-through" : "text-foreground"
                  )}>
                    {challenge.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-quest-xp">
                  <Star className="w-3 h-3 fill-quest-xp" />
                  <span className="text-[10px]">+{challenge.xpReward}</span>
                </div>
              </div>

              <p className="text-[8px] text-muted-foreground mb-2">
                {challenge.description}
              </p>

              {/* Progress bar */}
              <div className="relative h-3 bg-dungeon-stone border border-border overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-500",
                    challenge.completed ? "bg-quest-xp" : "bg-quest-mana"
                  )}
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[6px] text-foreground pixel-text-shadow">
                    {challenge.progress} / {challenge.requirement}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
