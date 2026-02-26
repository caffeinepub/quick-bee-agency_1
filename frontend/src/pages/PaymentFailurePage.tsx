import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="glass-card border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment could not be processed. Please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate({ to: '/authenticated/cart' })}
              className="gradient-teal text-dark-500 font-semibold"
            >
              Back to Cart
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
