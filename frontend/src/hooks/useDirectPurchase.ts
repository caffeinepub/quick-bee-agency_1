import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useCart } from '../cart/useCart';

export function useDirectPurchase() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const cart = useCart();

  const handlePurchase = async (itemName: string, itemPrice: number, tierLabel?: string) => {
    setIsProcessing(true);
    try {
      const id = `direct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      cart.addItem({
        id,
        name: tierLabel ? `${itemName} – ${tierLabel}` : itemName,
        price: itemPrice,
        quantity: 1,
        tierLabel,
      });
      toast.success(`Added "${itemName}" to cart!`);
      await navigate({ to: '/authenticated/checkout' });
    } catch (err) {
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePurchase, isProcessing };
}
