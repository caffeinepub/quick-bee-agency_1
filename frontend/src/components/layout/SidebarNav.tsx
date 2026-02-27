import React, { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import {
  LayoutDashboard, Users, Briefcase, ShoppingCart, BarChart3,
  Settings, LogOut, ChevronDown, ChevronRight, Zap, FileText,
  CreditCard, MessageSquare, Package, Scale, Bell, Download,
  Receipt, Bot, Activity, Webhook
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', path: '/authenticated', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Analytics', path: '/authenticated/analytics', icon: <BarChart3 className="h-4 w-4" />, adminOnly: true },
      { label: 'Admin Dashboard', path: '/authenticated/admin-dashboard', icon: <LayoutDashboard className="h-4 w-4" />, adminOnly: true },
    ],
  },
  {
    label: 'Sales',
    defaultOpen: true,
    items: [
      { label: 'Leads', path: '/authenticated/leads', icon: <Users className="h-4 w-4" /> },
      { label: 'CRM Pipeline', path: '/authenticated/crm', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Payment Links', path: '/authenticated/payments', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Invoices', path: '/authenticated/invoices', icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    label: 'AI Tools',
    defaultOpen: false,
    items: [
      { label: 'AI Generators', path: '/authenticated/generators', icon: <Bot className="h-4 w-4" /> },
      { label: 'Service Recommender', path: '/authenticated/generators/service-recommendation', icon: <Package className="h-4 w-4" /> },
      { label: 'Proposal Generator', path: '/authenticated/generators/proposal-generator', icon: <FileText className="h-4 w-4" /> },
      { label: 'Pricing Strategy', path: '/authenticated/generators/pricing-strategy', icon: <BarChart3 className="h-4 w-4" /> },
      { label: 'Closing Scripts', path: '/authenticated/generators/closing-scripts', icon: <MessageSquare className="h-4 w-4" /> },
      { label: 'Follow-Up Messages', path: '/authenticated/generators/follow-up', icon: <MessageSquare className="h-4 w-4" /> },
      { label: 'Lead Qualification', path: '/authenticated/generators/lead-qualification', icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Automation',
    defaultOpen: false,
    items: [
      { label: 'Automation Center', path: '/authenticated/automation', icon: <Zap className="h-4 w-4" /> },
      { label: 'WhatsApp Logs', path: '/authenticated/whatsapp-logs', icon: <MessageSquare className="h-4 w-4" />, adminOnly: true },
      { label: 'Webhook Logs', path: '/authenticated/webhook-logs', icon: <Activity className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Catalog',
    defaultOpen: false,
    items: [
      { label: 'Services', path: '/authenticated/services', icon: <Package className="h-4 w-4" /> },
      { label: 'Projects', path: '/authenticated/projects', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Cart', path: '/authenticated/cart', icon: <ShoppingCart className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Settings',
    defaultOpen: false,
    items: [
      { label: 'Settings', path: '/authenticated/settings', icon: <Settings className="h-4 w-4" />, adminOnly: true },
      { label: 'Sales System Config', path: '/authenticated/settings/sales-system-config', icon: <Webhook className="h-4 w-4" /> },
      { label: 'Notifications', path: '/authenticated/notifications', icon: <Bell className="h-4 w-4" /> },
      { label: 'Legal Pages', path: '/authenticated/legal', icon: <Scale className="h-4 w-4" />, adminOnly: true },
      { label: 'Data Export', path: '/authenticated/data-export', icon: <Download className="h-4 w-4" />, adminOnly: true },
    ],
  },
];

export default function SidebarNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === 'admin';

  const currentPath = routerState.location.pathname;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => { initial[g.label] = g.defaultOpen ?? false; });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const isActive = (path: string) => {
    if (path === '/authenticated') return currentPath === '/authenticated';
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <img src="/assets/generated/quickbee-logo.dim_256x256.png" alt="QuickBee" className="h-8 w-8 rounded-lg" />
        <div>
          <span className="font-bold text-base text-sidebar-foreground">QuickBee</span>
          <p className="text-xs text-sidebar-foreground/60">Sales Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
              >
                <span>{group.label}</span>
                {openGroups[group.label]
                  ? <ChevronDown className="h-3 w-3" />
                  : <ChevronRight className="h-3 w-3" />
                }
              </button>

              {openGroups[group.label] && (
                <div className="mt-0.5 space-y-0.5">
                  {visibleItems.map(item => (
                    <button
                      key={item.path}
                      onClick={() => navigate({ to: item.path })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left
                        ${isActive(item.path)
                          ? 'bg-primary/15 text-primary font-medium border-l-2 border-primary pl-[10px]'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }`}
                    >
                      <span className={isActive(item.path) ? 'text-primary' : 'text-sidebar-foreground/50'}>
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">{item.badge}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {identity?.getPrincipal().toString().slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {identity?.getPrincipal().toString().slice(0, 12) ?? 'User'}...
            </p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{userRole ?? 'user'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
