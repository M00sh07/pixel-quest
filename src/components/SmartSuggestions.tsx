import React from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { 
  Lightbulb, 
  Zap, 
  Clock, 
  Target,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { TaskSuggestion, EnhancedTask } from "@/types/productivity";

interface SmartSuggestionsProps {
  suggestions: TaskSuggestion[];
  tasks: EnhancedTask[];
  onSelectTask: (taskId: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "quick-win": <Zap className="w-3 h-3" />,
  "time-sensitive": <Clock className="w-3 h-3" />,
  "energy-match": <Target className="w-3 h-3" />,
  "streak-risk": <TrendingUp className="w-3 h-3" />,
  "dependency-clear": <ArrowRight className="w-3 h-3" />,
};

const categoryColors: Record<string, string> = {
  "quick-win": "text-quest-xp border-quest-xp",
  "time-sensitive": "text-quest-health border-quest-health",
  "energy-match": "text-quest-mana border-quest-mana",
  "streak-risk": "text-quest-legendary border-quest-legendary",
  "dependency-clear": "text-quest-rare border-quest-rare",
};

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  tasks,
  onSelectTask,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card pixel-border p-4 space-y-3">
      <h3 className="text-[10px] uppercase text-muted-foreground flex items-center gap-2">
        <Lightbulb className="w-3 h-3 text-quest-gold" />
        Smart Suggestions
      </h3>

      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion) => {
          const task = tasks.find((t) => t.id === suggestion.taskId);
          if (!task) return null;

          return (
            <div
              key={suggestion.id}
              className={cn(
                "p-2 border-l-2 bg-muted/50 cursor-pointer hover:bg-muted transition-colors",
                categoryColors[suggestion.category]
              )}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="flex items-start gap-2">
                <div className={cn("mt-0.5", categoryColors[suggestion.category])}>
                  {categoryIcons[suggestion.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs line-clamp-1">{task.title}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    {suggestion.reason}
                  </p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 3 && (
        <p className="text-[8px] text-center text-muted-foreground">
          +{suggestions.length - 3} more suggestions
        </p>
      )}
    </div>
  );
};