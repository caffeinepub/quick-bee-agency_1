import React from 'react';
import { TrendingUp, Users, BarChart3, Package, ArrowUpRight, Activity } from 'lucide-react';
import { useGetAllOrders, useGetAllLeads, useGetAllServices, useGetAllProjects } from '../hooks/useQueries';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const { data: orders = [] } = useGetAllOrders();
  const { data: leads = [] } = useGetAllLeads();
  const { data: services = [] } = useGetAllServices();
  const { data: projects = [] } = useGetAllProjects();

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const activeClients = new Set(projects.map(p => p.clientId.toString())).size;
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'paid' || l.status === 'Closed').length / leads.length) * 100)
    : 0;

  // Revenue by month (mock data based on orders)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 10000,
    };
  });

  // Lead status distribution
  const leadStatusData = [
    { name: 'New Lead', value: leads.filter(l => l.status === 'New Lead').length, color: '#00BFA6' },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length, color: '#00E676' },
    { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: '#69F0AE' },
    { name: 'Closed', value: leads.filter(l => l.status === 'Closed' || l.status === 'paid').length, color: '#00BCD4' },
    { name: 'Lost', value: leads.filter(l => l.status === 'Lost').length, color: '#546E7A' },
  ].filter(d => d.value > 0);

  const kpis = [
    { label: 'Total Revenue', value: `₹${(totalRevenue / 100).toLocaleString('en-IN')}`, icon: TrendingUp, change: '+12.5%' },
    { label: 'Active Clients', value: activeClients.toString(), icon: Users, change: '+3' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: BarChart3, change: '+2.1%' },
    { label: 'Total Services', value: services.length.toString(), icon: Package, change: `+${services.length}` },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Performance overview and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="glass-card rounded-2xl p-5 border border-border card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand-subtle border border-brand-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-lg text-brand-400 bg-brand-500/10 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <h3 className="text-base font-display font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00BFA6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#11181c', border: '1px solid rgba(0,191,166,0.2)', borderRadius: '12px', color: '#f1f5f9' }}
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00BFA6" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Distribution */}
        <div className="glass-card rounded-2xl p-5 border border-border">
          <h3 className="text-base font-display font-semibold text-foreground mb-4">Lead Distribution</h3>
          {leadStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-52">
              <div className="text-center">
                <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No lead data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {leadStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#11181c', border: '1px solid rgba(0,191,166,0.2)', borderRadius: '12px', color: '#f1f5f9' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Orders by status */}
      <div className="glass-card rounded-2xl p-5 border border-border">
        <h3 className="text-base font-display font-semibold text-foreground mb-4">Orders Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: orders.length, color: 'text-brand-400' },
            { label: 'Paid', value: orders.filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'paid').length, color: 'text-green-400' },
            { label: 'Pending', value: orders.filter(o => o.paymentStatus === 'Pending').length, color: 'text-amber-400' },
            { label: 'Failed', value: orders.filter(o => o.paymentStatus === 'Failed').length, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl bg-background/50 border border-border/50 text-center">
              <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
