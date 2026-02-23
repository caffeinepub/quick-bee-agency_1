import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useCreateService } from '../../hooks/useQueries';
import { Loader2, Plus, X } from 'lucide-react';
import type { PricingTier, ServiceSettings } from '../../backend';

interface ServiceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceCreateDialog({ open, onOpenChange }: ServiceCreateDialogProps) {
  const createService = useCreateService();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');

  // Pricing tiers
  const [basicPrice, setBasicPrice] = useState('');
  const [basicFeatures, setBasicFeatures] = useState<string[]>(['']);
  const [proPrice, setProPrice] = useState('');
  const [proFeatures, setProFeatures] = useState<string[]>(['']);
  const [premiumPrice, setPremiumPrice] = useState('');
  const [premiumFeatures, setPremiumFeatures] = useState<string[]>(['']);

  // General features
  const [generalFeatures, setGeneralFeatures] = useState<string[]>(['']);

  // Settings
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [availability, setAvailability] = useState('24/7');
  const [customMetadata, setCustomMetadata] = useState('');

  const handleAddFeature = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveFeature = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((f, i) => i === index ? value : f));
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !description.trim() || !category.trim()) {
      return;
    }

    if (!basicPrice || !proPrice || !premiumPrice) {
      return;
    }

    const pricingBasic: PricingTier = {
      price: BigInt(Math.round(parseFloat(basicPrice) * 100)),
      features: basicFeatures.filter(f => f.trim() !== ''),
    };

    const pricingPro: PricingTier = {
      price: BigInt(Math.round(parseFloat(proPrice) * 100)),
      features: proFeatures.filter(f => f.trim() !== ''),
    };

    const pricingPremium: PricingTier = {
      price: BigInt(Math.round(parseFloat(premiumPrice) * 100)),
      features: premiumFeatures.filter(f => f.trim() !== ''),
    };

    const settings: ServiceSettings = {
      isVisible,
      isFeatured,
      availability,
      customMetadata,
    };

    try {
      await createService.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        pricingBasic,
        pricingPro,
        pricingPremium,
        features: generalFeatures.filter(f => f.trim() !== ''),
        settings,
      });

      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setSubcategory('');
      setBasicPrice('');
      setBasicFeatures(['']);
      setProPrice('');
      setProFeatures(['']);
      setPremiumPrice('');
      setPremiumFeatures(['']);
      setGeneralFeatures(['']);
      setIsVisible(true);
      setIsFeatured(false);
      setAvailability('24/7');
      setCustomMetadata('');

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
          <DialogDescription>
            Add a new service to your marketplace with pricing tiers and features.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., SEO Optimization Package"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this service offers..."
                rows={4}
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
                  placeholder="e.g., SEO"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>General Features</Label>
              {generalFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value, setGeneralFeatures)}
                    placeholder="Feature description"
                  />
                  {generalFeatures.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(index, setGeneralFeatures)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddFeature(setGeneralFeatures)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Basic Tier */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Basic Tier</h3>
              <div className="space-y-2">
                <Label htmlFor="basicPrice">Price (₹) *</Label>
                <Input
                  id="basicPrice"
                  type="number"
                  step="0.01"
                  value={basicPrice}
                  onChange={(e) => setBasicPrice(e.target.value)}
                  placeholder="999.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                {basicFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value, setBasicFeatures)}
                      placeholder="Feature description"
                    />
                    {basicFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index, setBasicFeatures)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFeature(setBasicFeatures)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Pro Tier</h3>
              <div className="space-y-2">
                <Label htmlFor="proPrice">Price (₹) *</Label>
                <Input
                  id="proPrice"
                  type="number"
                  step="0.01"
                  value={proPrice}
                  onChange={(e) => setProPrice(e.target.value)}
                  placeholder="1999.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                {proFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value, setProFeatures)}
                      placeholder="Feature description"
                    />
                    {proFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index, setProFeatures)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFeature(setProFeatures)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Premium Tier</h3>
              <div className="space-y-2">
                <Label htmlFor="premiumPrice">Price (₹) *</Label>
                <Input
                  id="premiumPrice"
                  type="number"
                  step="0.01"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  placeholder="2999.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value, setPremiumFeatures)}
                      placeholder="Feature description"
                    />
                    {premiumFeatures.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index, setPremiumFeatures)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFeature(setPremiumFeatures)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visible">Visible</Label>
                <p className="text-sm text-muted-foreground">
                  Make this service visible to all users
                </p>
              </div>
              <Switch
                id="visible"
                checked={isVisible}
                onCheckedChange={setIsVisible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Display this service as featured
                </p>
              </div>
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g., 24/7, weekdays, custom hours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Custom Metadata</Label>
              <Textarea
                id="metadata"
                value={customMetadata}
                onChange={(e) => setCustomMetadata(e.target.value)}
                placeholder="Additional information or notes..."
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createService.isPending || !name || !description || !category || !basicPrice || !proPrice || !premiumPrice}
            className="gradient-teal text-black font-semibold"
          >
            {createService.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
