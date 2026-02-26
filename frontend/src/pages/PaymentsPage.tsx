import React, { useState } from 'react';
import { CreditCard, Link, ExternalLink, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useGetAllOrders, useGetPaymentLinks, useUpdatePaymentLinkStatus } from '../hooks/useQueries';

const STATUS_ICON: Record<string, React.ReactNode> = {
  'Paid': <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  'paid': <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  'Pending': <Clock className="w-3.5 h-3.5 text-amber-400" />,
  'Failed': <XCircle className="w-3.5 h-3.5 text-red-400" />,
  'created': <Clock className="w-3.5 h-3.5 text-brand-400" />,
};

const STATUS_CLASS: Record<string, string> = {
  'Paid': 'text-green-400 bg-green-500/10 border-green-500/20',
  'paid': 'text-green-400 bg-green-500/10 border-green-500/20',
  'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Failed': 'text-red-400 bg-red-500/10 border-red-500/20',
  'created': 'text-brand-400 bg-brand-500/10 border-brand-500/20',
};

export default function PaymentsPage() {
  const [tab, setTab] = useState<'orders' | 'links'>('orders');
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: paymentLinks = [], isLoading: linksLoading } = useGetPaymentLinks();
  const updateStatus = useUpdatePaymentLinkStatus();

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage orders and payment links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100).toLocaleString('en-IN')}`, color: 'text-brand-400' },
          { label: 'Total Orders', value: orders.length.toString(), color: 'text-foreground' },
          { label: 'Payment Links', value: paymentLinks.length.toString(), color: 'text-foreground' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5 border border-border">
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border w-fit">
        {(['orders', 'links'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'gradient-brand text-dark-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'orders' ? 'Orders' : 'Payment Links'}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          {ordersLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders.map(order => (
                    <tr key={order.id.toString()} className="hover:bg-brand-500/3 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">#{order.id.toString()}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-brand-400">
                        ₹{(Number(order.amount) / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${STATUS_CLASS[order.paymentStatus] ?? 'text-muted-foreground bg-muted/30 border-border'}`}>
                          {STATUS_ICON[order.paymentStatus]}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Links Tab */}
      {tab === 'links' && (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          {linksLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mx-auto" />
            </div>
          ) : paymentLinks.length === 0 ? (
            <div className="p-12 text-center">
              <Link className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No payment links yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Link</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paymentLinks.map(link => (
                    <tr key={link.id.toString()} className="hover:bg-brand-500/3 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">#{link.id.toString()}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-brand-400">
                        ₹{(Number(link.amount) / 100).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${STATUS_CLASS[link.status] ?? 'text-muted-foreground bg-muted/30 border-border'}`}>
                          {STATUS_ICON[link.status]}
                          {link.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {link.paymentLinkUrl ? (
                          <a href={link.paymentLinkUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            Open Link
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No link set</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {link.status !== 'paid' && (
                          <button
                            onClick={() => updateStatus.mutateAsync({ id: link.id, status: 'paid' })}
                            disabled={updateStatus.isPending}
                            className="text-xs px-3 py-1.5 rounded-lg gradient-brand text-dark-500 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
