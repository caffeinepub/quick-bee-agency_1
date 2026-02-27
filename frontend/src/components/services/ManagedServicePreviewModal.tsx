import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Clock, Package, Plus, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManagedService, ServicePackage, PricingType } from '../../hooks/useQueries';

interface Props {
  open: boolean;
  onClose: () => void;
  service: ManagedService;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function getPricingTypeLabel(type: PricingType): string {
  if (type === PricingType.Fixed || (type as any).__kind__ === 'Fixed') return 'Fixed';
  if (type === PricingType.Hourly || (type as any).__kind__ === 'Hourly') return 'Hourly';
  return 'Custom Quote';
}

export default function ManagedServicePreviewModal({ open, onClose, service }: Props) {
  const [selectedPackageIdx, setSelectedPackageIdx] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);

  // Reset state when service changes
  useEffect(() => {
    setSelectedPackageIdx(0);
    setSelectedAddOns(new Set());
    setQuantity(1);
  }, [service.id]);

  const pricingLabel = getPricingTypeLabel(service.pricingType);
  const isCustom = pricingLabel === 'Custom Quote';
  const basePrice = Number(service.basePrice);

  const selectedPackage: ServicePackage | null = service.packages.length > 0
    ? service.packages[selectedPackageIdx] ?? service.packages[0]
    : null;

  const packagePrice = selectedPackage ? Number(selectedPackage.price) : basePrice;

  const addOnTotal = Array.from(selectedAddOns).reduce((sum, idx) => {
    const addon = service.addOns[idx];
    return sum + (addon ? Number(addon.price) : 0);
  }, 0);

  const totalPrice = (packagePrice + addOnTotal) * quantity;

  const toggleAddOn = (idx: number) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const packageLabels = ['Basic', 'Standard', 'Premium'];

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-2xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <DialogTitle className="text-foreground font-heading text-xl leading-tight">
                  {service.name}
                </DialogTitle>
                {service.category && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {service.category}
                  </Badge>
                )}
                <Badge
                  variant={service.isVisible ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    service.isVisible ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''
                  )}
                >
                  {service.isVisible ? 'Active' : 'Hidden'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Service Image */}
            {service.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-40 object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            {/* Descriptions */}
            {service.shortDescription && (
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {service.shortDescription}
              </p>
            )}
            {service.detailedDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.detailedDescription}
              </p>
            )}

            {/* Pricing & Delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Pricing</div>
                <div className="font-semibold text-primary text-sm">
                  {isCustom ? 'Custom Quote' : (
                    <>
                      {pricingLabel}: {formatINR(basePrice)}
                      {pricingLabel === 'Hourly' ? '/hr' : ''}
                    </>
                  )}
                </div>
              </div>
              {service.deliveryTime && (
                <div className="bg-muted/30 rounded-xl p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Delivery Time</div>
                  <div className="font-semibold text-foreground text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {service.deliveryTime}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {service.features.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">What's Included</h4>
                <ul className="space-y-1.5">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packages */}
            {service.packages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Service Packages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {service.packages.map((pkg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPackageIdx(i)}
                      className={cn(
                        'text-left p-4 rounded-xl border transition-all',
                        selectedPackageIdx === i
                          ? 'border-primary bg-primary/10 shadow-gold'
                          : 'border-border bg-muted/20 hover:border-primary/40'
                      )}
                    >
                      <div className="font-semibold text-sm text-foreground mb-1">
                        {pkg.name || packageLabels[i] || `Package ${i + 1}`}
                      </div>
                      <div className="text-primary font-bold text-base mb-1">
                        {formatINR(Number(pkg.price))}
                      </div>
                      {pkg.deliveryTime && (
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {pkg.deliveryTime}
                        </div>
                      )}
                      {pkg.features.length > 0 && (
                        <ul className="space-y-1">
                          {pkg.features.slice(0, 4).map((f, fi) => (
                            <li key={fi} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                          {pkg.features.length > 4 && (
                            <li className="text-xs text-muted-foreground pl-4">
                              +{pkg.features.length - 4} more
                            </li>
                          )}
                        </ul>
                      )}
                      {selectedPackageIdx === i && (
                        <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {service.addOns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Optional Add-ons</h4>
                <div className="space-y-2">
                  {service.addOns.map((addon, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                        selectedAddOns.has(i)
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border bg-muted/10 hover:border-primary/30'
                      )}
                      onClick={() => toggleAddOn(i)}
                    >
                      <Checkbox
                        checked={selectedAddOns.has(i)}
                        onCheckedChange={() => toggleAddOn(i)}
                        className="border-primary data-[state=checked]:bg-primary mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{addon.name}</span>
                          <span className="text-sm font-bold text-primary flex-shrink-0">
                            +{formatINR(Number(addon.price))}
                          </span>
                        </div>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {service.quantityEnabled && (
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-8 w-8 p-0 border-border hover:border-primary/50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-foreground font-semibold w-8 text-center">{quantity}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(q => q + 1)}
                    className="h-8 w-8 p-0 border-border hover:border-primary/50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Custom Requirements */}
            {service.customRequirementLabel && (
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">
                  {service.customRequirementLabel}
                </Label>
                <Textarea
                  disabled
                  placeholder="Project requirements will be discussed here..."
                  rows={3}
                  className="bg-muted/20 border-border text-muted-foreground resize-none cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Clients will fill this field when placing an order.
                </p>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-muted/30 rounded-xl p-4 border border-primary/20">
              <h4 className="text-sm font-semibold text-foreground mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                {selectedPackage && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{selectedPackage.name || 'Package'}</span>
                    <span>{formatINR(Number(selectedPackage.price))}</span>
                  </div>
                )}
                {!selectedPackage && !isCustom && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Price</span>
                    <span>{formatINR(basePrice)}</span>
                  </div>
                )}
                {Array.from(selectedAddOns).map(idx => {
                  const addon = service.addOns[idx];
                  if (!addon) return null;
                  return (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>+ {addon.name}</span>
                      <span>{formatINR(Number(addon.price))}</span>
                    </div>
                  );
                })}
                {service.quantityEnabled && quantity > 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>× Quantity ({quantity})</span>
                    <span></span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary text-lg">
                    {isCustom && !selectedPackage ? 'Custom Quote' : formatINR(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-border hover:bg-muted"
          >
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
