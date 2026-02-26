import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  FolderOpen,
  Bell,
  Scale,
  GitBranch,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Services', path: '/services', icon: <ShoppingBag className="h-4 w-4" /> },
  { label: 'Leads', path: '/leads', icon: <Users className="h-4 w-4" />, roles: ['admin', 'user'] },
  { label: 'CRM', path: '/crm', icon: <GitBranch className="h-4 w-4" />, roles: ['admin', 'user'] },
  { label: 'Projects', path: '/projects', icon: <FolderOpen className="h-4 w-4" />, roles: ['admin', 'user'] },
  { label: 'Payments', path: '/payments', icon: <CreditCard className="h-4 w-4" />, roles: ['admin'] },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-4 w-4" />, roles: ['admin'] },
  { label: 'Automation', path: '/automation', icon: <Zap className="h-4 w-4" />, roles: ['admin', 'user'] },
  {
    label: 'Service Recommendation',
    path: '/service-recommendation',
    icon: <Sparkles className="h-4 w-4" />,
    roles: ['admin', 'user'],
    group: 'AI Sales Tools',
  },
  {
    label: 'Proposal Generator',
    path: '/proposal-generator',
    icon: <Wand2 className="h-4 w-4" />,
    roles: ['admin', 'user'],
    group: 'AI Sales Tools',
  },
  { label: 'Notifications', path: '/notifications', icon: <Bell className="h-4 w-4" />, roles: ['admin', 'user'] },
  { label: 'Legal', path: '/legal', icon: <Scale className="h-4 w-4" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" />, roles: ['admin'] },
];

export default function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();

  const currentPath = location.pathname;

  const isVisible = (item: NavItem): boolean => {
    if (!item.roles) return true;
    if (!identity) return false;
    const role = userRole ?? 'user';
    return item.roles.includes(role);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  // Group items
  const mainItems = navItems.filter((item) => !item.group && isVisible(item));
  const aiToolItems = navItems.filter((item) => item.group === 'AI Sales Tools' && isVisible(item));

  return (
    <nav className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">QuickBee</p>
            <p className="text-xs text-sidebar-foreground/60">Sales Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Main nav items */}
        {mainItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <span className={isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/60'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}

        {/* AI Sales Tools Group */}
        {aiToolItems.length > 0 && (
          <div className="pt-2">
            <p className="px-3 py-1 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
              AI Sales Tools
            </p>
            {aiToolItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate({ to: item.path })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <span className={isActive ? 'text-primary-foreground' : 'text-primary/70'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {identity && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150"
          >
            <LogOut className="h-4 w-4 text-sidebar-foreground/60" />
            Logout
          </button>
        )}
        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-foreground/30 text-center">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
}
