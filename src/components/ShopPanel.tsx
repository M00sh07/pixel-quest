import React from "react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { ShoppingBag, Package, Sparkles, Zap } from "lucide-react";
import { ShopItem } from "@/types/productivity";

interface ShopPanelProps {
  coins: number;
  items: (ShopItem & { currentStock: number; ownedCount: number })[];
  onPurchase: (itemId: string) => { success: boolean; message: string };
}

const categoryIcons: Record<string, React.ReactNode> = {
  consumable: <Package className="w-4 h-4" />,
  cosmetic: <Sparkles className="w-4 h-4" />,
  boost: <Zap className="w-4 h-4" />,
  companion: <span>🐾</span>,
};

const categoryColors: Record<string, string> = {
  consumable: "border-quest-xp",
  cosmetic: "border-quest-rare",
  boost: "border-quest-legendary",
  companion: "border-quest-mana",
};

export const ShopPanel: React.FC<ShopPanelProps> = ({
  coins,
  items,
  onPurchase,
}) => {
  const handlePurchase = (itemId: string) => {
    const result = onPurchase(itemId);
    // Toast would be shown by parent
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-quest-gold" />
          Shop
        </h2>
        <div className="flex items-center gap-2 text-sm text-quest-gold">
          🪙 {coins}
        </div>
      </div>

      {/* Items by category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-[10px] uppercase text-muted-foreground flex items-center gap-2">
            {categoryIcons[category]}
            {category}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {categoryItems.map((item) => {
              const canAfford = coins >= item.cost;
              const inStock = item.currentStock !== 0;
              const atMax = item.ownedCount >= item.maxOwnable;
              const canBuy = canAfford && inStock && !atMax;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-card pixel-border p-3 border-l-4",
                    categoryColors[item.category],
                    !canBuy && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs">{item.name}</h4>
                        {item.ownedCount > 0 && (
                          <span className="text-[8px] bg-muted px-1">
                            x{item.ownedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className={cn(
                          "font-bold",
                          canAfford ? "text-quest-gold" : "text-destructive"
                        )}>
                          🪙 {item.cost}
                        </span>
                        {item.currentStock > 0 && (
                          <span className="text-muted-foreground">
                            Stock: {item.currentStock}
                          </span>
                        )}
                        {item.currentStock === 0 && item.stock > 0 && (
                          <span className="text-destructive">Sold out today</span>
                        )}
                        {atMax && (
                          <span className="text-muted-foreground">Max owned</span>
                        )}
                      </div>
                    </div>
                    <PixelButton
                      variant="quest"
                      size="sm"
                      onClick={() => handlePurchase(item.id)}
                      disabled={!canBuy}
                    >
                      Buy
                    </PixelButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};