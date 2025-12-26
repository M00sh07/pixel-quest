import React from "react";
import { Sword, Trophy, Flame, Target } from "lucide-react";

interface QuestStatsProps {
  completedQuests: number;
  activeQuests: number;
  streak: number;
}

export const QuestStats: React.FC<QuestStatsProps> = ({
  completedQuests,
  activeQuests,
  streak,
}) => {
  const stats = [
    {
      icon: <Trophy className="w-4 h-4 text-quest-gold" />,
      label: "Completed",
      value: completedQuests,
    },
    {
      icon: <Sword className="w-4 h-4 text-quest-mana" />,
      label: "Active",
      value: activeQuests,
    },
    {
      icon: <Flame className="w-4 h-4 text-quest-health" />,
      label: "Streak",
      value: `${streak}d`,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card pixel-border p-3 flex flex-col items-center gap-1"
        >
          {stat.icon}
          <span className="text-sm text-foreground">{stat.value}</span>
          <span className="text-[8px] text-muted-foreground uppercase">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
