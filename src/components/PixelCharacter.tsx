import React from "react";
import { cn } from "@/lib/utils";

interface PixelCharacterProps {
  level: number;
  className?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({ level, className }) => {
  // Simple pixel art character using CSS
  return (
    <div className={cn("relative floating-animation", className)}>
      <div className="relative w-16 h-20">
        {/* Character body using pixel blocks */}
        <svg viewBox="0 0 16 20" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
          {/* Hair */}
          <rect x="4" y="0" width="8" height="2" fill="hsl(var(--quest-legendary))" />
          <rect x="3" y="2" width="10" height="2" fill="hsl(var(--quest-legendary))" />
          
          {/* Face */}
          <rect x="4" y="4" width="8" height="4" fill="#FFD9B3" />
          {/* Eyes */}
          <rect x="5" y="5" width="2" height="2" fill="hsl(var(--dungeon-dark))" />
          <rect x="9" y="5" width="2" height="2" fill="hsl(var(--dungeon-dark))" />
          
          {/* Body/Armor */}
          <rect x="3" y="8" width="10" height="6" fill="hsl(var(--secondary))" />
          <rect x="5" y="9" width="6" height="4" fill="hsl(var(--quest-gold))" />
          
          {/* Arms */}
          <rect x="1" y="8" width="2" height="5" fill="#FFD9B3" />
          <rect x="13" y="8" width="2" height="5" fill="#FFD9B3" />
          
          {/* Legs */}
          <rect x="4" y="14" width="3" height="4" fill="hsl(var(--muted))" />
          <rect x="9" y="14" width="3" height="4" fill="hsl(var(--muted))" />
          
          {/* Boots */}
          <rect x="3" y="18" width="4" height="2" fill="hsl(var(--dungeon-dark))" />
          <rect x="9" y="18" width="4" height="2" fill="hsl(var(--dungeon-dark))" />
        </svg>
        
        {/* Level indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-quest-gold flex items-center justify-center text-[8px] text-dungeon-dark font-pixel border-2 border-quest-legendary">
          {level}
        </div>
      </div>
    </div>
  );
};
