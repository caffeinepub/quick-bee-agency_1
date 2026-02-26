import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Search, Package, Star, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useGetAllServices, useIsCallerAdmin } from '../hooks/useQueries';
import ServiceCreateDialog from '../components/services/ServiceCreateDialog';
import ServiceEditDialog from '../components/services/ServiceEditDialog';
import ServiceDeleteDialog from '../components/services/ServiceDeleteDialog';
import { Service } from '../backend';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { data: services = [], isLoading } = useGetAllServices();
  const { data: isAdmin } = useIsCallerAdmin();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{services.length} services available</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-dark-500 font-semibold text-sm hover:opacity-90 transition-opacity glow-brand-sm"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm"
        />
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No services found</p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 rounded-xl gradient-brand text-dark-500 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Create your first service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => (
            <div
              key={service.id.toString()}
              className="glass-card rounded-2xl p-5 border border-border card-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl gradient-brand-subtle border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{service.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{service.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {service.settings.isFeatured && (
                    <Star className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                  )}
                  {service.settings.isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{service.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Starting from</p>
                  <p className="text-lg font-display font-bold text-brand-400">
                    ₹{(Number(service.pricingBasic.price) / 100).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                  {service.settings.availability}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: '/services/$serviceId', params: { serviceId: service.id.toString() } })}
                  className="flex-1 py-2 rounded-xl gradient-brand text-dark-500 font-medium text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Details
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditService(service)}
                      className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteService(service)}
                      className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center hover:border-destructive/50 hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreate && (
        <ServiceCreateDialog
          open={showCreate}
          onOpenChange={(open) => setShowCreate(open)}
        />
      )}
      {editService && (
        <ServiceEditDialog
          service={editService}
          open={!!editService}
          onOpenChange={(open) => { if (!open) setEditService(null); }}
        />
      )}
      {deleteService && (
        <ServiceDeleteDialog
          service={deleteService}
          open={!!deleteService}
          onOpenChange={(open) => { if (!open) setDeleteService(null); }}
          onSuccess={() => setDeleteService(null)}
        />
      )}
    </div>
  );
}
