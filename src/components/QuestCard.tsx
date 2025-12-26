import React from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { Sword, Star, Trash2, CheckCircle } from "lucide-react";

export type QuestRarity = "common" | "rare" | "legendary";

interface QuestCardProps {
  id: string;
  title: string;
  xpReward: number;
  rarity: QuestRarity;
  completed: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const rarityStyles: Record<QuestRarity, string> = {
  common: "border-border",
  rare: "border-quest-rare",
  legendary: "border-quest-legendary animate-pulse-glow",
};

const rarityLabels: Record<QuestRarity, string> = {
  common: "Common",
  rare: "Rare",
  legendary: "Legendary",
};

const rarityColors: Record<QuestRarity, string> = {
  common: "text-muted-foreground",
  rare: "text-quest-rare",
  legendary: "text-quest-legendary",
};

export const QuestCard: React.FC<QuestCardProps> = ({
  id,
  title,
  xpReward,
  rarity,
  completed,
  onComplete,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        "relative bg-card p-4 border-4 transition-all duration-300",
        rarityStyles[rarity],
        completed && "opacity-60 quest-complete-animation"
      )}
    >
      {/* Quest scroll decoration */}
      <div className="absolute -top-2 left-4 w-8 h-4 bg-quest-gold rounded-t-sm" />
      <div className="absolute -top-2 right-4 w-8 h-4 bg-quest-gold rounded-t-sm" />

      <div className="flex items-start gap-3">
        {/* Quest icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-muted flex items-center justify-center border-2 border-border">
          <Sword className="w-5 h-5 text-primary" />
        </div>

        {/* Quest content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] uppercase", rarityColors[rarity])}>
              {rarityLabels[rarity]}
            </span>
          </div>
          <h3 className={cn(
            "text-xs leading-relaxed mb-2",
            completed && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          
          {/* XP Reward */}
          <div className="flex items-center gap-1 text-quest-xp">
            <Star className="w-3 h-3 fill-quest-xp" />
            <span className="text-[10px]">+{xpReward} XP</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!completed && (
            <PixelButton
              variant="xp"
              size="icon"
              onClick={() => onComplete(id)}
              className="w-8 h-8"
            >
              <CheckCircle className="w-4 h-4" />
            </PixelButton>
          )}
          <PixelButton
            variant="danger"
            size="icon"
            onClick={() => onDelete(id)}
            className="w-8 h-8"
          >
            <Trash2 className="w-4 h-4" />
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
