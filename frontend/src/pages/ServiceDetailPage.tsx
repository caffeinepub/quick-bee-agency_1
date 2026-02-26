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
import ServiceRazorpayDialog from '../components/services/ServiceRazorpayDialog';
import ServicePaymentInfoDisplay from '../components/services/ServicePaymentInfoDisplay';

export default function ServiceDetailPage() {
  const { serviceId } = useParams({ from: '/authenticated/services/$serviceId' });
  const navigate = useNavigate();
  const { data: service } = useGetService(BigInt(serviceId));
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { addItem } = useCart();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentInfoDialogOpen, setPaymentInfoDialogOpen] = useState(false);
  const [razorpayDialogOpen, setRazorpayDialogOpen] = useState(false);

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Service not found</p>
      </div>
    );
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
      features:
        service.pricingBasic.features.length > 0
          ? service.pricingBasic.features
          : ['Core features', 'Email support', '7-day delivery'],
    },
    {
      name: 'Pro',
      price: service.pricingPro.price,
      features:
        service.pricingPro.features.length > 0
          ? service.pricingPro.features
          : ['All Basic features', 'Priority support', '5-day delivery', 'Revisions included'],
    },
    {
      name: 'Premium',
      price: service.pricingPremium.price,
      features:
        service.pricingPremium.features.length > 0
          ? service.pricingPremium.features
          : [
              'All Pro features',
              '24/7 support',
              '3-day delivery',
              'Unlimited revisions',
              'Premium assets',
            ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/services">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
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
              onClick={() => setRazorpayDialogOpen(true)}
              variant="outline"
              className="border-border"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Razorpay Settings
            </Button>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="bg-primary text-primary-foreground font-semibold"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Service
            </Button>
            <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Service
            </Button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold font-heading text-foreground">{service.name}</h1>
          {service.settings.isFeatured && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
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
          {service.razorpayEnabled && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Razorpay Enabled
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{service.description}</p>
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary">{service.category}</Badge>
          {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
        </div>
      </div>

      {service.features.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
          <Card
            key={tier.name}
            className="bg-card border-border hover:border-primary/40 transition-colors"
          >
            <CardHeader>
              <CardTitle className="text-foreground">{tier.name}</CardTitle>
              <div className="text-3xl font-bold text-primary mt-2">
                ₹{(Number(tier.price) / 100).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleAddToCart(tier.name as 'Basic' | 'Pro' | 'Premium')}
                className="w-full bg-primary text-primary-foreground font-semibold"
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Visibility:</span>
              <span className="text-foreground flex items-center gap-1">
                {service.settings.isVisible ? (
                  <>
                    <Eye className="w-4 h-4" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" /> Hidden
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Featured:</span>
              <span className="text-foreground">
                {service.settings.isFeatured ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Availability:</span>
              <span className="text-foreground">{service.settings.availability}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Razorpay:</span>
              <span className="text-foreground">
                {service.razorpayEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
      <ServiceRazorpayDialog
        service={service}
        open={razorpayDialogOpen}
        onOpenChange={setRazorpayDialogOpen}
      />
    </div>
  );
}
