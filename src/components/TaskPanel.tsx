import React from "react";
import { EnhancedTask } from "@/types/productivity";
import { EnhancedTaskCard } from "./EnhancedTaskCard";
import { EnhancedAddTaskForm } from "./EnhancedAddTaskForm";
import { Sword, CheckCircle } from "lucide-react";

interface TaskPanelProps {
  tasks: EnhancedTask[];
  onAdd: Parameters<typeof EnhancedAddTaskForm>[0]["onAdd"];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onCompleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  onAdd,
  onStart,
  onComplete,
  onDelete,
  onCompleteSubtask,
}) => {
  const activeTasks = tasks.filter(
    (t) => t.status === "active" || t.status === "blocked"
  );
  const blockedTaskIds = tasks
    .filter((t) => t.status === "blocked")
    .flatMap((t) => t.dependencies.map((d) => d.taskId));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm flex items-center gap-2">
          <Sword className="w-4 h-4 text-primary" />
          Active Quests
        </h2>
        <span className="text-[10px] text-muted-foreground">
          {activeTasks.length} tasks
        </span>
      </div>

      {/* Add Task Form */}
      <EnhancedAddTaskForm onAdd={onAdd} />

      {/* Task List */}
      {activeTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No active tasks. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTasks
            .sort((a, b) => {
              // Priority order: urgent-important > urgent > important > neither
              const priorityOrder = {
                "urgent-important": 0,
                urgent: 1,
                important: 2,
                neither: 3,
              };
              const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
              if (priorityDiff !== 0) return priorityDiff;
              
              // Then by deadline
              if (a.hardDeadline && b.hardDeadline) {
                return new Date(a.hardDeadline).getTime() - new Date(b.hardDeadline).getTime();
              }
              if (a.hardDeadline) return -1;
              if (b.hardDeadline) return 1;
              
              // Then by creation date
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((task) => (
              <EnhancedTaskCard
                key={task.id}
                task={task}
                isBlocked={task.status === "blocked"}
                onStart={onStart}
                onComplete={onComplete}
                onDelete={onDelete}
                onCompleteSubtask={onCompleteSubtask}
              />
            ))}
        </div>
      )}
    </div>
  );
};