import { useState, useEffect } from 'react';
import { useCart } from '../cart/useCart';
import { useCreateCheckoutSession } from '../payments/useCreateCheckoutSession';
import { useIsStripeConfigured, useIsRazorpayConfigured, useGetAllServices } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: isStripeConfigured = false } = useIsStripeConfigured();
  const { data: isRazorpayConfigured = false } = useIsRazorpayConfigured();
  const { data: services = [] } = useGetAllServices();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('stripe');

  // Check if any cart items have Razorpay enabled
  const hasRazorpayServices = items.some(item => {
    const service = services.find(s => s.id === item.serviceId);
    return service?.razorpayEnabled === true;
  });

  // Show Razorpay option only if globally configured AND at least one service has it enabled
  const showRazorpayOption = isRazorpayConfigured && hasRazorpayServices;

  // Auto-select payment method based on availability
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

      const shoppingItems: ShoppingItem[] = items.map(item => ({
        productName: `${item.serviceName} - ${item.tier}`,
        productDescription: `${item.tier} tier service`,
        priceInCents: BigInt(item.price),
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
      // Razorpay checkout flow
      toast.info('Razorpay checkout is not yet fully implemented. This is a placeholder for the integration.');
      // In a real implementation, you would:
      // 1. Create a Razorpay order via backend
      // 2. Initialize Razorpay checkout with the order details
      // 3. Handle payment success/failure callbacks
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-soft-gray">Your cart is empty</p>
      </div>
    );
  }

  const totalPrice = total;
  const gst = totalPrice * 0.18;
  const finalTotal = totalPrice + gst;

  const canCheckout = (paymentMethod === 'stripe' && isStripeConfigured) || 
                      (paymentMethod === 'razorpay' && showRazorpayOption);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={`${item.serviceId}-${item.tier}`} className="flex justify-between items-center">
              <div>
                <p className="text-foreground font-medium">{item.serviceName}</p>
                <p className="text-sm text-soft-gray">{item.tier} tier × {item.quantity}</p>
              </div>
              <p className="text-foreground font-semibold">
                ₹{((item.price * item.quantity) / 100).toLocaleString()}
              </p>
            </div>
          ))}

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-soft-gray">
              <span>Subtotal</span>
              <span>₹{(totalPrice / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-soft-gray">
              <span>GST (18%)</span>
              <span>₹{(gst / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{(finalTotal / 100).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      {showRazorpayOption && (
        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'razorpay')}>
              {isStripeConfigured && (
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Stripe</p>
                        <p className="text-sm text-soft-gray">Pay with credit/debit card via Stripe</p>
                      </div>
                    </div>
                  </Label>
                </div>
              )}
              
              {showRazorpayOption && (
                <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-foreground">Razorpay</p>
                        <p className="text-sm text-soft-gray">Pay with UPI, cards, wallets via Razorpay</p>
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
        className="w-full gradient-teal text-black font-semibold text-lg py-6"
      >
        {createCheckoutSession.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Proceed to Payment - ₹${(finalTotal / 100).toLocaleString()}`
        )}
      </Button>
    </div>
  );
}
