import React, { useState } from 'react';
import { useGetAllOrders, useGetAllPaymentLinks } from '../hooks/useQueries';
import type { Order, PaymentLink } from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Link2, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatINR(amount: bigint | number): string {
  const n = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function statusColor(status: string): string {
  if (status === 'paid' || status === 'completed') return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (status === 'pending') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  if (status === 'failed' || status === 'cancelled') return 'text-red-400 bg-red-400/10 border-red-400/30';
  return 'text-muted-foreground bg-muted/30 border-border';
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="card-glass rounded-xl p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">Order #{order.id.toString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-primary">{formatINR(order.amount)}</span>
        <Badge variant="outline" className={cn('text-xs', statusColor(order.paymentStatus))}>
          {order.paymentStatus}
        </Badge>
      </div>
    </div>
  );
}

function PaymentLinkRow({ link }: { link: PaymentLink }) {
  const copyUrl = () => {
    if (!link.paymentLinkUrl) { toast.error('No URL available'); return; }
    navigator.clipboard.writeText(link.paymentLinkUrl);
    toast.success('URL copied');
  };

  return (
    <div className="card-glass rounded-xl p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">Link #{link.id.toString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(Number(link.createdAt) / 1_000_000).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-primary">{formatINR(link.amount)}</span>
        <Badge variant="outline" className={cn('text-xs', statusColor(link.status))}>
          {link.status}
        </Badge>
        {link.paymentLinkUrl && (
          <>
            <Button size="sm" variant="ghost" onClick={copyUrl} className="h-7 w-7 p-0">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <a href={link.paymentLinkUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: paymentLinks = [], isLoading: linksLoading } = useGetAllPaymentLinks();
  const [tab, setTab] = useState('orders');

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading text-foreground">Payments</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{orders.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Orders</div>
          </div>
          <div className="card-glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{paymentLinks.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Payment Links</div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border mb-4">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Stripe Orders
            </TabsTrigger>
            <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              Payment Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0">
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="card-glass rounded-xl p-4 animate-pulse h-16" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => <OrderRow key={Number(o.id)} order={o} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-0">
            {linksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="card-glass rounded-xl p-4 animate-pulse h-16" />)}
              </div>
            ) : paymentLinks.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No payment links yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentLinks.map(l => <PaymentLinkRow key={Number(l.id)} link={l} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
