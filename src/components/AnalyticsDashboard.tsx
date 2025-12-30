import React from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  Brain,
  Dumbbell,
  Palette,
  FileText
} from "lucide-react";
import { 
  DailyStats, 
  WeeklyReport, 
  BurnoutIndicator as BurnoutType,
  EnergyType 
} from "@/types/productivity";

interface AnalyticsDashboardProps {
  todayStats: DailyStats | null;
  burnout: BurnoutType;
  weeklyReport: WeeklyReport | null;
  productivityTrend: { date: string; score: number }[];
  energyBalance: Record<EnergyType, number>;
  onGenerateReport: () => void;
}

const energyIcons: Record<EnergyType, React.ReactNode> = {
  mental: <Brain className="w-4 h-4" />,
  physical: <Dumbbell className="w-4 h-4" />,
  creative: <Palette className="w-4 h-4" />,
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  todayStats,
  burnout,
  weeklyReport,
  productivityTrend,
  energyBalance,
  onGenerateReport,
}) => {
  const totalEnergy = energyBalance.mental + energyBalance.physical + energyBalance.creative;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-quest-mana" />
          Analytics
        </h2>
      </div>

      {/* Today's Stats */}
      <div className="bg-card pixel-border p-4">
        <h3 className="text-[10px] uppercase text-muted-foreground mb-3">Today</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-xp">{todayStats?.tasksCompleted || 0}</div>
            <div className="text-[8px] text-muted-foreground">Tasks</div>
          </div>
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-mana">{todayStats?.focusMinutes || 0}</div>
            <div className="text-[8px] text-muted-foreground">Focus min</div>
          </div>
          <div className="bg-muted p-2">
            <div className="text-xs text-quest-legendary">{todayStats?.habitsCompleted || 0}</div>
            <div className="text-[8px] text-muted-foreground">Habits</div>
          </div>
          <div className="bg-muted p-2">
            <div className="text-xs text-primary">{todayStats?.productivityScore || 0}</div>
            <div className="text-[8px] text-muted-foreground">Score</div>
          </div>
        </div>
      </div>

      {/* Burnout Indicator */}
      <div className={cn(
        "bg-card pixel-border p-4",
        burnout.level >= 60 && "border-quest-health"
      )}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] uppercase text-muted-foreground flex items-center gap-2">
            <AlertTriangle className={cn(
              "w-3 h-3",
              burnout.level >= 60 ? "text-quest-health" : "text-muted-foreground"
            )} />
            Burnout Risk
          </h3>
          <span className={cn(
            "text-xs font-bold",
            burnout.level < 30 ? "text-quest-xp" :
            burnout.level < 60 ? "text-quest-gold" :
            "text-quest-health"
          )}>
            {burnout.level}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-muted border border-border mb-2">
          <div
            className={cn(
              "h-full transition-all duration-300",
              burnout.level < 30 ? "bg-quest-xp" :
              burnout.level < 60 ? "bg-quest-gold" :
              "bg-quest-health"
            )}
            style={{ width: `${burnout.level}%` }}
          />
        </div>

        {/* Factors */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overwork</span>
            <span>{burnout.factors.overwork}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Missed Breaks</span>
            <span>{burnout.factors.missedBreaks}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Streak Pressure</span>
            <span>{burnout.factors.streakPressure}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deadline Density</span>
            <span>{burnout.factors.deadlineDensity}%</span>
          </div>
        </div>

        {/* Warnings */}
        {burnout.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {burnout.warnings.map((warning, i) => (
              <p key={i} className="text-[10px] text-quest-health">
                ⚠️ {warning}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Energy Balance */}
      <div className="bg-card pixel-border p-4">
        <h3 className="text-[10px] uppercase text-muted-foreground mb-3">
          Energy Balance (7 days)
        </h3>
        <div className="space-y-2">
          {(Object.keys(energyBalance) as EnergyType[]).map((type) => {
            const value = energyBalance[type];
            const percent = totalEnergy > 0 ? (value / totalEnergy) * 100 : 0;
            
            return (
              <div key={type}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="flex items-center gap-2">
                    {energyIcons[type]}
                    <span className="capitalize">{type}</span>
                  </span>
                  <span>{value} tasks</span>
                </div>
                <div className="h-2 bg-muted border border-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      type === "mental" && "bg-quest-mana",
                      type === "physical" && "bg-quest-health",
                      type === "creative" && "bg-quest-rare"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Trend */}
      <div className="bg-card pixel-border p-4">
        <h3 className="text-[10px] uppercase text-muted-foreground mb-3">
          Productivity Trend (7 days)
        </h3>
        <div className="flex items-end gap-1 h-20">
          {productivityTrend.map((day, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-full transition-all duration-300",
                  day.score > 50 ? "bg-quest-xp" : "bg-muted-foreground"
                )}
                style={{ height: `${Math.max(4, day.score)}%` }}
              />
              <span className="text-[7px] text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en", { weekday: "narrow" })}
              </span>
            </div>
          ))}
          {productivityTrend.length === 0 && (
            <div className="w-full text-center text-[10px] text-muted-foreground py-4">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Weekly Report */}
      {weeklyReport && (
        <div className="bg-card pixel-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase text-muted-foreground">
              Weekly Report
            </h3>
            <span className="text-[8px] text-muted-foreground">
              {weeklyReport.weekStart} - {weeklyReport.weekEnd}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
            <div>
              <span className="text-muted-foreground">Tasks:</span>
              <span className="ml-2">{weeklyReport.completedTasks}</span>
            </div>
            <div>
              <span className="text-muted-foreground">XP:</span>
              <span className="ml-2 text-quest-xp">{weeklyReport.totalXP}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Focus:</span>
              <span className="ml-2">{weeklyReport.totalFocusMinutes}m</span>
            </div>
            <div>
              <span className="text-muted-foreground">Habits:</span>
              <span className="ml-2">{weeklyReport.habitSuccessRate.toFixed(0)}%</span>
            </div>
          </div>

          {/* Insights */}
          {weeklyReport.insights.length > 0 && (
            <div className="space-y-1 mb-2">
              {weeklyReport.insights.map((insight, i) => (
                <p key={i} className="text-[10px] text-quest-xp">
                  ✨ {insight}
                </p>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {weeklyReport.recommendations.length > 0 && (
            <div className="space-y-1">
              {weeklyReport.recommendations.map((rec, i) => (
                <p key={i} className="text-[10px] text-quest-mana">
                  💡 {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Report Button */}
      <PixelButton variant="ghost" className="w-full" onClick={onGenerateReport}>
        <FileText className="w-4 h-4 mr-2" />
        Generate Weekly Report
      </PixelButton>
    </div>
  );
};