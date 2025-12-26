import React, { useState } from "react";
import { PixelButton } from "./PixelButton";
import { Plus, Sparkles, Crown, Scroll } from "lucide-react";
import type { QuestRarity } from "./QuestCard";
import { cn } from "@/lib/utils";

interface AddQuestFormProps {
  onAdd: (title: string, rarity: QuestRarity) => void;
}

const rarityOptions: { value: QuestRarity; label: string; icon: React.ReactNode; xp: number }[] = [
  { value: "common", label: "Common", icon: <Scroll className="w-4 h-4" />, xp: 10 },
  { value: "rare", label: "Rare", icon: <Sparkles className="w-4 h-4" />, xp: 25 },
  { value: "legendary", label: "Legendary", icon: <Crown className="w-4 h-4" />, xp: 50 },
];

export const AddQuestForm: React.FC<AddQuestFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [rarity, setRarity] = useState<QuestRarity>("common");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), rarity);
      setTitle("");
      setRarity("common");
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <PixelButton
        variant="quest"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Quest
      </PixelButton>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card pixel-border p-4 space-y-4">
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Quest Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter thy quest..."
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Quest Rarity
        </label>
        <div className="grid grid-cols-3 gap-2">
          {rarityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRarity(option.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 border-2 transition-all",
                rarity === option.value
                  ? option.value === "common"
                    ? "border-primary bg-muted"
                    : option.value === "rare"
                    ? "border-quest-rare bg-quest-rare/20"
                    : "border-quest-legendary bg-quest-legendary/20"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <span className={cn(
                option.value === "rare" && "text-quest-rare",
                option.value === "legendary" && "text-quest-legendary"
              )}>
                {option.icon}
              </span>
              <span className="text-[8px] uppercase">{option.label}</span>
              <span className="text-[8px] text-quest-xp">+{option.xp} XP</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <PixelButton type="submit" variant="xp" className="flex-1">
          Accept Quest
        </PixelButton>
        <PixelButton
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </PixelButton>
      </div>
    </form>
  );
};
