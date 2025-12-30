import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { Lock, Check, ChevronRight } from "lucide-react";
import { 
  SkillNode, 
  SkillCategory, 
  SKILL_CATEGORIES,
  PlayerSkills 
} from "@/types/productivity";

interface SkillTreePanelProps {
  skills: PlayerSkills;
  nodes: SkillNode[];
  onUnlock: (nodeId: string) => { success: boolean; message: string };
  canUnlock: (nodeId: string) => boolean;
  getNodesByCategory: (category: SkillCategory) => SkillNode[];
}

export const SkillTreePanel: React.FC<SkillTreePanelProps> = ({
  skills,
  nodes,
  onUnlock,
  canUnlock,
  getNodesByCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>("time-management");
  const categoryNodes = getNodesByCategory(selectedCategory);
  const categoryInfo = SKILL_CATEGORIES[selectedCategory];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm">Skill Trees</h2>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-quest-rare">
            ⭐ {skills.skillPoints} Skill Points
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1">
        {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((cat) => {
          const info = SKILL_CATEGORIES[cat];
          const catNodes = getNodesByCategory(cat);
          const unlockedCount = catNodes.filter(n => n.unlocked).length;
          
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "p-2 border-2 text-[8px] uppercase transition-all flex flex-col items-center gap-1",
                selectedCategory === cat
                  ? "border-primary bg-muted"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <span className="text-base">{info.icon}</span>
              <span className="line-clamp-1">{info.name.split(" ")[0]}</span>
              <span className="text-[7px] text-muted-foreground">
                {unlockedCount}/{catNodes.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category */}
      <div className="bg-card pixel-border p-4">
        <div className={cn("flex items-center gap-2 mb-4", categoryInfo.color)}>
          <span className="text-xl">{categoryInfo.icon}</span>
          <h3 className="text-xs">{categoryInfo.name}</h3>
        </div>

        {/* Skill Nodes */}
        <div className="space-y-2">
          {categoryNodes.map((node, index) => {
            const isUnlocked = node.unlocked;
            const canBuy = canUnlock(node.id);
            const hasPrereqs = node.prerequisites.length === 0 || 
              node.prerequisites.every(p => nodes.find(n => n.id === p)?.unlocked);

            return (
              <div key={node.id} className="relative">
                {/* Connection line */}
                {index > 0 && (
                  <div className="absolute left-4 -top-2 w-0.5 h-2 bg-border" />
                )}
                
                <div
                  className={cn(
                    "p-3 border-2 transition-all",
                    isUnlocked
                      ? "border-quest-xp bg-quest-xp/10"
                      : canBuy
                      ? "border-quest-rare bg-quest-rare/10"
                      : "border-border opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center border-2",
                      isUnlocked ? "border-quest-xp bg-quest-xp" : "border-border bg-muted"
                    )}>
                      {isUnlocked ? (
                        <Check className="w-4 h-4 text-dungeon-dark" />
                      ) : hasPrereqs ? (
                        <span className="text-[10px]">T{node.tier}</span>
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>

                    {/* Node Info */}
                    <div className="flex-1">
                      <h4 className="text-xs mb-1">{node.name}</h4>
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {node.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-quest-xp">
                          {node.effect.description}
                        </span>
                      </div>
                    </div>

                    {/* Unlock Button */}
                    {!isUnlocked && (
                      <PixelButton
                        variant={canBuy ? "xp" : "ghost"}
                        size="sm"
                        onClick={() => onUnlock(node.id)}
                        disabled={!canBuy}
                      >
                        {node.cost} ⭐
                      </PixelButton>
                    )}
                  </div>

                  {/* Prerequisites hint */}
                  {!hasPrereqs && node.prerequisites.length > 0 && (
                    <p className="text-[8px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Requires: {node.prerequisites.map(p => 
                        nodes.find(n => n.id === p)?.name
                      ).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};