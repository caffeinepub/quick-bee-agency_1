import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  TrendingUp,
  Users,
  FolderOpen,
  CreditCard,
  ArrowRight,
  Plus,
  BarChart3,
  Zap,
  UserCheck,
  ShoppingCart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useGetAllLeads, useGetAllOrders, useGetAllProjects } from '../hooks/useQueries';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: leads } = useGetAllLeads();
  const { data: orders } = useGetAllOrders();
  const { data: projects } = useGetAllProjects();

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) ?? 0;
  const activeLeads = leads?.filter(l => l.status !== 'Closed' && l.status !== 'Lost').length ?? 0;
  const activeProjects = projects?.filter(p => p.status === 'Active').length ?? 0;
  const paidOrders = orders?.filter(o => o.paymentStatus === 'paid').length ?? 0;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <TrendingUp size={20} />,
      gradient: 'stat-card-gradient',
      change: '+12%',
    },
    {
      title: 'Active Leads',
      value: activeLeads.toString(),
      icon: <UserCheck size={20} />,
      gradient: 'stat-card-gradient-cyan',
      change: '+5',
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      icon: <FolderOpen size={20} />,
      gradient: 'stat-card-gradient-green',
      change: '+2',
    },
    {
      title: 'Paid Orders',
      value: paidOrders.toString(),
      icon: <CreditCard size={20} />,
      gradient: 'stat-card-gradient-amber',
      change: '+8',
    },
  ];

  const quickActions = [
    { label: 'Add Lead', icon: <Plus size={16} />, path: '/authenticated/leads', color: 'default' as const },
    { label: 'View CRM', icon: <Users size={16} />, path: '/authenticated/crm', color: 'secondary' as const },
    { label: 'Analytics', icon: <BarChart3 size={16} />, path: '/authenticated/analytics', color: 'secondary' as const },
    { label: 'Automation', icon: <Zap size={16} />, path: '/authenticated/automation', color: 'secondary' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here's what's happening with your sales today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {isAdmin ? 'Admin' : 'Member'}
          </Badge>
          <Button size="sm" onClick={() => navigate({ to: '/authenticated/leads' })}>
            <Plus size={14} className="mr-1.5" />
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className={`${card.gradient} rounded-xl p-5 text-white shadow-card`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold">{card.value}</p>
            <p className="text-sm text-white/80 mt-0.5">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.color}
                size="sm"
                onClick={() => navigate({ to: action.path })}
                className="gap-1.5"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leads */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">Recent Leads</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/authenticated/leads' })}
                className="text-xs gap-1 h-7"
              >
                View all <ArrowRight size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leads && leads.length > 0 ? (
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={String(lead.id)}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.channel} · {lead.microNiche}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        lead.status === 'Closed' ? 'badge-success' :
                        lead.status === 'Lost' ? 'badge-destructive' :
                        lead.status === 'New Lead' ? 'badge-primary' :
                        'badge-warning'
                      }`}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No leads yet</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate({ to: '/authenticated/leads' })}
                  className="mt-1 text-xs"
                >
                  Add your first lead
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/authenticated/payments' })}
                className="text-xs gap-1 h-7"
              >
                View all <ArrowRight size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={String(order.id)}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">Order #{String(order.id)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{Number(order.amount).toLocaleString()}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate({ to: '/authenticated/services' })}
                  className="mt-1 text-xs"
                >
                  Browse services
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
