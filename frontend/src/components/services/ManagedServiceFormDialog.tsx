import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCreateManagedService,
  useUpdateManagedService,
  ManagedService,
  ServicePackage,
  ServiceAddOn,
  PricingType,
} from '../../hooks/useQueries';

interface Props {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialService: ManagedService | null;
}

const CATEGORIES = [
  'SEO', 'Web Design', 'Ads', 'Branding', 'AI Automation',
  'App Development', 'Digital Marketing', 'Custom',
];

const DEFAULT_PACKAGE: ServicePackage = {
  name: '',
  price: 0n,
  deliveryTime: '',
  features: [],
};

const DEFAULT_ADDON: ServiceAddOn = {
  name: '',
  price: 0n,
  description: '',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface FeatureListProps {
  features: string[];
  onChange: (features: string[]) => void;
  placeholder?: string;
}

function FeatureList({ features, onChange, placeholder = 'Add a feature...' }: FeatureListProps) {
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    onChange([...features, trimmed]);
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    onChange(features.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx: number, value: string) => {
    const next = [...features];
    next[idx] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={f}
            onChange={e => updateFeature(i, e.target.value)}
            className="bg-input border-border text-foreground text-sm h-8"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => removeFeature(i)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={newFeature}
          onChange={e => setNewFeature(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
          placeholder={placeholder}
          className="bg-input border-border text-foreground text-sm h-8"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addFeature}
          className="h-8 px-3 border-primary/40 text-primary hover:bg-primary/10 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface PackageSectionProps {
  pkg: ServicePackage;
  label: string;
  onChange: (pkg: ServicePackage) => void;
}

function PackageSection({ pkg, label, onChange }: PackageSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm text-foreground">{label} Package</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Package Name</Label>
              <Input
                value={pkg.name}
                onChange={e => onChange({ ...pkg, name: e.target.value })}
                placeholder={`${label} Plan`}
                className="bg-input border-border text-foreground text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={Number(pkg.price)}
                onChange={e => onChange({ ...pkg, price: BigInt(Math.max(0, parseInt(e.target.value) || 0)) })}
                className="bg-input border-border text-foreground text-sm h-8"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Delivery Time</Label>
            <Input
              value={pkg.deliveryTime}
              onChange={e => onChange({ ...pkg, deliveryTime: e.target.value })}
              placeholder="e.g. 7 days"
              className="bg-input border-border text-foreground text-sm h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Features</Label>
            <FeatureList
              features={pkg.features}
              onChange={features => onChange({ ...pkg, features })}
              placeholder="Add package feature..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagedServiceFormDialog({ open, onClose, mode, initialService }: Props) {
  const createMutation = useCreateManagedService();
  const updateMutation = useUpdateManagedService();

  // Form state
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingType, setPricingType] = useState<'Fixed' | 'Hourly' | 'Custom'>('Fixed');
  const [basePrice, setBasePrice] = useState('0');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([
    { ...DEFAULT_PACKAGE, name: 'Basic' },
    { ...DEFAULT_PACKAGE, name: 'Standard' },
    { ...DEFAULT_PACKAGE, name: 'Premium' },
  ]);
  const [addOns, setAddOns] = useState<ServiceAddOn[]>([]);
  const [customRequirementLabel, setCustomRequirementLabel] = useState('Describe your project requirements');
  const [quantityEnabled, setQuantityEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [nameError, setNameError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Populate form when editing
  useEffect(() => {
    if (open && mode === 'edit' && initialService) {
      setName(initialService.name);
      setShortDescription(initialService.shortDescription);
      setDetailedDescription(initialService.detailedDescription);
      setCategory(initialService.category);
      const pt = initialService.pricingType;
      if ((pt as any).__kind__ === 'Fixed' || pt === PricingType.Fixed) setPricingType('Fixed');
      else if ((pt as any).__kind__ === 'Hourly' || pt === PricingType.Hourly) setPricingType('Hourly');
      else setPricingType('Custom');
      setBasePrice(String(Number(initialService.basePrice)));
      setDeliveryTime(initialService.deliveryTime);
      setImageUrl(initialService.imageUrl);
      setFeatures([...initialService.features]);
      if (initialService.packages.length >= 3) {
        setPackages(initialService.packages.map(p => ({ ...p })));
      } else if (initialService.packages.length > 0) {
        const pkgs = [...initialService.packages.map(p => ({ ...p }))];
        while (pkgs.length < 3) pkgs.push({ ...DEFAULT_PACKAGE, name: ['Basic', 'Standard', 'Premium'][pkgs.length] });
        setPackages(pkgs);
      } else {
        setPackages([
          { ...DEFAULT_PACKAGE, name: 'Basic' },
          { ...DEFAULT_PACKAGE, name: 'Standard' },
          { ...DEFAULT_PACKAGE, name: 'Premium' },
        ]);
      }
      setAddOns(initialService.addOns.map(a => ({ ...a })));
      setCustomRequirementLabel(initialService.customRequirementLabel || 'Describe your project requirements');
      setQuantityEnabled(initialService.quantityEnabled);
      setIsVisible(initialService.isVisible);
    } else if (open && mode === 'create') {
      setName('');
      setShortDescription('');
      setDetailedDescription('');
      setCategory('');
      setPricingType('Fixed');
      setBasePrice('0');
      setDeliveryTime('');
      setImageUrl('');
      setFeatures([]);
      setPackages([
        { ...DEFAULT_PACKAGE, name: 'Basic' },
        { ...DEFAULT_PACKAGE, name: 'Standard' },
        { ...DEFAULT_PACKAGE, name: 'Premium' },
      ]);
      setAddOns([]);
      setCustomRequirementLabel('Describe your project requirements');
      setQuantityEnabled(false);
      setIsVisible(true);
      setNameError('');
      setActiveTab('basic');
    }
  }, [open, mode, initialService]);

  const buildPricingType = (): PricingType => {
    if (pricingType === 'Fixed') return PricingType.Fixed;
    if (pricingType === 'Hourly') return PricingType.Hourly;
    return PricingType.Custom;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Service name is required');
      setActiveTab('basic');
      return;
    }
    setNameError('');

    const serviceData: ManagedService = {
      id: mode === 'edit' && initialService ? initialService.id : generateId(),
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      detailedDescription: detailedDescription.trim(),
      category,
      pricingType: buildPricingType(),
      basePrice: BigInt(Math.max(0, parseInt(basePrice) || 0)),
      deliveryTime: deliveryTime.trim(),
      imageUrl: imageUrl.trim(),
      features,
      packages,
      addOns,
      customRequirementLabel: customRequirementLabel.trim(),
      quantityEnabled,
      isVisible,
      sortOrder: mode === 'edit' && initialService ? initialService.sortOrder : 0n,
      createdAt: mode === 'edit' && initialService ? initialService.createdAt : BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
      isUserCreated: mode === 'edit' && initialService ? initialService.isUserCreated : true,
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(serviceData);
    } else if (initialService) {
      await updateMutation.mutateAsync({ id: initialService.id, service: serviceData });
    }
    onClose();
  };

  const addAddOn = () => {
    setAddOns(prev => [...prev, { ...DEFAULT_ADDON }]);
  };

  const removeAddOn = (idx: number) => {
    setAddOns(prev => prev.filter((_, i) => i !== idx));
  };

  const updateAddOn = (idx: number, field: keyof ServiceAddOn, value: string | bigint) => {
    setAddOns(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-2xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-foreground font-heading text-lg">
            {mode === 'create' ? 'Add New Service' : 'Edit Service'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 pt-4">
              <TabsList className="bg-muted/50 border border-border w-full grid grid-cols-4">
                <TabsTrigger value="basic" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="features" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Features
                </TabsTrigger>
                <TabsTrigger value="packages" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Packages
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-foreground mb-1.5 block">
                    Service Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={e => { setName(e.target.value); if (e.target.value.trim()) setNameError(''); }}
                    placeholder="e.g. SEO Optimization Package"
                    className={cn('bg-input border-border text-foreground', nameError && 'border-destructive')}
                  />
                  {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
                </div>

                <div>
                  <Label className="text-sm text-foreground mb-1.5 block">Short Description</Label>
                  <Textarea
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    placeholder="Brief one-line description..."
                    rows={2}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-foreground mb-1.5 block">Detailed Description</Label>
                  <Textarea
                    value={detailedDescription}
                    onChange={e => setDetailedDescription(e.target.value)}
                    placeholder="Full description of the service..."
                    rows={4}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-foreground mb-1.5 block">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c} className="text-foreground hover:bg-muted">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground mb-1.5 block">Delivery Time</Label>
                    <Input
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      placeholder="e.g. 7-14 days"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-foreground mb-2 block">Pricing Type</Label>
                  <RadioGroup
                    value={pricingType}
                    onValueChange={v => setPricingType(v as 'Fixed' | 'Hourly' | 'Custom')}
                    className="flex gap-4"
                  >
                    {(['Fixed', 'Hourly', 'Custom'] as const).map(pt => (
                      <div key={pt} className="flex items-center gap-2">
                        <RadioGroupItem value={pt} id={`pt-${pt}`} className="border-primary text-primary" />
                        <Label htmlFor={`pt-${pt}`} className="text-sm text-foreground cursor-pointer">{pt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {pricingType !== 'Custom' && (
                  <div>
                    <Label className="text-sm text-foreground mb-1.5 block">
                      Base Price (₹) {pricingType === 'Hourly' && <span className="text-muted-foreground text-xs">per hour</span>}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                      placeholder="0"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm text-foreground mb-1.5 block">Image / Icon URL</Label>
                  <Input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-foreground mb-2 block">Service Features</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add bullet-point features that describe what's included in this service.
                  </p>
                  <FeatureList
                    features={features}
                    onChange={setFeatures}
                    placeholder="e.g. Keyword research & analysis"
                  />
                </div>
              </TabsContent>

              {/* Packages Tab */}
              <TabsContent value="packages" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-foreground mb-1 block">Service Packages</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Define Basic, Standard, and Premium tiers with different pricing and features.
                  </p>
                  <div className="space-y-3">
                    {packages.map((pkg, i) => (
                      <PackageSection
                        key={i}
                        pkg={pkg}
                        label={['Basic', 'Standard', 'Premium'][i] || pkg.name}
                        onChange={updated => {
                          const next = [...packages];
                          next[i] = updated;
                          setPackages(next);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-foreground">Optional Add-ons</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addAddOn}
                      className="h-7 px-3 text-xs border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Add-on
                    </Button>
                  </div>
                  {addOns.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No add-ons yet. Click "Add Add-on" to create one.</p>
                  ) : (
                    <div className="space-y-3">
                      {addOns.map((addon, i) => (
                        <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Add-on #{i + 1}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAddOn(i)}
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                              <Input
                                value={addon.name}
                                onChange={e => updateAddOn(i, 'name', e.target.value)}
                                placeholder="e.g. Rush Delivery"
                                className="bg-input border-border text-foreground text-sm h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">Price (₹)</Label>
                              <Input
                                type="number"
                                min={0}
                                value={Number(addon.price)}
                                onChange={e => updateAddOn(i, 'price', BigInt(Math.max(0, parseInt(e.target.value) || 0)))}
                                className="bg-input border-border text-foreground text-sm h-8"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                            <Textarea
                              value={addon.description}
                              onChange={e => updateAddOn(i, 'description', e.target.value)}
                              placeholder="Brief description of this add-on..."
                              rows={2}
                              className="bg-input border-border text-foreground text-sm resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-foreground mb-1.5 block">Custom Requirement Label</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Label shown to clients when they need to describe their project requirements.
                  </p>
                  <Input
                    value={customRequirementLabel}
                    onChange={e => setCustomRequirementLabel(e.target.value)}
                    placeholder="Describe your project requirements"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                  <Checkbox
                    id="quantityEnabled"
                    checked={quantityEnabled}
                    onCheckedChange={v => setQuantityEnabled(!!v)}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <div>
                    <Label htmlFor="quantityEnabled" className="text-sm text-foreground cursor-pointer font-medium">
                      Enable Quantity Selection
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Allow clients to select multiple quantities of this service.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                  <Checkbox
                    id="isVisible"
                    checked={isVisible}
                    onCheckedChange={v => setIsVisible(!!v)}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <div>
                    <Label htmlFor="isVisible" className="text-sm text-foreground cursor-pointer font-medium">
                      Visible to Clients
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When enabled, this service will be visible in the public catalog.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t border-border flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? 'Create Service' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
