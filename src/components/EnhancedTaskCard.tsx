import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import {
  CheckCircle,
  Trash2,
  Clock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  EnhancedTask,
  TaskDifficulty,
  TaskPriority,
  DIFFICULTY_MULTIPLIERS,
  ENERGY_TYPE_ICONS,
  PRIORITY_LABELS,
} from "@/types/productivity";

interface EnhancedTaskCardProps {
  task: EnhancedTask;
  isBlocked?: boolean;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onCompleteSubtask: (taskId: string, subtaskId: string) => void;
}

const difficultyColors: Record<TaskDifficulty, string> = {
  trivial: "text-muted-foreground border-muted",
  easy: "text-quest-xp border-quest-xp",
  normal: "text-foreground border-border",
  hard: "text-quest-mana border-quest-mana",
  epic: "text-quest-rare border-quest-rare",
  boss: "text-quest-legendary border-quest-legendary animate-pulse-glow",
};

const difficultyLabels: Record<TaskDifficulty, string> = {
  trivial: "Trivial",
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  epic: "Epic",
  boss: "Boss",
};

export const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  isBlocked = false,
  onStart,
  onComplete,
  onDelete,
  onCompleteSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const isRunning = !!task.startedAt && task.status === "active";
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const progress = task.subtasks.length > 0 
    ? Math.round((completedSubtasks / task.subtasks.length) * 100) 
    : 0;

  const getDeadlineStatus = () => {
    if (!task.hardDeadline) return null;
    const deadline = new Date(task.hardDeadline);
    const now = new Date();
    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 0) return { text: "Overdue!", color: "text-destructive" };
    if (hoursUntil < 24) return { text: "Due today", color: "text-quest-health" };
    if (hoursUntil < 48) return { text: "Due tomorrow", color: "text-quest-legendary" };
    return null;
  };

  const deadlineStatus = getDeadlineStatus();
  const priorityInfo = PRIORITY_LABELS[task.priority];

  return (
    <div
      className={cn(
        "relative bg-card p-4 border-4 transition-all duration-300",
        difficultyColors[task.difficulty],
        task.status === "completed" && "opacity-60",
        isBlocked && "opacity-50"
      )}
    >
      {/* Priority indicator */}
      {task.priority !== "neither" && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-card text-[8px] uppercase border-2 border-current">
          <span className={priorityInfo.color}>{priorityInfo.label}</span>
        </div>
      )}

      {isBlocked && (
        <div className="absolute inset-0 bg-dungeon-dark/50 flex items-center justify-center z-10">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Task info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn("text-[10px] uppercase font-bold", difficultyColors[task.difficulty])}>
              {difficultyLabels[task.difficulty]}
            </span>
            <span className="text-[10px]" title={task.energyType}>
              {ENERGY_TYPE_ICONS[task.energyType]}
            </span>
            <span className="text-[8px] text-muted-foreground uppercase">
              {task.category}
            </span>
            {deadlineStatus && (
              <span className={cn("text-[8px] flex items-center gap-1", deadlineStatus.color)}>
                <AlertTriangle className="w-3 h-3" />
                {deadlineStatus.text}
              </span>
            )}
          </div>
          
          <h3 className={cn(
            "text-xs leading-relaxed mb-2",
            task.status === "completed" && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Progress bar for subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-1">
                <span>Subtasks</span>
                <span>{completedSubtasks}/{task.subtasks.length}</span>
              </div>
              <div className="h-2 bg-muted border border-border">
                <div 
                  className="h-full bg-quest-xp transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Time tracking */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Est: {task.estimatedMinutes}m
              </span>
            )}
            {isRunning && task.startedAt && (
              <span className="text-quest-xp">
                Running: {Math.round((Date.now() - new Date(task.startedAt).getTime()) / 60000)}m
              </span>
            )}
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            <span className="text-quest-xp">+{task.xpReward} XP</span>
            <span className="text-quest-gold">+{task.coinReward} 🪙</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {task.status === "active" && !isBlocked && (
            <>
              {!isRunning ? (
                <PixelButton
                  variant="ghost"
                  size="icon"
                  onClick={() => onStart(task.id)}
                  className="w-8 h-8"
                  title="Start task"
                >
                  <Play className="w-4 h-4" />
                </PixelButton>
              ) : (
                <PixelButton
                  variant="xp"
                  size="icon"
                  onClick={() => onComplete(task.id)}
                  className="w-8 h-8"
                  title="Complete task"
                >
                  <CheckCircle className="w-4 h-4" />
                </PixelButton>
              )}
            </>
          )}
          <PixelButton
            variant="danger"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="w-8 h-8"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </PixelButton>
          {task.subtasks.length > 0 && (
            <PixelButton
              variant="ghost"
              size="icon"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="w-8 h-8"
            >
              {showSubtasks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </PixelButton>
          )}
        </div>
      </div>

      {/* Subtasks list */}
      {showSubtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 text-[10px]"
            >
              <button
                onClick={() => !subtask.completed && onCompleteSubtask(task.id, subtask.id)}
                className={cn(
                  "w-4 h-4 border-2 flex items-center justify-center transition-colors",
                  subtask.completed
                    ? "bg-quest-xp border-quest-xp"
                    : "border-border hover:border-quest-xp"
                )}
                disabled={subtask.completed}
              >
                {subtask.completed && <CheckCircle className="w-3 h-3 text-dungeon-dark" />}
              </button>
              <span className={cn(subtask.completed && "line-through text-muted-foreground")}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};