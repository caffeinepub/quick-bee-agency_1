import React, { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../../hooks/useQueries';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Zap,
  FileText,
  Bell,
  CreditCard,
  Scale,
  Download,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Target,
  PenTool,
  Brain,
  Workflow,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
  roles?: string[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: <LayoutDashboard className="w-4 h-4" />,
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/authenticated' },
    ],
  },
  {
    label: 'Sales & CRM',
    icon: <Users className="w-4 h-4" />,
    roles: ['admin', 'user'],
    items: [
      { label: 'Leads', icon: <Users className="w-4 h-4" />, path: '/authenticated/leads', roles: ['admin', 'user'] },
      { label: 'CRM Pipeline', icon: <TrendingUp className="w-4 h-4" />, path: '/authenticated/crm', roles: ['admin', 'user'] },
      { label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/authenticated/analytics', roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'AI Smart Systems',
    icon: <Brain className="w-4 h-4" />,
    roles: ['admin', 'user'],
    items: [
      { label: 'AI Generators', icon: <Sparkles className="w-4 h-4" />, path: '/authenticated/generators', roles: ['admin', 'user'] },
      { label: 'Service Recommender', icon: <Target className="w-4 h-4" />, path: '/authenticated/service-recommendation', roles: ['admin', 'user'] },
      { label: 'Proposal Generator', icon: <FileText className="w-4 h-4" />, path: '/authenticated/proposal-generator', roles: ['admin', 'user'] },
      { label: 'Pricing Strategy', icon: <TrendingUp className="w-4 h-4" />, path: '/authenticated/pricing-strategy', roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'Automations',
    icon: <Zap className="w-4 h-4" />,
    roles: ['admin', 'user'],
    items: [
      { label: 'Automation Center', icon: <Zap className="w-4 h-4" />, path: '/authenticated/automation', roles: ['admin', 'user'] },
      { label: 'Workflows', icon: <Workflow className="w-4 h-4" />, path: '/authenticated/workflows', roles: ['admin', 'user'] },
      { label: 'Analytics Engine', icon: <Activity className="w-4 h-4" />, path: '/authenticated/analytics-engine', roles: ['admin', 'user'] },
      { label: 'Content Creator', icon: <PenTool className="w-4 h-4" />, path: '/authenticated/content-creator', roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'Commerce',
    icon: <ShoppingCart className="w-4 h-4" />,
    items: [
      { label: 'Services', icon: <Sparkles className="w-4 h-4" />, path: '/authenticated/services' },
      { label: 'Cart', icon: <ShoppingCart className="w-4 h-4" />, path: '/authenticated/cart' },
      { label: 'Payments', icon: <CreditCard className="w-4 h-4" />, path: '/authenticated/payments', roles: ['admin', 'user'] },
      { label: 'Invoices', icon: <FileText className="w-4 h-4" />, path: '/authenticated/invoices', roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'Projects',
    icon: <FolderOpen className="w-4 h-4" />,
    items: [
      { label: 'My Projects', icon: <FolderOpen className="w-4 h-4" />, path: '/authenticated/projects' },
    ],
  },
  {
    label: 'Communication',
    icon: <MessageSquare className="w-4 h-4" />,
    roles: ['admin', 'user'],
    items: [
      { label: 'WhatsApp Logs', icon: <MessageSquare className="w-4 h-4" />, path: '/authenticated/whatsapp-logs', roles: ['admin', 'user'] },
      { label: 'Notifications', icon: <Bell className="w-4 h-4" />, path: '/authenticated/notifications' },
    ],
  },
  {
    label: 'Admin',
    icon: <Settings className="w-4 h-4" />,
    roles: ['admin'],
    items: [
      { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/authenticated/settings', roles: ['admin'] },
      { label: 'Legal Pages', icon: <Scale className="w-4 h-4" />, path: '/authenticated/legal', roles: ['admin'] },
      { label: 'Data Export', icon: <Download className="w-4 h-4" />, path: '/authenticated/data-export', roles: ['admin'] },
    ],
  },
];

export function SidebarNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const { data: role } = useGetCallerUserRole();

  const currentPath = routerState.location.pathname;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach(g => { initial[g.label] = true; });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(role || 'guest');
  };

  const isGroupVisible = (group: NavGroup) => {
    if (!group.roles) return true;
    return group.roles.includes(role || 'guest');
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-gradient text-sidebar-foreground">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/quickbee-logo.dim_256x256.png" alt="QuickBee" className="w-8 h-8 rounded-lg" />
          <div>
            <div className="font-bold text-sm text-white leading-tight">Quick Bee</div>
            <div className="text-xs text-white/60 leading-tight">AI Growth Engine</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.map(group => {
          if (!isGroupVisible(group)) return null;
          const visibleItems = group.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedGroups[group.label] !== false;

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors"
              >
                <span>{group.label}</span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  {visibleItems.map(item => {
                    const isActive = currentPath === item.path ||
                      (item.path !== '/authenticated' && currentPath.startsWith(item.path));

                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate({ to: item.path })}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all',
                          isActive
                            ? 'bg-white/15 text-white border-l-2 border-primary font-medium'
                            : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
                        )}
                      >
                        <span className={cn(isActive ? 'text-primary' : 'text-white/50')}>
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{profile?.name || 'User'}</div>
            <div className="text-xs text-white/50 capitalize">{role || 'guest'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
