import { useState, useEffect } from 'react';
import { useGetAllServices, useIsCallerAdmin } from '../hooks/useQueries';
import { DEFAULT_SERVICES } from '../marketplace/servicesCatalog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Link } from '@tanstack/react-router';
import { ShoppingBag, Star, EyeOff, Plus, Edit, CreditCard } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import ServiceCreateDialog from '../components/services/ServiceCreateDialog';
import ServicePaymentInfoDialog from '../components/services/ServicePaymentInfoDialog';
import ServiceRazorpayDialog from '../components/services/ServiceRazorpayDialog';
import type { Service } from '../backend';

export default function ServicesPage() {
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: backendServices = [], isLoading } = useGetAllServices(enableFetch);
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPaymentService, setEditingPaymentService] = useState<Service | null>(null);
  const [editingRazorpayService, setEditingRazorpayService] = useState<Service | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  // Enable fetching after component mounts
  useEffect(() => {
    setEnableFetch(true);
  }, []);

  const services: Service[] = backendServices.length > 0 ? backendServices : DEFAULT_SERVICES.map((s, i) => ({
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
    razorpayEnabled: false,
    razorpayKeyId: undefined,
    razorpayOrderId: undefined,
    paymentLinkUrl: undefined,
    qrCodeDataUrl: undefined,
  }));

  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category))).sort();

  // Apply filters
  let filteredServices: Service[] = services;

  // Category filter
  if (categoryFilter !== 'all') {
    filteredServices = filteredServices.filter(s => s.category === categoryFilter);
  }

  // Visibility filter (admin only)
  if (isAdmin) {
    if (visibilityFilter === 'visible') {
      filteredServices = filteredServices.filter(s => s.settings.isVisible);
    } else if (visibilityFilter === 'hidden') {
      filteredServices = filteredServices.filter(s => !s.settings.isVisible);
    }
  } else {
    // Non-admin users only see visible services
    filteredServices = filteredServices.filter(s => s.settings.isVisible);
  }

  // Calculate starting price
  const getStartingPrice = (service: Service) => {
    const prices = [
      Number(service.pricingBasic.price),
      Number(service.pricingPro.price),
      Number(service.pricingPremium.price),
    ];
    return Math.min(...prices);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Marketplace</h1>
          <p className="text-soft-gray mt-1">Browse our productized services</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gradient-teal text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          )}
          <Link to="/cart">
            <Button className="gradient-teal-glow text-black font-semibold">
              <ShoppingBag className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-input border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdmin && (
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-48 bg-input border-border">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="visible">Visible Only</SelectItem>
              <SelectItem value="hidden">Hidden Only</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-panel border-border">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id.toString()} className="glass-panel border-border hover:scale-105 transition-transform duration-300 relative">
              {service.settings.isFeatured && (
                <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {!service.settings.isVisible && (
                <Badge variant="outline" className="absolute top-4 right-4 text-muted-foreground">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hidden
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-foreground">{service.name}</CardTitle>
                <CardDescription className="text-soft-gray">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ₹{(getStartingPrice(service) / 100).toLocaleString()}
                  </span>
                  <span className="text-sm text-soft-gray">starting from</span>
                </div>
                <div className="flex gap-2">
                  <Link to="/services/$serviceId" params={{ serviceId: service.id.toString() }} className="flex-1">
                    <Button className="w-full gradient-teal text-black font-semibold">
                      View Details
                    </Button>
                  </Link>
                  {isAdmin && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingPaymentService(service)}
                        className="border-border shrink-0"
                        title="Edit Payment Info"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingRazorpayService(service)}
                        className="border-border shrink-0"
                        title="Configure Razorpay"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-soft-gray">No services found matching your filters</p>
        </div>
      )}

      <ServiceCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingPaymentService && (
        <ServicePaymentInfoDialog
          open={!!editingPaymentService}
          onOpenChange={(open) => !open && setEditingPaymentService(null)}
          service={editingPaymentService}
        />
      )}

      {editingRazorpayService && (
        <ServiceRazorpayDialog
          open={!!editingRazorpayService}
          onOpenChange={(open) => !open && setEditingRazorpayService(null)}
          service={editingRazorpayService}
        />
      )}
    </div>
  );
}
