import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Plus, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useGetAllServices, useIsCallerAdmin } from '../hooks/useQueries';
import ServiceCreateDialog from '../components/services/ServiceCreateDialog';
import ServiceEditDialog from '../components/services/ServiceEditDialog';
import ServiceDeleteDialog from '../components/services/ServiceDeleteDialog';
import ServicePaymentInfoDialog from '../components/services/ServicePaymentInfoDialog';
import ServiceRazorpayDialog from '../components/services/ServiceRazorpayDialog';
import { Service } from '../backend';
import {
  allMasterServices,
  SERVICE_CATEGORIES,
  MasterService,
} from '../data/masterServiceCatalog';
import { individualPackages } from '../data/individualPackages';
import { maintenancePlans } from '../data/maintenancePlans';
import { agencyPlans } from '../data/agencyPlans';
import formatINR, { formatPriceRange } from '../utils/formatCurrency';
import TierSelector from '../components/services/TierSelector';
import BuyNowButton from '../components/services/BuyNowButton';
import { useDirectPurchase } from '../hooks/useDirectPurchase';

// ─── Master Service Card ────────────────────────────────────────────────────
function MasterServiceCard({ service }: { service: MasterService }) {
  const [selectedTier, setSelectedTier] = useState(service.tiers[0]?.tierName ?? '');
  const [showFeatures, setShowFeatures] = useState(false);
  const { handlePurchase, isProcessing } = useDirectPurchase();

  const selectedTierData = service.tiers.find((t) => t.tierName === selectedTier);

  const categoryEmoji =
    service.categoryId === 'web-dev' ? '💻' :
    service.categoryId === 'app-dev' ? '📱' :
    service.categoryId === 'ai-automation' ? '🤖' :
    service.categoryId === 'digital-marketing' ? '📊' :
    service.categoryId === 'branding' ? '🎨' :
    service.categoryId === 'saas-tech' ? '💼' : '🛠';

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-bold leading-tight">{service.name}</CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">{categoryEmoji}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{service.subcategory}</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <TierSelector
          tiers={service.tiers}
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
        />
        {selectedTierData && (
          <p className="text-lg font-bold text-primary mt-3">
            {formatINR(selectedTierData.priceINR)}
          </p>
        )}
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
        >
          {showFeatures ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showFeatures ? 'Hide features' : `Show all ${service.features.length} features`}
        </button>
        {showFeatures && (
          <ul className="mt-2 space-y-1">
            {service.features.map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-primary mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-3">
          <BuyNowButton
            itemName={service.name}
            itemPrice={selectedTierData?.priceINR ?? service.tiers[0]?.priceINR ?? 0}
            tierLabel={selectedTier}
            onBuyNow={handlePurchase}
            isLoading={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Individual Package Card ────────────────────────────────────────────────
function PackageCard({ pkg }: { pkg: typeof individualPackages[0] }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const { handlePurchase, isProcessing } = useDirectPurchase();

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-bold leading-tight">{pkg.name}</CardTitle>
          <span className="text-base font-bold text-primary shrink-0">{formatINR(pkg.priceINR)}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          <Badge variant="outline" className="text-xs">{pkg.category}</Badge>
          <Badge variant="secondary" className="text-xs">{pkg.subcategory}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <p className="text-xs text-muted-foreground mb-2">{pkg.description}</p>
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showFeatures ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showFeatures ? 'Hide features' : `Show all ${pkg.features.length} features`}
        </button>
        {showFeatures && (
          <ul className="mt-2 space-y-1">
            {pkg.features.map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-primary mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-3">
          <BuyNowButton
            itemName={pkg.name}
            itemPrice={pkg.priceINR}
            onBuyNow={handlePurchase}
            isLoading={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Agency Plan Card ───────────────────────────────────────────────────────
function AgencyPlanCard({ plan }: { plan: typeof agencyPlans[0] }) {
  const { handlePurchase, isProcessing } = useDirectPurchase();
  const badgeClasses: Record<string, string> = {
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  const priceDisplay = plan.maxPriceINR
    ? `${formatINR(plan.minPriceINR)} – ${formatINR(plan.maxPriceINR)}`
    : `${formatINR(plan.minPriceINR)}+`;

  return (
    <Card className="flex flex-col relative overflow-hidden hover:shadow-xl transition-all border-2 border-border hover:border-primary/30">
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${badgeClasses[plan.badgeColor]}`}>
        {plan.emoji} {plan.planName}
      </div>
      <CardHeader className="pb-2 pr-28">
        <CardTitle className="text-xl font-bold">{plan.planName}</CardTitle>
        <p className="text-2xl font-extrabold text-primary mt-1">{priceDisplay}</p>
        <p className="text-xs text-muted-foreground italic">{plan.targetAudience}</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        <ul className="space-y-1.5 mb-4">
          {plan.features.map((f, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <BuyNowButton
            itemName={plan.planName}
            itemPrice={plan.minPriceINR}
            tierLabel={plan.targetAudience}
            onBuyNow={handlePurchase}
            isLoading={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Maintenance Tier Card ───────────────────────────────────────────────────
function MaintenanceTierCard({
  tier,
  categoryName,
}: {
  tier: { tierName: string; minPriceINR: number; maxPriceINR: number; description: string; features: string[] };
  categoryName: string;
}) {
  const { handlePurchase, isProcessing } = useDirectPurchase();
  const midPrice = Math.round((tier.minPriceINR + tier.maxPriceINR) / 2);

  return (
    <Card className="flex flex-col border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{tier.tierName}</CardTitle>
        <p className="text-lg font-extrabold text-primary">
          {formatPriceRange(tier.minPriceINR, tier.maxPriceINR)}
        </p>
        <p className="text-xs text-muted-foreground italic">{tier.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <ul className="space-y-1 mb-3">
          {tier.features.map((f, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
              <span className="text-primary mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <BuyNowButton
            itemName={`${categoryName} – ${tier.tierName}`}
            itemPrice={midPrice}
            tierLabel={tier.tierName}
            onBuyNow={handlePurchase}
            isLoading={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Backend Service Card (existing admin-managed services) ─────────────────
function BackendServiceCard({
  service,
  isAdmin,
}: {
  service: Service;
  isAdmin: boolean;
}) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const { handlePurchase, isProcessing } = useDirectPurchase();

  const tiers = [
    { tierName: 'Basic', priceINR: Number(service.pricingBasic.price) },
    { tierName: 'Pro', priceINR: Number(service.pricingPro.price) },
    { tierName: 'Premium', priceINR: Number(service.pricingPremium.price) },
  ];
  const [selectedTier, setSelectedTier] = useState('Basic');
  const selectedPrice = tiers.find((t) => t.tierName === selectedTier)?.priceINR ?? 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-bold leading-tight">{service.name}</CardTitle>
          {service.settings.isFeatured && (
            <Badge className="text-xs shrink-0">Featured</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{service.category} · {service.subcategory}</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
        <TierSelector tiers={tiers} selectedTier={selectedTier} onTierChange={setSelectedTier} />
        <p className="text-lg font-bold text-primary mt-2">{formatINR(selectedPrice)}</p>
        {service.features.length > 0 && (
          <>
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
            >
              {showFeatures ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showFeatures ? 'Hide features' : `Show ${service.features.length} features`}
            </button>
            {showFeatures && (
              <ul className="mt-2 space-y-1">
                {service.features.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <div className="mt-auto pt-3 space-y-2">
          <BuyNowButton
            itemName={service.name}
            itemPrice={selectedPrice}
            tierLabel={selectedTier}
            onBuyNow={handlePurchase}
            isLoading={isProcessing}
          />
          {isAdmin && (
            <div className="flex gap-1 flex-wrap">
              <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => setEditOpen(true)}>Edit</Button>
              <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => setPaymentOpen(true)}>Payment</Button>
              <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => setRazorpayOpen(true)}>Razorpay</Button>
              <Button size="sm" variant="destructive" className="text-xs flex-1" onClick={() => setDeleteOpen(true)}>Delete</Button>
            </div>
          )}
        </div>
      </CardContent>
      {editOpen && (
        <ServiceEditDialog service={service} open={editOpen} onOpenChange={setEditOpen} />
      )}
      {deleteOpen && (
        <ServiceDeleteDialog
          service={service}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onSuccess={() => setDeleteOpen(false)}
        />
      )}
      {paymentOpen && (
        <ServicePaymentInfoDialog service={service} open={paymentOpen} onOpenChange={setPaymentOpen} />
      )}
      {razorpayOpen && (
        <ServiceRazorpayDialog service={service} open={razorpayOpen} onOpenChange={setRazorpayOpen} />
      )}
    </Card>
  );
}

// ─── Main ServicesPage ───────────────────────────────────────────────────────
export default function ServicesPage() {
  const { data: backendServices = [], isLoading } = useGetAllServices();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [pkgSort, setPkgSort] = useState<'price-asc' | 'price-desc' | 'name-az'>('price-asc');

  // Filter master services
  const filteredMasterServices = useMemo(() => {
    let services =
      activeCategory === 'all'
        ? allMasterServices
        : allMasterServices.filter((s) => s.categoryId === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.subcategory.toLowerCase().includes(q)
      );
    }
    return services;
  }, [activeCategory, search]);

  // Sort individual packages
  const sortedPackages = useMemo(() => {
    const pkgs = [...individualPackages];
    if (pkgSort === 'price-asc') pkgs.sort((a, b) => a.priceINR - b.priceINR);
    else if (pkgSort === 'price-desc') pkgs.sort((a, b) => b.priceINR - a.priceINR);
    else pkgs.sort((a, b) => a.name.localeCompare(b.name));
    if (search.trim()) {
      const q = search.toLowerCase();
      return pkgs.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return pkgs;
  }, [pkgSort, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allMasterServices.length };
    SERVICE_CATEGORIES.forEach((cat) => {
      counts[cat.id] = allMasterServices.filter((s) => s.categoryId === cat.id).length;
    });
    return counts;
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">🐝 Quick Bee Agency Services</h1>
          <p className="text-muted-foreground text-sm mt-1">
            2026 Master Service Price List — Student → Local → National → Global Premium
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48 md:w-64"
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="catalog">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="catalog" className="text-xs sm:text-sm">📋 Service Catalog</TabsTrigger>
          <TabsTrigger value="packages" className="text-xs sm:text-sm">📦 Individual Packages</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs sm:text-sm">🔁 Maintenance Plans</TabsTrigger>
          <TabsTrigger value="agency-plans" className="text-xs sm:text-sm">💎 Agency Plans</TabsTrigger>
          {backendServices.length > 0 && (
            <TabsTrigger value="custom" className="text-xs sm:text-sm">⚙️ Custom Services</TabsTrigger>
          )}
        </TabsList>

        {/* ── Service Catalog Tab ── */}
        <TabsContent value="catalog" className="mt-4 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              All Services ({categoryCounts.all})
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {cat.emoji} {cat.name} ({categoryCounts[cat.id]})
              </button>
            ))}
          </div>

          {filteredMasterServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No services found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMasterServices.map((service) => (
                <MasterServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Individual Packages Tab ── */}
        <TabsContent value="packages" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold">Individual Packages</h2>
              <p className="text-sm text-muted-foreground">30 flat-rate packages sorted by price</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={pkgSort}
                onChange={(e) => setPkgSort(e.target.value as typeof pkgSort)}
                className="text-xs border border-border rounded-md px-2 py-1.5 bg-card text-foreground"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-az">Name: A–Z</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </TabsContent>

        {/* ── Maintenance Plans Tab ── */}
        <TabsContent value="maintenance" className="mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-bold">🔁 Monthly Maintenance & Subscription Plans</h2>
            <p className="text-sm text-muted-foreground">
              2026 Specific Model — Choose the right plan for your needs
            </p>
          </div>
          <Accordion
            type="multiple"
            defaultValue={maintenancePlans.map((p) => p.categoryId)}
            className="space-y-3"
          >
            {maintenancePlans.map((category) => (
              <AccordionItem
                key={category.categoryId}
                value={category.categoryId}
                className="border border-border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30 hover:bg-muted/50">
                  <span className="font-semibold text-sm">
                    {category.icon} {category.categoryName}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {category.tiers.map((tier) => (
                      <MaintenanceTierCard
                        key={tier.tierName}
                        tier={tier}
                        categoryName={category.categoryName}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* ── Agency Plans Tab ── */}
        <TabsContent value="agency-plans" className="mt-4 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold">💎 3 Master Agency Plans</h2>
            <p className="text-muted-foreground mt-1">
              Positioned for Sales — Student → Local → National → Global
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agencyPlans.map((plan) => (
              <AgencyPlanCard key={plan.planId} plan={plan} />
            ))}
          </div>
        </TabsContent>

        {/* ── Custom Services Tab (backend) ── */}
        {backendServices.length > 0 && (
          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Custom Services</h2>
                <p className="text-sm text-muted-foreground">Admin-managed services</p>
              </div>
              {isAdmin && (
                <Button onClick={() => setCreateOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Service
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {backendServices.map((service) => (
                  <BackendServiceCard
                    key={String(service.id)}
                    service={service}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {createOpen && <ServiceCreateDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  );
}
