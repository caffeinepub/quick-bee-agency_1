import { useState, useEffect } from 'react';
import { useCart } from '../cart/useCart';
import { useCreateCheckoutSession } from '../payments/useCreateCheckoutSession';
import { useIsStripeConfigured, useIsRazorpayConfigured } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import formatINR from '../utils/formatCurrency';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: isStripeConfigured = false } = useIsStripeConfigured();
  const { data: isRazorpayConfigured = false } = useIsRazorpayConfigured();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('stripe');

  const showRazorpayOption = isRazorpayConfigured;

  useEffect(() => {
    if (!isStripeConfigured && showRazorpayOption) {
      setPaymentMethod('razorpay');
    } else if (isStripeConfigured) {
      setPaymentMethod('stripe');
    }
  }, [isStripeConfigured, showRazorpayOption]);

  const handleCheckout = async () => {
    if (paymentMethod === 'stripe') {
      if (!isStripeConfigured) {
        toast.error('Stripe is not configured. Please contact support.');
        return;
      }

      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.name,
        productDescription: item.tierLabel ? `${item.tierLabel} tier service` : 'Service',
        priceInCents: BigInt(Math.round(item.price * 100)),
        quantity: BigInt(item.quantity),
        currency: 'INR',
      }));

      try {
        const session = await createCheckoutSession.mutateAsync(shoppingItems);
        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }
        window.location.href = session.url;
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to create checkout session');
      }
    } else if (paymentMethod === 'razorpay') {
      toast.info('Razorpay checkout coming soon. Please use Stripe or contact support.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  const gst = total * 0.18;
  const finalTotal = total + gst;

  const canCheckout =
    (paymentMethod === 'stripe' && isStripeConfigured) ||
    (paymentMethod === 'razorpay' && showRazorpayOption);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="text-foreground font-medium">{item.name}</p>
                {item.tierLabel && (
                  <p className="text-sm text-muted-foreground">{item.tierLabel} × {item.quantity}</p>
                )}
              </div>
              <p className="text-foreground font-semibold">
                {formatINR(item.price * item.quantity)}
              </p>
            </div>
          ))}

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatINR(finalTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      {showRazorpayOption && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'razorpay')}
            >
              {isStripeConfigured && (
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Stripe</p>
                        <p className="text-sm text-muted-foreground">Pay with credit/debit card via Stripe</p>
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {showRazorpayOption && (
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-foreground">Razorpay</p>
                        <p className="text-sm text-muted-foreground">Pay with UPI, cards, wallets via Razorpay</p>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {!canCheckout && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Payment processing is not configured. Please contact support to complete your purchase.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleCheckout}
        disabled={createCheckoutSession.isPending || !canCheckout}
        className="w-full font-semibold text-lg py-6"
      >
        {createCheckoutSession.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Proceed to Payment — ${formatINR(finalTotal)}`
        )}
      </Button>
    </div>
  );
}
