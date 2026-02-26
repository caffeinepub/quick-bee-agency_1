import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, FolderOpen, Briefcase, CreditCard, User } from 'lucide-react';

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navCards = [
    {
      label: 'My Projects',
      description: 'View your active projects',
      icon: <FolderOpen size={22} />,
      path: '/authenticated/projects',
      gradient: 'stat-card-gradient',
    },
    {
      label: 'Services',
      description: 'Browse available services',
      icon: <Briefcase size={22} />,
      path: '/authenticated/services',
      gradient: 'stat-card-gradient-cyan',
    },
    {
      label: 'Payments',
      description: 'View payment history',
      icon: <CreditCard size={22} />,
      path: '/authenticated/payments',
      gradient: 'stat-card-gradient-green',
    },
    {
      label: 'Profile',
      description: 'Manage your account',
      icon: <User size={22} />,
      path: '/authenticated',
      gradient: 'stat-card-gradient-amber',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Client Portal</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userProfile?.name || 'Client'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="badge-cyan text-xs capitalize">{String(userRole) || 'Client'}</Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut size={14} />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navCards.map((card) => (
          <Card
            key={card.label}
            className="shadow-card cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => navigate({ to: card.path })}
          >
            <CardContent className="p-5">
              <div className={`w-12 h-12 rounded-xl ${card.gradient} flex items-center justify-center mb-3 text-white`}>
                {card.icon}
              </div>
              <p className="font-semibold text-foreground">{card.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
