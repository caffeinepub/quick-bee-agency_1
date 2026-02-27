import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  tierLabel?: string;
}

interface CartState {
  items: CartItem[];
}

const CART_STORAGE_KEY = 'quickbee_cart';

function loadCart(): CartState {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { items: [] };
}

function saveCart(state: CartState) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useCart() {
  const [state, setState] = useState<CartState>(loadCart);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  const addItem = useCallback((item: CartItem) => {
    setState((prev) => {
      const existing = prev.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: prev.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { items: [...prev.items, item] };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((prev) => ({ items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setState((prev) => ({ items: prev.items.filter((i) => i.id !== id) }));
    } else {
      setState((prev) => ({
        items: prev.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      }));
    }
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [] });
  }, []);

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  };
}
