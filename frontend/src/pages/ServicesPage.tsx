import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllServices, useDeleteService, useIsCallerAdmin } from '../hooks/useQueries';
import ServiceCreateDialog from '../components/services/ServiceCreateDialog';
import ServiceEditDialog from '../components/services/ServiceEditDialog';
import ServicePaymentInfoDialog from '../components/services/ServicePaymentInfoDialog';
import ServiceRazorpayDialog from '../components/services/ServiceRazorpayDialog';
import type { Service } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, ExternalLink, QrCode, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: services = [], isLoading } = useGetAllServices();
  const deleteService = useDeleteService();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState<Service | null>(null);
  const [paymentInfoService, setPaymentInfoService] = useState<Service | null>(null);
  const [razorpayService, setRazorpayService] = useState<Service | null>(null);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteServiceTarget) return;
    try {
      await deleteService.mutateAsync(deleteServiceTarget.id);
      toast.success('Service deleted');
      setDeleteServiceTarget(null);
    } catch {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and manage agency services</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted/30 border-border/50"
        />
      </div>

      {/* Services grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <Card key={service.id.toString()} className="glass border-border/50 hover:border-primary/30 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-display line-clamp-2">{service.name}</CardTitle>
                  <Badge variant="outline" className="text-xs shrink-0">{service.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Basic: ₹{Number(service.pricingBasic.price).toLocaleString()}</span>
                  <span>•</span>
                  <span>Pro: ₹{Number(service.pricingPro.price).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => navigate({ to: `/authenticated/services/${service.id.toString()}` })}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> View
                  </Button>
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditService(service)} className="h-8 w-8 p-0">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPaymentInfoService(service)} className="h-8 w-8 p-0">
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRazorpayService(service)} className="h-8 w-8 p-0">
                        <CreditCard className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteServiceTarget(service)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ServiceCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editService && (
        <ServiceEditDialog
          service={editService}
          open={!!editService}
          onOpenChange={(open) => !open && setEditService(null)}
        />
      )}
      {paymentInfoService && (
        <ServicePaymentInfoDialog
          service={paymentInfoService}
          open={!!paymentInfoService}
          onOpenChange={(open) => !open && setPaymentInfoService(null)}
        />
      )}
      {razorpayService && (
        <ServiceRazorpayDialog
          service={razorpayService}
          open={!!razorpayService}
          onOpenChange={(open) => !open && setRazorpayService(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteServiceTarget} onOpenChange={(open) => !open && setDeleteServiceTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteServiceTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
