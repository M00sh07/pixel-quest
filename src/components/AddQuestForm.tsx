import React, { useState } from "react";
import { PixelButton } from "./PixelButton";
import { Plus, Sparkles, Crown, Scroll, Bell, RefreshCw } from "lucide-react";
import { QuestRarity, RepeatFrequency } from "@/types/quest";
import { cn } from "@/lib/utils";

interface AddQuestFormProps {
  onAdd: (
    title: string,
    rarity: QuestRarity,
    reminderTime?: string,
    repeatFrequency?: RepeatFrequency,
    repeatDays?: number[]
  ) => void;
}

const rarityOptions: { value: QuestRarity; label: string; icon: React.ReactNode; xp: number }[] = [
  { value: "common", label: "Common", icon: <Scroll className="w-4 h-4" />, xp: 10 },
  { value: "rare", label: "Rare", icon: <Sparkles className="w-4 h-4" />, xp: 25 },
  { value: "legendary", label: "Legendary", icon: <Crown className="w-4 h-4" />, xp: 50 },
];

const frequencyOptions: { value: RepeatFrequency; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom Days" },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AddQuestForm: React.FC<AddQuestFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [rarity, setRarity] = useState<QuestRarity>("common");
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(
        title.trim(),
        rarity,
        reminderTime || undefined,
        repeatFrequency,
        repeatFrequency === "custom" ? repeatDays : undefined
      );
      setTitle("");
      setRarity("common");
      setReminderTime("");
      setRepeatFrequency("none");
      setRepeatDays([]);
      setShowAdvanced(false);
      setIsOpen(false);
    }
  };

  const toggleDay = (day: number) => {
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
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

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground uppercase"
      >
        <RefreshCw className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
        {showAdvanced ? "Hide" : "Show"} Advanced Options
      </button>

      {showAdvanced && (
        <>
          {/* Reminder Time */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2 flex items-center gap-2">
              <Bell className="w-3 h-3" />
              Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-input border-2 border-border p-3 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>

          {/* Repeat Frequency */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Repeat Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRepeatFrequency(option.value)}
                  className={cn(
                    "p-2 border-2 text-[8px] uppercase transition-all",
                    repeatFrequency === option.value
                      ? "border-primary bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Selection */}
          {repeatFrequency === "custom" && (
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase mb-2">
                Select Days
              </label>
              <div className="grid grid-cols-7 gap-1">
                {dayLabels.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "p-2 border-2 text-[8px] uppercase transition-all",
                      repeatDays.includes(index)
                        ? "border-quest-xp bg-quest-xp/20 text-quest-xp"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-2">
        <PixelButton type="submit" variant="xp" className="flex-1">
          Accept Quest
        </PixelButton>
        <PixelButton
          type="button"
          variant="ghost"
          onClick={() => {
            setIsOpen(false);
            setShowAdvanced(false);
          }}
        >
          Cancel
        </PixelButton>
      </div>
    </form>
  );
};
