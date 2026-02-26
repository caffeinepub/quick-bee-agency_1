import { useEffect } from 'react';
import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="glass-card border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Your project will be created shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate({ to: '/authenticated/projects' })}
              className="gradient-teal text-dark-500 font-semibold"
            >
              View Projects
            </Button>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => navigate({ to: '/authenticated' })}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
