import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from '@tanstack/react-router';
import { Trash2, ShoppingBag } from 'lucide-react';
import formatINR from '../utils/formatCurrency';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Browse our services to get started</p>
        <Button
          onClick={() => navigate({ to: '/authenticated/services' })}
          className="font-semibold"
        >
          Browse Services
        </Button>
      </div>
    );
  }

  const gst = total * 0.18;
  const finalTotal = total + gst;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        <Button variant="ghost" onClick={clearCart} className="text-destructive">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    {item.tierLabel && (
                      <p className="text-sm text-muted-foreground mt-1">{item.tierLabel} Plan</p>
                    )}
                    <p className="text-lg font-bold text-primary mt-2">
                      {formatINR(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-20 bg-input border-border"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (18% GST)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>
              <Button
                onClick={() => navigate({ to: '/authenticated/checkout' })}
                className="w-full font-semibold"
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
