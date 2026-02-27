import React from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BuyNowButtonProps {
  itemName: string;
  itemPrice: number;
  tierLabel?: string;
  onBuyNow: (itemName: string, itemPrice: number, tierLabel?: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function BuyNowButton({
  itemName,
  itemPrice,
  tierLabel,
  onBuyNow,
  disabled = false,
  isLoading = false,
  className = '',
}: BuyNowButtonProps) {
  return (
    <Button
      onClick={() => onBuyNow(itemName, itemPrice, tierLabel)}
      disabled={disabled || isLoading}
      className={`w-full mt-3 font-semibold ${className}`}
      size="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Now
        </>
      )}
    </Button>
  );
}
