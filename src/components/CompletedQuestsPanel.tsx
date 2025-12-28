import React, { useState } from "react";
import { Quest } from "@/types/quest";
import { cn } from "@/lib/utils";
import { Shield, Star, ChevronDown, ChevronUp, Calendar, Trash2 } from "lucide-react";
import { PixelButton } from "./PixelButton";

interface CompletedQuestsPanelProps {
  quests: Quest[];
  onDelete: (id: string) => void;
}

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground",
  rare: "text-quest-rare",
  legendary: "text-quest-legendary",
};

export const CompletedQuestsPanel: React.FC<CompletedQuestsPanelProps> = ({
  quests,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedQuests = showAll ? quests : quests.slice(0, 5);
  const totalXP = quests.reduce((sum, q) => sum + q.xpReward, 0);

  if (quests.length === 0) return null;

  return (
    <div className="bg-card pixel-border p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-quest-xp" />
          <h3 className="text-xs text-muted-foreground uppercase">
            Completed Quests ({quests.length})
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-quest-xp">
            <Star className="w-3 h-3 fill-quest-xp" />
            <span className="text-[10px]">{totalXP} XP</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2 mt-4">
          {displayedQuests.map((quest) => (
            <div
              key={quest.id}
              className="flex items-center justify-between p-3 bg-muted/50 border border-border opacity-75"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[8px] uppercase", rarityColors[quest.rarity])}>
                    {quest.rarity}
                  </span>
                  {quest.completedAt && (
                    <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(quest.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground line-through">
                  {quest.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-quest-xp">
                  <Star className="w-3 h-3 fill-quest-xp" />
                  <span className="text-[10px]">+{quest.xpReward}</span>
                </div>
                <PixelButton
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(quest.id)}
                  className="w-6 h-6"
                >
                  <Trash2 className="w-3 h-3" />
                </PixelButton>
              </div>
            </div>
          ))}

          {quests.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center text-[10px] text-primary hover:text-primary/80 py-2"
            >
              {showAll ? "Show Less" : `Show All (${quests.length - 5} more)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
