import { Link, useLocation } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { LayoutDashboard, Users, ShoppingBag, Briefcase, Zap, BarChart3, CreditCard, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Client'] },
  { path: '/leads', label: 'Leads', icon: Users, roles: ['Admin', 'Manager'] },
  { path: '/services', label: 'Services', icon: ShoppingBag, roles: ['Admin', 'Manager', 'Client'] },
  { path: '/crm', label: 'CRM', icon: Briefcase, roles: ['Admin', 'Manager'] },
  { path: '/automation', label: 'Automation', icon: Zap, roles: ['Admin', 'Manager'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['Admin', 'Manager'] },
  { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['Admin', 'Manager', 'Client'] },
  { path: '/legal', label: 'Legal', icon: FileText, roles: ['Admin', 'Manager', 'Client'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
];

export default function SidebarNav() {
  const location = useLocation();
  const { data: userProfile } = useGetCallerUserProfile();

  const userRole = userProfile?.role || 'Client';

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 glass-panel border-r border-border shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#00C2A8]">Quick Bee</h1>
        <p className="text-xs text-soft-gray">Agency Platform</p>
      </div>

      <nav className="px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-soft-gray hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
