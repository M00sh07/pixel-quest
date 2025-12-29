import { useState, useEffect, useCallback } from "react";
import { Project, ProjectMilestone, ProjectStatus, ProjectRetrospective } from "@/types/productivity";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("productivity-projects");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("productivity-projects", JSON.stringify(projects));
  }, [projects]);

  const createProject = useCallback((data: {
    title: string;
    description?: string;
    targetEndDate?: Date;
    milestones: Omit<ProjectMilestone, "id" | "completedAt">[];
  }): Project => {
    const project: Project = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: "planning",
      milestones: data.milestones.map(m => ({
        ...m,
        id: crypto.randomUUID(),
      })),
      currentMilestoneIndex: 0,
      riskLevel: 0,
      riskFactors: [],
      startDate: new Date(),
      targetEndDate: data.targetEndDate,
      totalXPEarned: 0,
      totalCoinsEarned: 0,
      createdAt: new Date(),
    };

    setProjects(prev => [...prev, project]);
    return project;
  }, []);

  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        status,
        actualEndDate: status === "completed" || status === "abandoned" ? new Date() : undefined,
      };
    }));
  }, []);

  const completeMilestone = useCallback((projectId: string, milestoneId: string): { xp: number; coins: number } => {
    let rewards = { xp: 0, coins: 0 };

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;

      const milestoneIndex = p.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1 || p.milestones[milestoneIndex].completedAt) return p;

      const milestone = p.milestones[milestoneIndex];
      rewards = {
        xp: milestone.xpReward,
        coins: Math.round(milestone.xpReward * 0.5),
      };

      const updatedMilestones = [...p.milestones];
      updatedMilestones[milestoneIndex] = {
        ...milestone,
        completedAt: new Date(),
      };

      // Calculate new risk level based on time
      let riskLevel = p.riskLevel;
      let riskFactors = [...p.riskFactors];
      
      if (p.targetEndDate) {
        const now = new Date();
        const end = new Date(p.targetEndDate);
        const start = new Date(p.startDate);
        const timeProgress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
        const milestoneProgress = (milestoneIndex + 1) / p.milestones.length;
        
        if (timeProgress > milestoneProgress + 0.2) {
          riskLevel = Math.min(100, riskLevel + 20);
          if (!riskFactors.includes("Behind schedule")) {
            riskFactors = [...riskFactors, "Behind schedule"];
          }
        } else if (timeProgress < milestoneProgress - 0.1) {
          riskLevel = Math.max(0, riskLevel - 10);
          riskFactors = riskFactors.filter(f => f !== "Behind schedule");
        }
      }

      return {
        ...p,
        milestones: updatedMilestones,
        currentMilestoneIndex: milestoneIndex + 1,
        totalXPEarned: p.totalXPEarned + rewards.xp,
        totalCoinsEarned: p.totalCoinsEarned + rewards.coins,
        riskLevel,
        riskFactors,
        status: milestoneIndex === p.milestones.length - 1 ? "completed" : "active",
        actualEndDate: milestoneIndex === p.milestones.length - 1 ? new Date() : undefined,
      };
    }));

    return rewards;
  }, []);

  const addTaskToMilestone = useCallback((projectId: string, milestoneId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        milestones: p.milestones.map(m => 
          m.id === milestoneId
            ? { ...m, tasks: [...m.tasks, taskId] }
            : m
        ),
      };
    }));
  }, []);

  const addRetrospective = useCallback((projectId: string, retrospective: Omit<ProjectRetrospective, "completedAt">) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        retrospective: {
          ...retrospective,
          completedAt: new Date(),
        },
      };
    }));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const getActiveProjects = useCallback((): Project[] => {
    return projects.filter(p => p.status === "active" || p.status === "planning");
  }, [projects]);

  const getProjectProgress = useCallback((projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 0;
    
    const completedMilestones = project.milestones.filter(m => m.completedAt).length;
    return project.milestones.length > 0 
      ? Math.round((completedMilestones / project.milestones.length) * 100)
      : 0;
  }, [projects]);

  const getAtRiskProjects = useCallback((): Project[] => {
    return projects.filter(p => p.riskLevel >= 50 && (p.status === "active" || p.status === "planning"));
  }, [projects]);

  return {
    projects,
    createProject,
    updateProjectStatus,
    completeMilestone,
    addTaskToMilestone,
    addRetrospective,
    deleteProject,
    getActiveProjects,
    getProjectProgress,
    getAtRiskProjects,
  };
};
