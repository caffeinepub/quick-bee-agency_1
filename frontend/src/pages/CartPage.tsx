import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from '@tanstack/react-router';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="w-16 h-16 text-soft-gray mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-soft-gray mb-6">Browse our services to get started</p>
        <Link to="/services">
          <Button className="gradient-teal-glow text-black font-semibold">
            Browse Services
          </Button>
        </Link>
      </div>
    );
  }

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
            <Card key={`${item.serviceId}-${item.tier}`} className="glass-panel border-border">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.serviceName}</h3>
                    <p className="text-sm text-soft-gray mt-1">{item.tier} Plan</p>
                    <p className="text-lg font-bold text-primary mt-2">
                      ₹{(item.price / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.serviceId, item.tier, parseInt(e.target.value) || 1)}
                      className="w-20 bg-input border-border"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.serviceId, item.tier)}
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
          <Card className="glass-panel border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-soft-gray">
                <span>Subtotal</span>
                <span>₹{(total / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-soft-gray">
                <span>Tax (18% GST)</span>
                <span>₹{((total * 0.18) / 100).toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{((total * 1.18) / 100).toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full gradient-teal-glow text-black font-semibold">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
