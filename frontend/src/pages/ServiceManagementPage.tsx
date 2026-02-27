import React, { useState, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Copy, Eye, GripVertical, ToggleLeft, ToggleRight, Settings2, Package, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  useGetManagedServices,
  useDeleteManagedService,
  useDuplicateManagedService,
  useReorderManagedServices,
  useUpdateManagedService,
  ManagedService,
  PricingType,
} from '../hooks/useQueries';
import ManagedServiceFormDialog from '../components/services/ManagedServiceFormDialog';
import ManagedServicePreviewModal from '../components/services/ManagedServicePreviewModal';

function formatINR(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
}

function getPricingLabel(type: PricingType): string {
  if (type === PricingType.Fixed || (type as any).__kind__ === 'Fixed') return 'Fixed';
  if (type === PricingType.Hourly || (type as any).__kind__ === 'Hourly') return 'Hourly';
  return 'Custom';
}

function getServiceViews(id: string): number {
  return parseInt(localStorage.getItem(`service-views-${id}`) || '0', 10);
}

function getServicePurchases(id: string): number {
  return parseInt(localStorage.getItem(`service-purchases-${id}`) || '0', 10);
}

function ServiceCardSkeleton() {
  return (
    <div className="card-glass rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <Skeleton className="w-6 h-6 rounded mt-1" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: ManagedService;
  onEdit: (service: ManagedService) => void;
  onDelete: (service: ManagedService) => void;
  onDuplicate: (id: string) => void;
  onPreview: (service: ManagedService) => void;
  onToggleVisibility: (service: ManagedService) => void;
  isDuplicating: boolean;
  isTogglingId: string | null;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  viewCount: number;
  purchaseCount: number;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onToggleVisibility,
  isDuplicating,
  isTogglingId,
  dragHandleProps,
  isDragging,
  viewCount,
  purchaseCount,
}: ServiceCardProps) {
  const pricingLabel = getPricingLabel(service.pricingType);
  const isToggling = isTogglingId === service.id;

  return (
    <div
      className={cn(
        'card-glass rounded-xl p-5 transition-all duration-200 group',
        isDragging ? 'opacity-50 scale-95 shadow-gold' : 'hover:border-primary/30 gold-glow-hover'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate max-w-[200px]">
                {service.name}
              </h3>
              <Badge
                variant={service.isVisible ? 'default' : 'secondary'}
                className={cn(
                  'text-xs px-2 py-0.5 flex-shrink-0',
                  service.isVisible
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {service.isVisible ? 'Active' : 'Hidden'}
              </Badge>
              {!service.isUserCreated && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0 border-amber-500/40 text-amber-400">
                  Catalog
                </Badge>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {service.isVisible ? 'Visible' : 'Hidden'}
              </span>
              <Switch
                checked={service.isVisible}
                onCheckedChange={() => onToggleVisibility(service)}
                disabled={isToggling}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {/* Description */}
          {service.shortDescription && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {service.shortDescription}
            </p>
          )}

          {/* Meta Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.category && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-border text-muted-foreground">
                {service.category}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/30 text-primary">
              {pricingLabel}
              {pricingLabel !== 'Custom' && service.basePrice > 0n
                ? `: ${formatINR(service.basePrice)}`
                : ''}
              {pricingLabel === 'Hourly' ? '/hr' : ''}
            </Badge>
            {service.deliveryTime && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-border text-muted-foreground">
                ⏱ {service.deliveryTime}
              </Badge>
            )}
            {service.packages.length > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-border text-muted-foreground">
                <Package className="w-3 h-3 mr-1" />
                {service.packages.length} pkg
              </Badge>
            )}
          </div>

          {/* Analytics Badges */}
          <div className="flex gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              <Eye className="w-3 h-3" />
              Views: {viewCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              <BarChart2 className="w-3 h-3" />
              Purchases: {purchaseCount}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(service)}
              className="h-7 px-2.5 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(service)}
              className="h-7 px-2.5 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDuplicate(service.id)}
              disabled={isDuplicating}
              className="h-7 px-2.5 text-xs border-border hover:border-primary/50 hover:text-primary"
            >
              <Copy className="w-3 h-3 mr-1" />
              {isDuplicating ? 'Copying...' : 'Duplicate'}
            </Button>
            {service.isUserCreated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(service)}
                className="h-7 px-2.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceManagementPage() {
  const { data: services = [], isLoading } = useGetManagedServices();
  const deleteMutation = useDeleteManagedService();
  const duplicateMutation = useDuplicateManagedService();
  const reorderMutation = useReorderManagedServices();
  const updateMutation = useUpdateManagedService();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingService, setEditingService] = useState<ManagedService | null>(null);
  const [previewService, setPreviewService] = useState<ManagedService | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedService | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderedServices, setOrderedServices] = useState<ManagedService[]>([]);
  const dragOverId = useRef<string | null>(null);

  // Sync ordered services with fetched data
  React.useEffect(() => {
    const sorted = [...services].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
    setOrderedServices(sorted);
  }, [services]);

  // Refresh view counts when preview closes
  const refreshViewCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    services.forEach(s => {
      counts[s.id] = getServiceViews(s.id);
    });
    setViewCounts(counts);
  }, [services]);

  React.useEffect(() => {
    refreshViewCounts();
  }, [refreshViewCounts]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingService(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (service: ManagedService) => {
    setFormMode('edit');
    setEditingService(service);
    setFormOpen(true);
  };

  const handleOpenPreview = (service: ManagedService) => {
    // Increment view count
    const key = `service-views-${service.id}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
    setPreviewService(service);
    setPreviewOpen(true);
    refreshViewCounts();
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewService(null);
    refreshViewCounts();
  };

  const handleDeleteClick = (service: ManagedService) => {
    setDeleteTarget(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handleToggleVisibility = async (service: ManagedService) => {
    setTogglingId(service.id);
    try {
      await updateMutation.mutateAsync({
        id: service.id,
        service: { ...service, isVisible: !service.isVisible },
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
    if (draggedId && draggedId !== id) {
      setOrderedServices(prev => {
        const fromIdx = prev.findIndex(s => s.id === draggedId);
        const toIdx = prev.findIndex(s => s.id === id);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      const newOrder = orderedServices.map(s => s.id);
      reorderMutation.mutate(newOrder);
    }
    setDraggedId(null);
    dragOverId.current = null;
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    dragOverId.current = null;
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold font-heading text-foreground">Service Management</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage your agency services. Drag to reorder.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2 rounded-xl shadow-gold flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Services', value: services.length },
            { label: 'Active', value: services.filter(s => s.isVisible).length },
            { label: 'Hidden', value: services.filter(s => !s.isVisible).length },
            { label: 'User Created', value: services.filter(s => s.isUserCreated).length },
          ].map(stat => (
            <div key={stat.label} className="card-glass rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Service List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : orderedServices.length === 0 ? (
          <div className="card-glass rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Services Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Start building your service catalog. Add your first service to get started.
            </p>
            <Button
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        ) : (
          <div
            className="space-y-3"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {orderedServices.map(service => (
              <div
                key={service.id}
                draggable
                onDragStart={() => handleDragStart(service.id)}
                onDragOver={e => handleDragOver(e, service.id)}
                onDragEnd={handleDragEnd}
              >
                <ServiceCard
                  service={service}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                  onPreview={handleOpenPreview}
                  onToggleVisibility={handleToggleVisibility}
                  isDuplicating={duplicateMutation.isPending}
                  isTogglingId={togglingId}
                  isDragging={draggedId === service.id}
                  viewCount={viewCounts[service.id] ?? getServiceViews(service.id)}
                  purchaseCount={getServicePurchases(service.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer hint */}
        {orderedServices.length > 1 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Drag the <GripVertical className="w-3 h-3 inline" /> handle to reorder services
          </p>
        )}
      </div>

      {/* Form Dialog */}
      <ManagedServiceFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        initialService={editingService}
      />

      {/* Preview Modal */}
      {previewService && (
        <ManagedServicePreviewModal
          open={previewOpen}
          onClose={handleClosePreview}
          service={previewService}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Service</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action is permanent. Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Service'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
