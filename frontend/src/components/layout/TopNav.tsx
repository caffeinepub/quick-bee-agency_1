import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, Search, Settings, ChevronDown } from 'lucide-react';
import { useGetCallerUserProfile, useGetCallerUserRole, useIsCallerAdmin, useGetMyNotifications } from '../../hooks/useQueries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export default function TopNav() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: notifications } = useGetMyNotifications();
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeClass = () => {
    if (isAdmin) return 'badge-primary';
    return 'badge-cyan';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin';
    const role = userRole as string | undefined;
    if (role === 'user') return 'Member';
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
                )}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map((notif) => (
                  <div
                    key={String(notif.id)}
                    className={`p-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/40 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => navigate({ to: '/authenticated/notifications' })}
                  >
                    <p className="text-xs text-foreground leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(Number(notif.createdAt) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
            <div className="p-2 border-t border-border">
              <button
                onClick={() => navigate({ to: '/authenticated/notifications' })}
                className="w-full text-xs text-primary hover:text-primary/80 font-medium py-1 transition-colors"
              >
                View all notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings (admin only) */}
        {isAdmin && (
          <button
            onClick={() => navigate({ to: '/authenticated/settings' })}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {userProfile?.name ? getInitials(userProfile.name) : '?'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {userProfile?.name || 'User'}
            </p>
            <p className={`text-xs px-1.5 py-0.5 rounded-full inline-block font-medium ${getRoleBadgeClass()}`}>
              {getRoleLabel()}
            </p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
