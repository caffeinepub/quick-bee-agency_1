import { useParams, Link } from '@tanstack/react-router';
import { useGetService } from '../hooks/useQueries';
import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Check } from 'lucide-react';

export default function ServiceDetailPage() {
  const { serviceId } = useParams({ from: '/services/$serviceId' });
  const { data: service } = useGetService(BigInt(serviceId));
  const { addItem } = useCart();

  if (!service) {
    return <div className="text-center text-soft-gray">Service not found</div>;
  }

  const handleAddToCart = (tier: 'Basic' | 'Pro' | 'Premium') => {
    const prices = {
      Basic: Number(service.priceBasic),
      Pro: Number(service.pricePro),
      Premium: Number(service.pricePremium),
    };

    addItem({
      serviceId: service.id,
      serviceName: service.name,
      tier,
      price: prices[tier],
    });

    toast.success(`Added ${tier} plan to cart`);
  };

  const tiers = [
    { name: 'Basic', price: service.priceBasic, features: ['Core features', 'Email support', '7-day delivery'] },
    { name: 'Pro', price: service.pricePro, features: ['All Basic features', 'Priority support', '5-day delivery', 'Revisions included'] },
    { name: 'Premium', price: service.pricePremium, features: ['All Pro features', '24/7 support', '3-day delivery', 'Unlimited revisions', 'Premium assets'] },
  ];

  return (
    <div className="space-y-6">
      <Link to="/services">
        <Button variant="ghost" className="text-soft-gray hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
        <p className="text-soft-gray mt-2">{service.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.name} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-foreground">{tier.name}</CardTitle>
              <div className="text-3xl font-bold text-primary mt-2">
                ₹{(Number(tier.price) / 100).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-soft-gray">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleAddToCart(tier.name as 'Basic' | 'Pro' | 'Premium')}
                className="w-full gradient-teal text-black font-semibold"
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
