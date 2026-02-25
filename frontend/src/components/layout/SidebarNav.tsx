import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderKanban,
  Users,
  Activity,
  Zap,
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  Sparkles,
  Bell
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.admin, UserRole.user] },
  { path: '/services', label: 'Services', icon: ShoppingBag, roles: [UserRole.admin, UserRole.user] },
  { path: '/projects', label: 'Projects', icon: FolderKanban, roles: [UserRole.admin, UserRole.user] },
  { path: '/leads', label: 'Leads', icon: Users, roles: [UserRole.admin] },
  { path: '/crm', label: 'CRM Pipeline', icon: Activity, roles: [UserRole.admin] },
  { path: '/automation', label: 'Automation', icon: Zap, roles: [UserRole.admin] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: [UserRole.admin] },
  { path: '/payments', label: 'Payments', icon: CreditCard, roles: [UserRole.admin] },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: [UserRole.admin, UserRole.user] },
  { path: '/generators', label: 'Generators', icon: Sparkles, roles: [UserRole.admin] },
  { path: '/legal', label: 'Legal', icon: FileText, roles: [UserRole.admin, UserRole.user] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: [UserRole.admin] },
];

export default function SidebarNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: userRole } = useGetCallerUserRole();

  const currentPath = routerState.location.pathname;

  const filteredMenuItems = menuItems.filter(item =>
    userRole && item.roles.includes(userRole)
  );

  return (
    <div className="w-64 glass-panel border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold gradient-text">Quick Bee</h1>
        <p className="text-xs text-soft-gray mt-1">Agency OS</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'gradient-teal text-black font-semibold'
                  : 'text-soft-gray hover:bg-secondary/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-soft-gray text-center">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-soft-gray text-center mt-1">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
