import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUpdateService } from '../../hooks/useQueries';
import type { Service } from '../../backend';
import { Loader2, Plus, X } from 'lucide-react';

interface ServiceEditDialogProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceEditDialog({ service, open, onOpenChange }: ServiceEditDialogProps) {
  const updateService = useUpdateService();

  // Form state
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [category, setCategory] = useState(service.category);
  const [subcategory, setSubcategory] = useState(service.subcategory);
  
  // Pricing tiers
  const [basicPrice, setBasicPrice] = useState(Number(service.pricingBasic.price) / 100);
  const [basicFeatures, setBasicFeatures] = useState<string[]>(service.pricingBasic.features);
  const [proPrice, setProPrice] = useState(Number(service.pricingPro.price) / 100);
  const [proFeatures, setProFeatures] = useState<string[]>(service.pricingPro.features);
  const [premiumPrice, setPremiumPrice] = useState(Number(service.pricingPremium.price) / 100);
  const [premiumFeatures, setPremiumFeatures] = useState<string[]>(service.pricingPremium.features);
  
  // General features
  const [features, setFeatures] = useState<string[]>(service.features);
  
  // Settings
  const [isVisible, setIsVisible] = useState(service.settings.isVisible);
  const [isFeatured, setIsFeatured] = useState(service.settings.isFeatured);
  const [availability, setAvailability] = useState(service.settings.availability);
  const [customMetadata, setCustomMetadata] = useState(service.settings.customMetadata);

  // Reset form when service changes
  useEffect(() => {
    setName(service.name);
    setDescription(service.description);
    setCategory(service.category);
    setSubcategory(service.subcategory);
    setBasicPrice(Number(service.pricingBasic.price) / 100);
    setBasicFeatures(service.pricingBasic.features);
    setProPrice(Number(service.pricingPro.price) / 100);
    setProFeatures(service.pricingPro.features);
    setPremiumPrice(Number(service.pricingPremium.price) / 100);
    setPremiumFeatures(service.pricingPremium.features);
    setFeatures(service.features);
    setIsVisible(service.settings.isVisible);
    setIsFeatured(service.settings.isFeatured);
    setAvailability(service.settings.availability);
    setCustomMetadata(service.settings.customMetadata);
  }, [service]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      return;
    }
    if (!description.trim()) {
      return;
    }
    if (!category.trim()) {
      return;
    }

    await updateService.mutateAsync({
      id: service.id,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      pricingBasic: {
        price: BigInt(Math.round(basicPrice * 100)),
        features: basicFeatures.filter(f => f.trim()),
      },
      pricingPro: {
        price: BigInt(Math.round(proPrice * 100)),
        features: proFeatures.filter(f => f.trim()),
      },
      pricingPremium: {
        price: BigInt(Math.round(premiumPrice * 100)),
        features: premiumFeatures.filter(f => f.trim()),
      },
      features: features.filter(f => f.trim()),
      settings: {
        isVisible,
        isFeatured,
        availability,
        customMetadata,
      },
    });

    onOpenChange(false);
  };

  const addFeature = (tier: 'basic' | 'pro' | 'premium' | 'general') => {
    if (tier === 'basic') setBasicFeatures([...basicFeatures, '']);
    else if (tier === 'pro') setProFeatures([...proFeatures, '']);
    else if (tier === 'premium') setPremiumFeatures([...premiumFeatures, '']);
    else setFeatures([...features, '']);
  };

  const removeFeature = (tier: 'basic' | 'pro' | 'premium' | 'general', index: number) => {
    if (tier === 'basic') setBasicFeatures(basicFeatures.filter((_, i) => i !== index));
    else if (tier === 'pro') setProFeatures(proFeatures.filter((_, i) => i !== index));
    else if (tier === 'premium') setPremiumFeatures(premiumFeatures.filter((_, i) => i !== index));
    else setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (tier: 'basic' | 'pro' | 'premium' | 'general', index: number, value: string) => {
    if (tier === 'basic') {
      const updated = [...basicFeatures];
      updated[index] = value;
      setBasicFeatures(updated);
    } else if (tier === 'pro') {
      const updated = [...proFeatures];
      updated[index] = value;
      setProFeatures(updated);
    } else if (tier === 'premium') {
      const updated = [...premiumFeatures];
      updated[index] = value;
      setPremiumFeatures(updated);
    } else {
      const updated = [...features];
      updated[index] = value;
      setFeatures(updated);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update service details, pricing tiers, and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter service name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter service description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Marketing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g., Social Media"
                />
              </div>
            </div>

            {/* General Features */}
            <div className="space-y-2">
              <Label>General Features</Label>
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature('general', index, e.target.value)}
                    placeholder="Feature description"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature('general', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addFeature('general')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Pricing Tiers</h3>

              {/* Basic Tier */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-medium">Basic Tier</h4>
                <div className="space-y-2">
                  <Label htmlFor="basicPrice">Price (₹)</Label>
                  <Input
                    id="basicPrice"
                    type="number"
                    value={basicPrice}
                    onChange={(e) => setBasicPrice(Number(e.target.value))}
                    placeholder="999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features</Label>
                  {basicFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('basic', index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature('basic', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('basic')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-medium">Pro Tier</h4>
                <div className="space-y-2">
                  <Label htmlFor="proPrice">Price (₹)</Label>
                  <Input
                    id="proPrice"
                    type="number"
                    value={proPrice}
                    onChange={(e) => setProPrice(Number(e.target.value))}
                    placeholder="1999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features</Label>
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('pro', index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature('pro', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('pro')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-medium">Premium Tier</h4>
                <div className="space-y-2">
                  <Label htmlFor="premiumPrice">Price (₹)</Label>
                  <Input
                    id="premiumPrice"
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(Number(e.target.value))}
                    placeholder="2999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features</Label>
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('premium', index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature('premium', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('premium')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isVisible">Visible in Marketplace</Label>
                <p className="text-sm text-muted-foreground">
                  Show this service in the marketplace
                </p>
              </div>
              <Switch
                id="isVisible"
                checked={isVisible}
                onCheckedChange={setIsVisible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isFeatured">Featured Service</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight this service as featured
                </p>
              </div>
              <Switch
                id="isFeatured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24/7">24/7</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="business-hours">Business Hours</SelectItem>
                  <SelectItem value="custom">Custom Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMetadata">Custom Metadata</Label>
              <Textarea
                id="customMetadata"
                value={customMetadata}
                onChange={(e) => setCustomMetadata(e.target.value)}
                placeholder="Additional metadata or notes"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateService.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateService.isPending || !name.trim() || !description.trim() || !category.trim()}
          >
            {updateService.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
