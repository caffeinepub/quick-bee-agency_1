import { useState } from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetService, useIsCallerAdmin } from '../hooks/useQueries';
import { useCart } from '../cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Check, Edit, Eye, EyeOff, Star, Trash2, CreditCard } from 'lucide-react';
import ServiceEditDialog from '../components/services/ServiceEditDialog';
import ServiceDeleteDialog from '../components/services/ServiceDeleteDialog';
import ServicePaymentInfoDialog from '../components/services/ServicePaymentInfoDialog';
import ServicePaymentInfoDisplay from '../components/services/ServicePaymentInfoDisplay';

export default function ServiceDetailPage() {
  const { serviceId } = useParams({ from: '/services/$serviceId' });
  const navigate = useNavigate();
  const { data: service } = useGetService(BigInt(serviceId));
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { addItem } = useCart();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentInfoDialogOpen, setPaymentInfoDialogOpen] = useState(false);

  if (!service) {
    return <div className="text-center text-soft-gray">Service not found</div>;
  }

  const handleAddToCart = (tier: 'Basic' | 'Pro' | 'Premium') => {
    const prices = {
      Basic: Number(service.pricingBasic.price),
      Pro: Number(service.pricingPro.price),
      Premium: Number(service.pricingPremium.price),
    };

    addItem({
      serviceId: service.id,
      serviceName: service.name,
      tier,
      price: prices[tier],
    });

    toast.success(`Added ${tier} plan to cart`);
  };

  const handleDeleteSuccess = () => {
    navigate({ to: '/services' });
  };

  const tiers = [
    { 
      name: 'Basic', 
      price: service.pricingBasic.price, 
      features: service.pricingBasic.features.length > 0 
        ? service.pricingBasic.features 
        : ['Core features', 'Email support', '7-day delivery']
    },
    { 
      name: 'Pro', 
      price: service.pricingPro.price, 
      features: service.pricingPro.features.length > 0 
        ? service.pricingPro.features 
        : ['All Basic features', 'Priority support', '5-day delivery', 'Revisions included']
    },
    { 
      name: 'Premium', 
      price: service.pricingPremium.price, 
      features: service.pricingPremium.features.length > 0 
        ? service.pricingPremium.features 
        : ['All Pro features', '24/7 support', '3-day delivery', 'Unlimited revisions', 'Premium assets']
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/services">
          <Button variant="ghost" className="text-soft-gray hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={() => setPaymentInfoDialogOpen(true)}
              variant="outline"
              className="border-border"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Info
            </Button>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="gradient-teal text-black font-semibold"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Service
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Service
            </Button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
          {service.settings.isFeatured && (
            <Badge className="bg-primary/20 text-primary border-primary">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {!service.settings.isVisible && (
            <Badge variant="outline" className="text-muted-foreground">
              <EyeOff className="w-3 h-3 mr-1" />
              Hidden
            </Badge>
          )}
        </div>
        <p className="text-soft-gray mt-2">{service.description}</p>
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary">{service.category}</Badge>
          {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
        </div>
      </div>

      {service.features.length > 0 && (
        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-soft-gray">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

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

      <ServicePaymentInfoDisplay
        paymentLinkUrl={service.paymentLinkUrl}
        qrCodeDataUrl={service.qrCodeDataUrl}
      />

      {isAdmin && (
        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-soft-gray">Visibility:</span>
              <span className="text-foreground flex items-center gap-1">
                {service.settings.isVisible ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hidden
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-soft-gray">Featured:</span>
              <span className="text-foreground">{service.settings.isFeatured ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-soft-gray">Availability:</span>
              <span className="text-foreground">{service.settings.availability}</span>
            </div>
            {service.settings.customMetadata && (
              <div className="pt-2 border-t">
                <span className="text-soft-gray block mb-1">Custom Metadata:</span>
                <p className="text-foreground text-xs">{service.settings.customMetadata}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {service && (
        <>
          <ServiceEditDialog
            service={service}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <ServiceDeleteDialog
            service={service}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleDeleteSuccess}
          />
          <ServicePaymentInfoDialog
            service={service}
            open={paymentInfoDialogOpen}
            onOpenChange={setPaymentInfoDialogOpen}
          />
        </>
      )}
    </div>
  );
}
