import { useState, useEffect } from 'react';
import { useGetAllServices } from '../hooks/useQueries';
import { DEFAULT_SERVICES } from '../marketplace/servicesCatalog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from '@tanstack/react-router';
import { ShoppingBag, Star, EyeOff } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function ServicesPage() {
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: backendServices = [], isLoading } = useGetAllServices(enableFetch);

  // Enable fetching after component mounts
  useEffect(() => {
    setEnableFetch(true);
  }, []);

  const services = backendServices.length > 0 ? backendServices : DEFAULT_SERVICES.map((s, i) => ({
    id: BigInt(i + 1),
    name: s.name,
    description: s.description,
    category: 'Uncategorized',
    subcategory: 'General',
    pricingBasic: { price: BigInt(99900 + i * 10000), features: [] },
    pricingPro: { price: BigInt(199900 + i * 10000), features: [] },
    pricingPremium: { price: BigInt(299900 + i * 10000), features: [] },
    features: [],
    settings: {
      isVisible: true,
      isFeatured: false,
      availability: '24/7',
      customMetadata: '',
    },
  }));

  // Filter only visible services for non-admin users
  const visibleServices = services.filter(s => s.settings.isVisible);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Marketplace</h1>
          <p className="text-soft-gray mt-1">Browse our 30+ productized services</p>
        </div>
        <Link to="/cart">
          <Button className="gradient-teal-glow text-black font-semibold">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View Cart
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-panel border-border">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          visibleServices.map((service) => (
            <Card key={service.id.toString()} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-foreground">{service.name}</CardTitle>
                  {service.settings.isFeatured && (
                    <Badge className="bg-primary/20 text-primary border-primary shrink-0">
                      <Star className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-soft-gray">{service.description}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{service.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-gray">Basic</span>
                    <span className="text-foreground font-semibold">₹{(Number(service.pricingBasic.price) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-gray">Pro</span>
                    <span className="text-foreground font-semibold">₹{(Number(service.pricingPro.price) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-gray">Premium</span>
                    <span className="text-foreground font-semibold">₹{(Number(service.pricingPremium.price) / 100).toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/services/${service.id.toString()}`}>
                  <Button className="w-full gradient-teal text-black font-semibold">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
