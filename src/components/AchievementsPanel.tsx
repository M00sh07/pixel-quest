import React from "react";
import { cn } from "@/lib/utils";
import { Achievement } from "@/types/quest";
import { Trophy, Star, Flame, Crown, Target, Sword, Lock } from "lucide-react";

interface AchievementsPanelProps {
  achievements: Achievement[];
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  sword: <Sword className="w-5 h-5" />,
};

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card pixel-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-quest-gold flex items-center justify-center pixel-border-gold">
              <Trophy className="w-5 h-5 text-dungeon-dark" />
            </div>
            <div>
              <h2 className="text-sm text-primary pixel-text-shadow">Achievements</h2>
              <p className="text-[10px] text-muted-foreground uppercase">
                {unlockedCount} / {achievements.length} Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "flex items-center gap-4 p-4 border-2 transition-all",
                achievement.unlocked
                  ? "border-quest-gold bg-quest-gold/10"
                  : "border-border bg-muted/50 opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center border-2",
                  achievement.unlocked
                    ? "bg-quest-gold border-quest-gold text-dungeon-dark"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {achievement.unlocked ? (
                  iconMap[achievement.icon] || <Trophy className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={cn(
                    "text-xs mb-1",
                    achievement.unlocked ? "text-quest-gold" : "text-muted-foreground"
                  )}
                >
                  {achievement.name}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              {achievement.unlocked && (
                <Star className="w-4 h-4 text-quest-gold fill-quest-gold" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
