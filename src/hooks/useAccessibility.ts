import { useState, useEffect, useCallback } from "react";
import { AccessibilitySettings } from "@/types/productivity";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderMode: false,
  keyboardOnlyMode: false,
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("productivity-accessibility");
    if (saved) return JSON.parse(saved);
    
    // Check system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersHighContrast = window.matchMedia("(prefers-contrast: more)").matches;
    
    return {
      ...DEFAULT_SETTINGS,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    };
  });

  useEffect(() => {
    localStorage.setItem("productivity-accessibility", JSON.stringify(settings));
  }, [settings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (settings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    if (settings.keyboardOnlyMode) {
      root.classList.add("keyboard-only");
    } else {
      root.classList.remove("keyboard-only");
    }
  }, [settings]);

  const toggleSetting = useCallback((key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    toggleSetting,
    updateSetting,
    resetSettings,
  };
};
