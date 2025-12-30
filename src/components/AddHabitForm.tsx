import React, { useState } from "react";
import { PixelButton } from "./PixelButton";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitType, HabitPolarity } from "@/types/productivity";

interface AddHabitFormProps {
  onAdd: (data: {
    title: string;
    description?: string;
    type: HabitType;
    polarity: HabitPolarity;
    targetValue?: number;
    unit?: string;
    missToleranceDays: number;
    streakDecayRate: number;
    momentumGrowthRate: number;
    difficultyScaleRate: number;
    baseXP: number;
    baseCoins: number;
  }) => void;
}

export const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HabitType>("binary");
  const [polarity, setPolarity] = useState<HabitPolarity>("positive");
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState("");
  const [missToleranceDays, setMissToleranceDays] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      polarity,
      targetValue: type === "scaled" ? targetValue : undefined,
      unit: type === "scaled" ? unit : undefined,
      missToleranceDays,
      streakDecayRate: 0.2, // Lose 20% of streak per miss
      momentumGrowthRate: 0.05, // 5% growth per completion
      difficultyScaleRate: 0.1, // 10% difficulty increase every 7 days
      baseXP: 15,
      baseCoins: 5,
    });

    // Reset
    setTitle("");
    setDescription("");
    setType("binary");
    setPolarity("positive");
    setTargetValue(1);
    setUnit("");
    setMissToleranceDays(1);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <PixelButton variant="quest" className="w-full" onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Habit
      </PixelButton>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card pixel-border p-4 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Habit Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Morning exercise"
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why is this habit important?"
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
        />
      </div>

      {/* Polarity */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Habit Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPolarity("positive")}
            className={cn(
              "p-3 border-2 text-[10px] uppercase transition-all",
              polarity === "positive"
                ? "border-quest-xp bg-quest-xp/20 text-quest-xp"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            🌱 Build
            <span className="block text-[8px] mt-1 normal-case">Do something positive</span>
          </button>
          <button
            type="button"
            onClick={() => setPolarity("negative")}
            className={cn(
              "p-3 border-2 text-[10px] uppercase transition-all",
              polarity === "negative"
                ? "border-quest-health bg-quest-health/20 text-quest-health"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            🚫 Break
            <span className="block text-[8px] mt-1 normal-case">Avoid something negative</span>
          </button>
        </div>
      </div>

      {/* Tracking Type */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Tracking
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("binary")}
            className={cn(
              "p-3 border-2 text-[10px] uppercase transition-all",
              type === "binary"
                ? "border-primary bg-muted text-foreground"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            ✓ Yes/No
            <span className="block text-[8px] mt-1 normal-case">Did you do it?</span>
          </button>
          <button
            type="button"
            onClick={() => setType("scaled")}
            className={cn(
              "p-3 border-2 text-[10px] uppercase transition-all",
              type === "scaled"
                ? "border-primary bg-muted text-foreground"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            📊 Measured
            <span className="block text-[8px] mt-1 normal-case">Track a number</span>
          </button>
        </div>
      </div>

      {/* Scaled options */}
      {type === "scaled" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Target Value
            </label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              min={1}
              className="w-full bg-input border-2 border-border p-3 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., glasses, pages"
              className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>
        </div>
      )}

      {/* Miss Tolerance */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Miss Tolerance (days before streak decays)
        </label>
        <input
          type="number"
          value={missToleranceDays}
          onChange={(e) => setMissToleranceDays(Number(e.target.value))}
          min={0}
          max={7}
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
        />
        <p className="text-[8px] text-muted-foreground mt-1">
          0 = strict (streak resets immediately), 7 = very lenient
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <PixelButton type="submit" variant="xp" className="flex-1">
          Create Habit
        </PixelButton>
        <PixelButton type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </PixelButton>
      </div>
    </form>
  );
};