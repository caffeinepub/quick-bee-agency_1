import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TrendingUp, Package, FolderOpen, Users, ArrowUpRight, Zap, BarChart3, Activity } from 'lucide-react';
import { useGetAllOrders, useGetAllServices, useGetAllLeads, useGetAllProjects, useIsCallerAdmin } from '../hooks/useQueries';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: orders = [] } = useGetAllOrders();
  const { data: services = [] } = useGetAllServices();
  const { data: leads = [] } = useGetAllLeads();
  const { data: projects = [] } = useGetAllProjects();

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'paid' || l.status === 'Closed').length / leads.length) * 100)
    : 0;

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(totalRevenue / 100).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Active Projects',
      value: activeProjects.toString(),
      icon: FolderOpen,
      change: '+3',
      positive: true,
    },
    {
      label: 'Total Orders',
      value: orders.length.toString(),
      icon: Package,
      change: '+8',
      positive: true,
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: BarChart3,
      change: '+2.1%',
      positive: true,
    },
  ];

  const quickActions = [
    { label: 'Add Lead', path: '/leads', icon: Users, desc: 'Capture new prospect' },
    { label: 'New Service', path: '/services', icon: Package, desc: 'Create service listing' },
    { label: 'View Analytics', path: '/analytics', icon: BarChart3, desc: 'Check performance' },
    { label: 'Automation', path: '/automation', icon: Zap, desc: 'Configure AI tools' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, change, positive }) => (
          <div key={label} className="glass-card rounded-2xl p-5 card-hover border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand-subtle border border-brand-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                positive ? 'text-brand-400 bg-brand-500/10' : 'text-destructive bg-destructive/10'
              }`}>
                {change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ label, path, icon: Icon, desc }) => (
            <button
              key={label}
              onClick={() => navigate({ to: path })}
              className="glass-card rounded-2xl p-5 text-left card-hover border border-border hover:border-brand-500/30 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl gradient-brand-subtle border border-brand-500/20 flex items-center justify-center mb-3 group-hover:glow-brand-sm transition-all">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-foreground group-hover:text-brand-400 transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              <ArrowUpRight className="w-3 h-3 text-brand-400/0 group-hover:text-brand-400/60 transition-all mt-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-semibold text-foreground">Recent Leads</h3>
            <button
              onClick={() => navigate({ to: '/leads' })}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all →
            </button>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No leads yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 4).map(lead => (
                <div key={lead.id.toString()} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <div className="w-8 h-8 rounded-lg gradient-brand-subtle border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-400">{lead.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.microNiche}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ${
                    lead.status === 'New Lead' ? 'text-brand-400 bg-brand-500/10' :
                    lead.status === 'paid' ? 'text-green-400 bg-green-500/10' :
                    'text-muted-foreground bg-muted/30'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-semibold text-foreground">Recent Orders</h3>
            <button
              onClick={() => navigate({ to: '/payments' })}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all →
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map(order => (
                <div key={order.id.toString()} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <div className="w-8 h-8 rounded-lg gradient-brand-subtle border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Order #{order.id.toString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-brand-400">₹{(Number(order.amount) / 100).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${
                      order.paymentStatus === 'Paid' || order.paymentStatus === 'paid'
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
