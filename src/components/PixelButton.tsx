import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pixelButtonVariants = cva(
  "inline-flex items-center justify-center font-pixel text-xs uppercase tracking-wider transition-all duration-100 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground pixel-border hover:brightness-110 active:brightness-90",
        quest:
          "bg-quest-gold text-dungeon-dark pixel-border-gold hover:brightness-110 quest-shimmer",
        danger:
          "bg-destructive text-destructive-foreground pixel-border hover:brightness-110",
        ghost:
          "bg-transparent text-foreground border-2 border-border hover:bg-muted",
        xp:
          "bg-quest-xp text-dungeon-dark pixel-border hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(pixelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
PixelButton.displayName = "PixelButton";

export { PixelButton, pixelButtonVariants };
