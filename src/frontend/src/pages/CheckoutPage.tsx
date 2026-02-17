import { useCart } from '../cart/useCart';
import { useCreateCheckoutSession } from '../payments/useCreateCheckoutSession';
import { useIsStripeConfigured } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const createCheckout = useCreateCheckoutSession();
  const { data: isStripeConfigured = false } = useIsStripeConfigured();

  const handleCheckout = async () => {
    if (!isStripeConfigured) {
      toast.error('Payment system not configured. Please contact admin.');
      return;
    }

    const shoppingItems: ShoppingItem[] = items.map(item => ({
      productName: `${item.serviceName} - ${item.tier}`,
      productDescription: `${item.tier} plan for ${item.serviceName}`,
      priceInCents: BigInt(item.price),
      quantity: BigInt(item.quantity),
      currency: 'INR'
    }));

    try {
      const session = await createCheckout.mutateAsync(shoppingItems);
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-soft-gray">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      {!isStripeConfigured && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertDescription className="text-destructive">
            Payment system is not configured. Please contact the administrator.
          </AlertDescription>
        </Alert>
      )}

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={`${item.serviceId}-${item.tier}`} className="flex justify-between">
              <div>
                <p className="font-medium text-foreground">{item.serviceName}</p>
                <p className="text-sm text-soft-gray">{item.tier} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-foreground">₹{((item.price * item.quantity) / 100).toLocaleString()}</p>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total (incl. 18% GST)</span>
              <span>₹{((total * 1.18) / 100).toLocaleString()}</span>
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={createCheckout.isPending || !isStripeConfigured}
            className="w-full gradient-teal-glow text-black font-semibold"
          >
            {createCheckout.isPending ? 'Processing...' : 'Pay with Stripe'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
