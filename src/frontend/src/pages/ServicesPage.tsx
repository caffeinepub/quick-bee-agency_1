import { useGetAllServices } from '../hooks/useQueries';
import { DEFAULT_SERVICES } from '../marketplace/servicesCatalog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { ShoppingBag } from 'lucide-react';

export default function ServicesPage() {
  const { data: backendServices = [] } = useGetAllServices();

  const services = backendServices.length > 0 ? backendServices : DEFAULT_SERVICES.map((s, i) => ({
    id: BigInt(i + 1),
    name: s.name,
    description: s.description,
    priceBasic: BigInt(99900 + i * 10000),
    pricePro: BigInt(199900 + i * 10000),
    pricePremium: BigInt(299900 + i * 10000),
  }));

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
        {services.map((service) => (
          <Card key={service.id.toString()} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-foreground">{service.name}</CardTitle>
              <CardDescription className="text-soft-gray">{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-soft-gray">Basic</span>
                  <span className="text-foreground font-semibold">₹{(Number(service.priceBasic) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-soft-gray">Pro</span>
                  <span className="text-foreground font-semibold">₹{(Number(service.pricePro) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-soft-gray">Premium</span>
                  <span className="text-foreground font-semibold">₹{(Number(service.pricePremium) / 100).toLocaleString()}</span>
                </div>
              </div>
              <Link to={`/services/${service.id.toString()}`}>
                <Button className="w-full gradient-teal text-black font-semibold">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
