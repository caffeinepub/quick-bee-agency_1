import { useState, useEffect } from 'react';

export interface CartItem {
  serviceId: bigint;
  serviceName: string;
  tier: 'Basic' | 'Pro' | 'Premium';
  price: number;
  quantity: number;
}

const CART_KEY = 'quickbee_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.serviceId === item.serviceId && i.tier === item.tier);
      if (existing) {
        return prev.map(i =>
          i.serviceId === item.serviceId && i.tier === item.tier
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (serviceId: bigint, tier: string) => {
    setItems(prev => prev.filter(i => !(i.serviceId === serviceId && i.tier === tier)));
  };

  const updateQuantity = (serviceId: bigint, tier: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(serviceId, tier);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.serviceId === serviceId && i.tier === tier ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total };
}
