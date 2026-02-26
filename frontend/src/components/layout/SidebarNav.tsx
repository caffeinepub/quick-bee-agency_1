import React, { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useGetCallerUserRole, useIsCallerAdmin } from '../../hooks/useQueries';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  CreditCard,
  BarChart3,
  Zap,
  Wand2,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  Download,
  ChevronDown,
  ChevronRight,
  Bot,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/authenticated', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Leads', path: '/authenticated/leads', icon: <UserCheck size={16} /> },
      { label: 'CRM Pipeline', path: '/authenticated/crm', icon: <Users size={16} /> },
      { label: 'Services', path: '/authenticated/services', icon: <Briefcase size={16} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Projects', path: '/authenticated/projects', icon: <FolderOpen size={16} /> },
      { label: 'Payments', path: '/authenticated/payments', icon: <CreditCard size={16} /> },
      { label: 'Invoices', path: '/authenticated/invoices', icon: <FileText size={16} /> },
      { label: 'Cart', path: '/authenticated/cart', icon: <ShoppingCart size={16} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', path: '/authenticated/analytics', icon: <BarChart3 size={16} /> },
      { label: 'AI Generators', path: '/authenticated/generators', icon: <Wand2 size={16} /> },
      { label: 'Automation', path: '/authenticated/automation', icon: <Zap size={16} /> },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Notifications', path: '/authenticated/notifications', icon: <Bell size={16} /> },
      { label: 'WhatsApp Logs', path: '/authenticated/whatsapp-logs', icon: <MessageSquare size={16} /> },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Data Export', path: '/authenticated/data-export', icon: <Download size={16} />, roles: ['admin'] },
      { label: 'Legal', path: '/authenticated/legal', icon: <FileText size={16} />, roles: ['admin'] },
      { label: 'Settings', path: '/authenticated/settings', icon: <Settings size={16} />, roles: ['admin'] },
    ],
  },
];

export default function SidebarNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const { data: isAdmin } = useIsCallerAdmin();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/authenticated') {
      return currentPath === '/authenticated' || currentPath === '/authenticated/';
    }
    return currentPath.startsWith(path);
  };

  const canSeeItem = (item: NavItem) => {
    if (!item.roles) return true;
    if (item.roles.includes('admin') && isAdmin) return true;
    return false;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-60 flex flex-col h-full sidebar-gradient border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl overflow-hidden logo-glow shrink-0">
          <img
            src="/assets/generated/quickbee-logo.dim_256x256.png"
            alt="QuickBee"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="text-sidebar-foreground font-heading font-bold text-base leading-tight">QuickBee</span>
          <p className="text-xs text-sidebar-foreground/50 leading-tight">Sales CRM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(canSeeItem);
          if (visibleItems.length === 0) return null;

          const isCollapsed = collapsedGroups.has(group.label);

          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
              >
                <span>{group.label}</span>
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 mt-0.5">
                  {visibleItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate({ to: item.path })}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive(item.path)
                          ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary pl-[10px]'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                    >
                      <span className={isActive(item.path) ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-sidebar-primary/20 text-sidebar-primary px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-sidebar-primary">
              {userProfile?.name ? getInitials(userProfile.name) : <Bot size={14} />}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {userProfile?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/40 truncate capitalize">
              {isAdmin ? 'Admin' : userRole || 'Member'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-destructive transition-colors p-1 rounded"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
