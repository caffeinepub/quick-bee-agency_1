import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-panel border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-soft-gray">
            Your payment could not be processed. Please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cart">
              <Button className="gradient-teal text-black font-semibold">
                Back to Cart
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
