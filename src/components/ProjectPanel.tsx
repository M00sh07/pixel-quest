import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { 
  Plus, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Trash2
} from "lucide-react";
import { Project, ProjectMilestone, ProjectStatus } from "@/types/productivity";

interface ProjectPanelProps {
  projects: Project[];
  onCreate: (data: {
    title: string;
    description?: string;
    targetEndDate?: Date;
    milestones: Omit<ProjectMilestone, "id" | "completedAt">[];
  }) => void;
  onCompleteMilestone: (projectId: string, milestoneId: string) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onDelete: (projectId: string) => void;
  getProgress: (projectId: string) => number;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({
  projects,
  onCreate,
  onCompleteMilestone,
  onUpdateStatus,
  onDelete,
  getProgress,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<{ title: string; xpReward: number }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || milestones.length === 0) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      targetEndDate: targetDate ? new Date(targetDate) : undefined,
      milestones: milestones.map(m => ({
        title: m.title,
        xpReward: m.xpReward,
        tasks: [],
      })),
    });

    // Reset
    setTitle("");
    setDescription("");
    setTargetDate("");
    setMilestones([]);
    setShowForm(false);
  };

  const addMilestone = () => {
    if (milestoneInput.trim()) {
      setMilestones(prev => [...prev, { 
        title: milestoneInput.trim(), 
        xpReward: 50 + (milestones.length * 25) // Increasing rewards
      }]);
      setMilestoneInput("");
    }
  };

  const activeProjects = projects.filter(p => p.status === "active" || p.status === "planning");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm flex items-center gap-2">
          <Flag className="w-4 h-4 text-quest-legendary" />
          Projects
        </h2>
        <span className="text-[10px] text-muted-foreground">
          {activeProjects.length} active
        </span>
      </div>

      {/* New Project Button/Form */}
      {!showForm ? (
        <PixelButton
          variant="quest"
          className="w-full"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </PixelButton>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card pixel-border p-4 space-y-3">
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your big goal?"
              className="w-full bg-input border-2 border-border p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full bg-input border-2 border-border p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>

          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-input border-2 border-border p-2 text-xs text-foreground focus:outline-none focus:border-primary font-pixel"
            />
          </div>

          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1">
              Milestones
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                placeholder="Add a milestone..."
                className="flex-1 bg-input border-2 border-border p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-pixel"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMilestone();
                  }
                }}
              />
              <PixelButton type="button" variant="ghost" size="sm" onClick={addMilestone}>
                <Plus className="w-3 h-3" />
              </PixelButton>
            </div>
            {milestones.length > 0 && (
              <div className="space-y-1">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted p-2 text-[10px]">
                    <span className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-quest-legendary" />
                      {m.title}
                    </span>
                    <span className="text-quest-xp">+{m.xpReward} XP</span>
                  </div>
                ))}
              </div>
            )}
            {milestones.length === 0 && (
              <p className="text-[8px] text-muted-foreground">Add at least one milestone</p>
            )}
          </div>

          <div className="flex gap-2">
            <PixelButton 
              type="submit" 
              variant="xp" 
              className="flex-1"
              disabled={!title.trim() || milestones.length === 0}
            >
              Create Project
            </PixelButton>
            <PixelButton type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </PixelButton>
          </div>
        </form>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No projects yet. Start your first big goal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const progress = getProgress(project.id);
            const isExpanded = expandedProject === project.id;
            const currentMilestone = project.milestones[project.currentMilestoneIndex];

            return (
              <div
                key={project.id}
                className={cn(
                  "bg-card pixel-border p-3",
                  project.riskLevel >= 50 && "border-quest-health",
                  project.status === "completed" && "border-quest-xp opacity-80"
                )}
              >
                {/* Header */}
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs">{project.title}</h3>
                      {project.riskLevel >= 50 && (
                        <AlertTriangle className="w-3 h-3 text-quest-health" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className={cn(
                        "px-1 uppercase",
                        project.status === "active" && "bg-quest-mana/20 text-quest-mana",
                        project.status === "completed" && "bg-quest-xp/20 text-quest-xp",
                        project.status === "planning" && "bg-muted"
                      )}>
                        {project.status}
                      </span>
                      <span>{progress}% complete</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-2 bg-muted border border-border">
                  <div
                    className="h-full bg-quest-legendary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    {project.description && (
                      <p className="text-[10px] text-muted-foreground">{project.description}</p>
                    )}

                    {/* Milestones */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase text-muted-foreground">Milestones</h4>
                      {project.milestones.map((milestone, idx) => (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex items-center gap-2 p-2 text-[10px]",
                            milestone.completedAt ? "bg-quest-xp/10" : 
                            idx === project.currentMilestoneIndex ? "bg-quest-legendary/10" : "bg-muted"
                          )}
                        >
                          {milestone.completedAt ? (
                            <CheckCircle className="w-4 h-4 text-quest-xp" />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (idx === project.currentMilestoneIndex) {
                                  onCompleteMilestone(project.id, milestone.id);
                                }
                              }}
                              className={cn(
                                "w-4 h-4 border-2 flex items-center justify-center",
                                idx === project.currentMilestoneIndex
                                  ? "border-quest-legendary hover:bg-quest-legendary/20"
                                  : "border-border"
                              )}
                              disabled={idx !== project.currentMilestoneIndex}
                            />
                          )}
                          <span className={cn(
                            "flex-1",
                            milestone.completedAt && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </span>
                          <span className="text-quest-xp">+{milestone.xpReward}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div className="bg-muted p-2">
                        <div className="text-quest-xp">{project.totalXPEarned}</div>
                        <div className="text-muted-foreground">XP Earned</div>
                      </div>
                      <div className="bg-muted p-2">
                        <div className="text-quest-gold">{project.totalCoinsEarned}</div>
                        <div className="text-muted-foreground">Coins Earned</div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {project.riskFactors.length > 0 && (
                      <div className="text-[10px] text-quest-health">
                        ⚠️ {project.riskFactors.join(", ")}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {project.status === "planning" && (
                        <PixelButton
                          variant="xp"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(project.id, "active");
                          }}
                        >
                          Start Project
                        </PixelButton>
                      )}
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </PixelButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};