import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsStripeConfigured } from '../hooks/useQueries';
import { useCart } from '../cart/useCart';
import { useCreateCheckoutSession } from '../payments/useCreateCheckoutSession';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const createSession = useCreateCheckoutSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStripeCheckout = async () => {
    if (!stripeConfigured) {
      toast.error('Stripe is not configured. Please contact support.');
      return;
    }
    setIsRedirecting(true);
    try {
      const shoppingItems = items.map(item => ({
        productName: item.name,
        productDescription: item.tierLabel ?? item.name,
        priceInCents: BigInt(Math.round(item.price * 100)),
        quantity: BigInt(item.quantity),
        currency: 'inr',
      }));
      const session = await createSession.mutateAsync(shoppingItems);
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create checkout session');
      setIsRedirecting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background mesh-bg flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some services to get started</p>
          <Button onClick={() => navigate({ to: '/authenticated/services' })} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/authenticated/cart' })}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-2xl font-bold font-heading text-foreground mb-6">Checkout</h1>

        {/* Order Summary */}
        <div className="card-glass rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm text-foreground">{item.name}</p>
                  {item.tierLabel && <p className="text-xs text-muted-foreground">{item.tierLabel}</p>}
                  {item.quantity > 1 && <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>}
                </div>
                <span className="text-sm font-medium text-foreground flex-shrink-0">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span className="text-primary text-lg">{formatINR(total)}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          {stripeLoading ? (
            <div className="card-glass rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading payment options...</span>
            </div>
          ) : stripeConfigured ? (
            <Button
              onClick={handleStripeCheckout}
              disabled={isRedirecting || createSession.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
            >
              {isRedirecting || createSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay with Card ({formatINR(total)})
                </>
              )}
            </Button>
          ) : (
            <div className="card-glass rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment not configured</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please contact support to complete your purchase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
