import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetService } from '../hooks/useQueries';
import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import formatINR from '../utils/formatCurrency';

export default function ServiceDetailPage() {
  const { serviceId } = useParams({ from: '/authenticated/services/$serviceId' });
  const navigate = useNavigate();
  const serviceIdBigInt = serviceId ? BigInt(serviceId) : BigInt(0);
  const { data: service, isLoading } = useGetService(serviceIdBigInt);
  const { addItem } = useCart();

  const handleAddToCart = (tierName: 'Basic' | 'Pro' | 'Premium') => {
    if (!service) return;
    const price =
      tierName === 'Basic'
        ? Number(service.pricingBasic.price)
        : tierName === 'Pro'
        ? Number(service.pricingPro.price)
        : Number(service.pricingPremium.price);

    const id = `service-${service.id.toString()}-${tierName}-${Date.now()}`;
    addItem({
      id,
      name: service.name,
      price,
      quantity: 1,
      tierLabel: tierName,
    });
    toast.success(`${service.name} (${tierName}) added to cart`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Service not found</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/authenticated/services' })}
          className="mt-4"
        >
          Back to Services
        </Button>
      </div>
    );
  }

  const tiers = [
    { name: 'Basic' as const, pricing: service.pricingBasic, color: 'border-border/50', badge: '' },
    { name: 'Pro' as const, pricing: service.pricingPro, color: 'border-primary/50', badge: 'Popular' },
    { name: 'Premium' as const, pricing: service.pricingPremium, color: 'border-accent/50', badge: 'Best Value' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/authenticated/services' })}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Button>

      {/* Service header */}
      <div className="rounded-xl p-6 border border-border/50 bg-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">{service.name}</h1>
            <p className="text-muted-foreground mt-2">{service.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">{service.category}</Badge>
              {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
            </div>
          </div>
        </div>

        {/* Features */}
        {service.features.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground mb-2">Included Features</p>
            <div className="flex flex-wrap gap-2">
              {service.features.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md"
                >
                  <Check className="w-3 h-3 text-primary" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`border-2 ${tier.color} relative`}>
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs px-3">
                  <Star className="w-3 h-3 mr-1" /> {tier.badge}
                </Badge>
              </div>
            )}
            <CardHeader className="pb-3 pt-6">
              <CardTitle className="text-lg font-display">{tier.name}</CardTitle>
              <p className="text-3xl font-bold text-foreground">
                {formatINR(Number(tier.pricing.price))}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.pricing.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full gap-2" onClick={() => handleAddToCart(tier.name)}>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
