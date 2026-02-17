import { useEffect } from 'react';
import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-panel border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-soft-gray">
            Your payment has been processed successfully. Your project will be created shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/projects">
              <Button className="gradient-teal text-black font-semibold">
                View Projects
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-border">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
