import { useState, useCallback, useEffect } from 'react';

export interface CartItem {
  serviceId: bigint;
  serviceName: string;
  tier: 'Basic' | 'Pro' | 'Premium';
  price: number;
  quantity: number;
}

const CART_KEY = 'qb_cart';

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      serviceId: BigInt(item.serviceId),
    }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    const serializable = items.map(item => ({
      ...item,
      serviceId: item.serviceId.toString(),
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(serializable));
  } catch {
    // ignore
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.serviceId === item.serviceId && i.tier === item.tier
      );
      if (existing) {
        return prev.map(i =>
          i.serviceId === item.serviceId && i.tier === item.tier
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((serviceId: bigint, tier: string) => {
    setItems(prev => prev.filter(i => !(i.serviceId === serviceId && i.tier === tier)));
  }, []);

  const updateQuantity = useCallback((serviceId: bigint, tier: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => !(i.serviceId === serviceId && i.tier === tier)));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.serviceId === serviceId && i.tier === tier ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };
}
