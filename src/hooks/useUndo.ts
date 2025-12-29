import { useState, useCallback, useEffect } from "react";
import { UndoAction } from "@/types/productivity";

const UNDO_EXPIRY_MS = 30000; // 30 seconds

export const useUndo = () => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  // Clean up expired actions
  useEffect(() => {
    const interval = setInterval(() => {
      setUndoStack(prev => prev.filter(action => new Date(action.expiresAt) > new Date()));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const pushUndo = useCallback((action: Omit<UndoAction, "id" | "timestamp" | "expiresAt">) => {
    const undoAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + UNDO_EXPIRY_MS),
    };

    setUndoStack(prev => [...prev.slice(-9), undoAction]); // Keep max 10
    return undoAction.id;
  }, []);

  const popUndo = useCallback((): UndoAction | null => {
    const validActions = undoStack.filter(a => new Date(a.expiresAt) > new Date());
    if (validActions.length === 0) return null;

    const action = validActions[validActions.length - 1];
    setUndoStack(prev => prev.filter(a => a.id !== action.id));
    return action;
  }, [undoStack]);

  const removeUndo = useCallback((actionId: string) => {
    setUndoStack(prev => prev.filter(a => a.id !== actionId));
  }, []);

  const hasUndo = useCallback((): boolean => {
    return undoStack.some(a => new Date(a.expiresAt) > new Date());
  }, [undoStack]);

  const getLatestUndo = useCallback((): UndoAction | null => {
    const validActions = undoStack.filter(a => new Date(a.expiresAt) > new Date());
    return validActions.length > 0 ? validActions[validActions.length - 1] : null;
  }, [undoStack]);

  return {
    undoStack,
    pushUndo,
    popUndo,
    removeUndo,
    hasUndo,
    getLatestUndo,
  };
};
