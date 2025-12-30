import React from "react";
import { cn } from "@/lib/utils";
import { Coins, TrendingUp } from "lucide-react";

interface CoinDisplayProps {
  coins: number;
  todayEarnings?: number;
  className?: string;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({
  coins,
  todayEarnings = 0,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2 bg-card pixel-border px-3 py-2">
        <Coins className="w-4 h-4 text-quest-gold" />
        <span className="text-sm text-quest-gold font-bold">{coins}</span>
      </div>
      {todayEarnings > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-quest-xp">
          <TrendingUp className="w-3 h-3" />
          +{todayEarnings} today
        </div>
      )}
    </div>
  );
};