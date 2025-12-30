import React, { useState } from "react";
import { PixelButton } from "./PixelButton";
import { Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TaskDifficulty,
  EnergyType,
  TaskPriority,
  DIFFICULTY_MULTIPLIERS,
  ENERGY_TYPE_ICONS,
  PRIORITY_LABELS,
  DEFAULT_CATEGORIES,
} from "@/types/productivity";
import { QuestRarity, RepeatFrequency } from "@/types/quest";

interface EnhancedAddTaskFormProps {
  onAdd: (data: {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    energyType: EnergyType;
    category: string;
    rarity: QuestRarity;
    estimatedMinutes?: number;
    softDeadline?: Date;
    hardDeadline?: Date;
    priority: TaskPriority;
    reminderTime?: string;
    repeatFrequency: RepeatFrequency;
    repeatDays?: number[];
    subtasks?: string[];
  }) => void;
}

const difficultyOptions: { value: TaskDifficulty; label: string; xpMult: number }[] = [
  { value: "trivial", label: "Trivial", xpMult: 0.5 },
  { value: "easy", label: "Easy", xpMult: 0.75 },
  { value: "normal", label: "Normal", xpMult: 1 },
  { value: "hard", label: "Hard", xpMult: 1.5 },
  { value: "epic", label: "Epic", xpMult: 2.5 },
  { value: "boss", label: "Boss", xpMult: 5 },
];

const energyOptions: { value: EnergyType; label: string; icon: string }[] = [
  { value: "mental", label: "Mental", icon: "🧠" },
  { value: "physical", label: "Physical", icon: "💪" },
  { value: "creative", label: "Creative", icon: "🎨" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "urgent-important", label: "Do First" },
  { value: "urgent", label: "Schedule" },
  { value: "important", label: "Delegate" },
  { value: "neither", label: "Later" },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const EnhancedAddTaskForm: React.FC<EnhancedAddTaskFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<TaskDifficulty>("normal");
  const [energyType, setEnergyType] = useState<EnergyType>("mental");
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState<TaskPriority>("neither");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [hardDeadline, setHardDeadline] = useState("");
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rarity: QuestRarity = difficulty === "boss" ? "legendary" 
      : difficulty === "epic" || difficulty === "hard" ? "rare" 
      : "common";

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      energyType,
      category,
      rarity,
      estimatedMinutes: estimatedMinutes || undefined,
      hardDeadline: hardDeadline ? new Date(hardDeadline) : undefined,
      priority,
      repeatFrequency,
      repeatDays: repeatFrequency === "custom" ? repeatDays : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDifficulty("normal");
    setEnergyType("mental");
    setCategory("work");
    setPriority("neither");
    setEstimatedMinutes(30);
    setHardDeadline("");
    setRepeatFrequency("none");
    setRepeatDays([]);
    setSubtasks([]);
    setShowAdvanced(false);
    setIsOpen(false);
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks((prev) => [...prev, subtaskInput.trim()]);
      setSubtaskInput("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  if (!isOpen) {
    return (
      <PixelButton variant="quest" className="w-full" onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Task
      </PixelButton>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card pixel-border p-4 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Task Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={2}
          className="w-full bg-input border-2 border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel resize-none"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDifficulty(opt.value)}
              className={cn(
                "p-2 border-2 text-[8px] uppercase transition-all",
                difficulty === opt.value
                  ? "border-primary bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
              <span className="block text-quest-xp">x{opt.xpMult}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Type */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Energy Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {energyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEnergyType(opt.value)}
              className={cn(
                "p-2 border-2 text-[8px] uppercase transition-all flex flex-col items-center gap-1",
                energyType === opt.value
                  ? "border-primary bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <span className="text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Category
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "p-2 border-2 text-[8px] uppercase transition-all flex flex-col items-center gap-1",
                category === cat.id
                  ? "border-primary bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase mb-2">
          Priority
        </label>
        <div className="grid grid-cols-4 gap-2">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={cn(
                "p-2 border-2 text-[8px] uppercase transition-all",
                priority === opt.value
                  ? "border-primary bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
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
        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showAdvanced ? "Hide" : "Show"} Advanced Options
      </button>

      {showAdvanced && (
        <>
          {/* Estimated Time */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              min={5}
              step={5}
              className="w-full bg-input border-2 border-border p-3 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>

          {/* Hard Deadline */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Hard Deadline
            </label>
            <input
              type="datetime-local"
              value={hardDeadline}
              onChange={(e) => setHardDeadline(e.target.value)}
              className="w-full bg-input border-2 border-border p-3 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>

          {/* Repeat Frequency */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Repeat
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["none", "daily", "weekly", "custom"] as RepeatFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setRepeatFrequency(freq)}
                  className={cn(
                    "p-2 border-2 text-[8px] uppercase transition-all",
                    repeatFrequency === freq
                      ? "border-primary bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {freq === "none" ? "Once" : freq}
                </button>
              ))}
            </div>
          </div>

          {repeatFrequency === "custom" && (
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
          )}

          {/* Subtasks */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-2">
              Subtasks
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 bg-input border-2 border-border p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <PixelButton type="button" variant="ghost" size="sm" onClick={addSubtask}>
                <Plus className="w-3 h-3" />
              </PixelButton>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-muted p-2 text-[10px]"
                  >
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <PixelButton type="submit" variant="xp" className="flex-1">
          Create Task
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