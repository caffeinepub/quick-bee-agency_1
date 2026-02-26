import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Target, Activity } from 'lucide-react';
import { useGetAllLeads, useGetAllOrders, useGetAllServices } from '../hooks/useQueries';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const { data: leads = [] } = useGetAllLeads();
  const { data: orders = [] } = useGetAllOrders();
  const { data: services = [] } = useGetAllServices();

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);
  const activeClients = new Set(orders.map(o => o.clientId.toString())).size;
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'paid').length / leads.length) * 100)
    : 0;
  const topService = services[0]?.name || 'N/A';

  const kpis = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, change: '+12.5%' },
    { label: 'Active Clients', value: activeClients.toString(), icon: Users, change: '+5' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, change: '+3.1%' },
    { label: 'Top Service', value: topService, icon: Target, change: 'Best seller' },
  ];

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const leadStatusData = [
    { name: 'New Lead', value: leads.filter(l => l.status === 'New Lead').length || 5 },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length || 8 },
    { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length || 6 },
    { name: 'Closed', value: leads.filter(l => l.status === 'paid').length || 3 },
  ];

  const COLORS = ['#2dd4bf', '#4ade80', '#06b6d4', '#10b981'];

  const customTooltipStyle = {
    backgroundColor: '#0a1512',
    border: '1px solid rgba(45, 212, 191, 0.2)',
    borderRadius: '12px',
    color: '#2dd4bf',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold gradient-text-teal flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          Analytics
        </h1>
        <p className="text-teal-400/50 text-sm mt-0.5">Performance insights and metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label}
              className="rounded-2xl p-5 relative overflow-hidden group hover:shadow-teal-glow-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(10,20,18,0.9), rgba(13,26,22,0.9))',
                border: '1px solid rgba(45, 212, 191, 0.15)',
              }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)' }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full text-teal-300 bg-teal-400/10">
                  {kpi.change}
                </span>
              </div>
              <p className="text-xl font-bold stat-value mb-1 truncate">{kpi.value}</p>
              <p className="text-xs text-teal-400/50 font-medium">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(10,20,18,0.9), rgba(13,26,22,0.9))',
            border: '1px solid rgba(45, 212, 191, 0.15)',
          }}>
          <h2 className="font-display text-base font-semibold gradient-text-teal mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,212,191,0.08)" />
              <XAxis dataKey="month" stroke="#2dd4bf60" tick={{ fill: '#2dd4bf80', fontSize: 11 }} />
              <YAxis stroke="#2dd4bf60" tick={{ fill: '#2dd4bf80', fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="revenue" stroke="#2dd4bf" strokeWidth={2} dot={{ fill: '#2dd4bf', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Status Pie */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(10,20,18,0.9), rgba(13,26,22,0.9))',
            border: '1px solid rgba(45, 212, 191, 0.15)',
          }}>
          <h2 className="font-display text-base font-semibold gradient-text-teal mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-400" />
            Lead Pipeline
          </h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {leadStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {leadStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-teal-300/70">{item.name}</span>
                  <span className="text-xs font-bold text-teal-300 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(10,20,18,0.9), rgba(13,26,22,0.9))',
          border: '1px solid rgba(45, 212, 191, 0.15)',
        }}>
        <h2 className="font-display text-base font-semibold gradient-text-teal mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-400" />
          Monthly Revenue
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,212,191,0.08)" />
            <XAxis dataKey="month" stroke="#2dd4bf60" tick={{ fill: '#2dd4bf80', fontSize: 11 }} />
            <YAxis stroke="#2dd4bf60" tick={{ fill: '#2dd4bf80', fontSize: 11 }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Bar dataKey="revenue" fill="url(#tealGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
