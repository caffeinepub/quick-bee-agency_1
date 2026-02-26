import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useGetCallerUserRole, useGetMyLeads } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, TrendingUp, UserCheck, Briefcase } from 'lucide-react';

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const { data: myLeads } = useGetMyLeads();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const activeLeads = myLeads?.filter(l => l.status !== 'Closed' && l.status !== 'Lost').length ?? 0;
  const closedLeads = myLeads?.filter(l => l.status === 'Closed').length ?? 0;

  const stats = [
    { label: 'My Leads', value: String(myLeads?.length ?? 0), icon: <Users size={18} />, gradient: 'stat-card-gradient' },
    { label: 'Active', value: String(activeLeads), icon: <UserCheck size={18} />, gradient: 'stat-card-gradient-cyan' },
    { label: 'Closed', value: String(closedLeads), icon: <TrendingUp size={18} />, gradient: 'stat-card-gradient-green' },
    { label: 'Services', value: '—', icon: <Briefcase size={18} />, gradient: 'stat-card-gradient-amber' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userProfile?.name || 'Manager'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="badge-cyan text-xs capitalize">{String(userRole) || 'Manager'}</Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut size={14} />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.gradient} rounded-xl p-5 text-white shadow-card`}>
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              {stat.icon}
            </div>
            <p className="text-2xl font-heading font-bold">{stat.value}</p>
            <p className="text-sm text-white/80 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-card cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate({ to: '/authenticated/leads' })}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">My Leads</p>
              <p className="text-sm text-muted-foreground">Manage your assigned leads</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate({ to: '/authenticated/crm' })}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">CRM Pipeline</p>
              <p className="text-sm text-muted-foreground">Track your pipeline stages</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
