import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { Undo2, X } from "lucide-react";
import { UndoAction } from "@/types/productivity";

interface UndoToastProps {
  action: UndoAction | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  action,
  onUndo,
  onDismiss,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!action) {
      setTimeLeft(0);
      return;
    }

    const updateTime = () => {
      const remaining = Math.max(0, new Date(action.expiresAt).getTime() - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [action]);

  if (!action || timeLeft <= 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-card pixel-border px-4 py-3 flex items-center gap-4 shadow-lg">
        <div className="text-[10px]">
          <span className="text-muted-foreground">{action.description}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {timeLeft}s
          </span>
          <PixelButton
            variant="xp"
            size="sm"
            onClick={onUndo}
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Undo
          </PixelButton>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};