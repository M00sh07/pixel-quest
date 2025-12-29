import { useState, useEffect, useCallback } from "react";
import { CoinTransaction, PlayerInventory, ShopItem, SHOP_ITEMS, ShopItemEffect } from "@/types/productivity";

const today = () => new Date().toISOString().split("T")[0];

export const useCoins = () => {
  const [inventory, setInventory] = useState<PlayerInventory>(() => {
    const saved = localStorage.getItem("productivity-inventory");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up expired effects
      parsed.activeEffects = (parsed.activeEffects || []).filter(
        (e: { expiresAt: string }) => new Date(e.expiresAt) > new Date()
      );
      return parsed;
    }
    return { coins: 0, ownedItems: [], activeEffects: [] };
  });

  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    const saved = localStorage.getItem("productivity-transactions");
    return saved ? JSON.parse(saved).slice(-100) : []; // Keep last 100 transactions
  });

  const [dailyShopStock, setDailyShopStock] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("productivity-shop-stock");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today()) {
        return parsed.stock;
      }
    }
    // Reset daily stock
    const stock: Record<string, number> = {};
    SHOP_ITEMS.forEach(item => {
      if (item.stock > 0) stock[item.id] = item.stock;
    });
    return stock;
  });

  useEffect(() => {
    localStorage.setItem("productivity-inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("productivity-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("productivity-shop-stock", JSON.stringify({
      date: today(),
      stock: dailyShopStock,
    }));
  }, [dailyShopStock]);

  // Clean up expired effects periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setInventory(prev => ({
        ...prev,
        activeEffects: prev.activeEffects.filter(e => new Date(e.expiresAt) > new Date()),
      }));
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const earnCoins = useCallback((amount: number, source: string, description: string) => {
    const transaction: CoinTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: "earn",
      source,
      description,
      timestamp: new Date(),
    };

    setInventory(prev => ({ ...prev, coins: prev.coins + amount }));
    setTransactions(prev => [...prev.slice(-99), transaction]);
    return amount;
  }, []);

  const spendCoins = useCallback((amount: number, source: string, description: string): boolean => {
    if (inventory.coins < amount) return false;

    const transaction: CoinTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: "spend",
      source,
      description,
      timestamp: new Date(),
    };

    setInventory(prev => ({ ...prev, coins: prev.coins - amount }));
    setTransactions(prev => [...prev.slice(-99), transaction]);
    return true;
  }, [inventory.coins]);

  const purchaseItem = useCallback((itemId: string): { success: boolean; message: string } => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: "Item not found" };

    // Check stock
    if (item.stock > 0 && (dailyShopStock[item.id] || 0) <= 0) {
      return { success: false, message: "Out of stock for today" };
    }

    // Check max ownable
    const owned = inventory.ownedItems.find(i => i.itemId === itemId);
    if (owned && owned.quantity >= item.maxOwnable) {
      return { success: false, message: `Maximum owned: ${item.maxOwnable}` };
    }

    // Check coins
    if (inventory.coins < item.cost) {
      return { success: false, message: "Not enough coins" };
    }

    // Deduct coins
    spendCoins(item.cost, "shop", `Purchased ${item.name}`);

    // Update stock
    if (item.stock > 0) {
      setDailyShopStock(prev => ({
        ...prev,
        [item.id]: Math.max(0, (prev[item.id] || item.stock) - 1),
      }));
    }

    // Add to inventory
    setInventory(prev => {
      const existingIndex = prev.ownedItems.findIndex(i => i.itemId === itemId);
      if (existingIndex >= 0) {
        const updated = [...prev.ownedItems];
        updated[existingIndex].quantity += 1;
        return { ...prev, ownedItems: updated };
      }
      return {
        ...prev,
        ownedItems: [...prev.ownedItems, { itemId, quantity: 1 }],
      };
    });

    return { success: true, message: `Purchased ${item.name}!` };
  }, [inventory, dailyShopStock, spendCoins]);

  const useItem = useCallback((itemId: string): { success: boolean; effect?: ShopItemEffect; message: string } => {
    const owned = inventory.ownedItems.find(i => i.itemId === itemId);
    if (!owned || owned.quantity <= 0) {
      return { success: false, message: "Item not in inventory" };
    }

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || !item.effect) {
      return { success: false, message: "Item has no effect" };
    }

    // Consume item
    setInventory(prev => ({
      ...prev,
      ownedItems: prev.ownedItems.map(i =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0),
      activeEffects: item.effect?.duration
        ? [
            ...prev.activeEffects,
            {
              effectType: item.effect.type,
              expiresAt: new Date(Date.now() + (item.effect.duration || 1) * 60 * 60 * 1000),
              value: item.effect.value,
            },
          ]
        : prev.activeEffects,
    }));

    return { success: true, effect: item.effect, message: `Used ${item.name}!` };
  }, [inventory]);

  const getActiveBoost = useCallback((type: string): number => {
    const effect = inventory.activeEffects.find(e => e.effectType === type);
    return effect ? effect.value : 0;
  }, [inventory.activeEffects]);

  const getItemCount = useCallback((itemId: string): number => {
    return inventory.ownedItems.find(i => i.itemId === itemId)?.quantity || 0;
  }, [inventory.ownedItems]);

  const getShopItems = useCallback((): (ShopItem & { currentStock: number; ownedCount: number })[] => {
    return SHOP_ITEMS.map(item => ({
      ...item,
      currentStock: item.stock > 0 ? dailyShopStock[item.id] || 0 : -1,
      ownedCount: inventory.ownedItems.find(i => i.itemId === item.id)?.quantity || 0,
    }));
  }, [dailyShopStock, inventory.ownedItems]);

  const getTodayEarnings = useCallback((): number => {
    const todayStr = today();
    return transactions
      .filter(t => t.type === "earn" && t.timestamp.toString().startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return {
    coins: inventory.coins,
    inventory,
    transactions,
    earnCoins,
    spendCoins,
    purchaseItem,
    useItem,
    getActiveBoost,
    getItemCount,
    getShopItems,
    getTodayEarnings,
  };
};
