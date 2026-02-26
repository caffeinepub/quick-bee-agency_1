import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell, Search, ChevronDown, Check } from 'lucide-react';
import { useGetMyNotifications, useMarkNotificationAsRead } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function TopNav() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications = [] } = useGetMyNotifications();
  const { data: userProfile } = useGetCallerUserProfile();
  const markAsRead = useMarkNotificationAsRead();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (id: bigint, type: string) => {
    await markAsRead.mutateAsync(id);
    setShowNotifications(false);
    if (type === 'lead_qualified' || type === 'payment_confirmed') {
      navigate({ to: '/leads' });
    } else if (type === 'project_update') {
      navigate({ to: '/projects' });
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-brand text-dark-500 text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 glass-card rounded-2xl border border-border shadow-card z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-brand-400 font-medium">{unreadCount} unread</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {recentNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  recentNotifications.map(n => (
                    <button
                      key={n.id.toString()}
                      onClick={() => handleNotificationClick(n.id, n.notificationType)}
                      className={`w-full text-left px-4 py-3 hover:bg-brand-500/5 transition-colors border-b border-border/50 last:border-0 ${
                        !n.isRead ? 'bg-brand-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.isRead ? 'bg-muted-foreground/30' : 'bg-brand-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(Number(n.createdAt) / 1_000_000).toLocaleDateString()}
                          </p>
                        </div>
                        {n.isRead && <Check className="w-3 h-3 text-brand-400/60 flex-shrink-0 mt-1" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button
                  onClick={() => { setShowNotifications(false); navigate({ to: '/notifications' }); }}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border hover:border-brand-500/50 hover:bg-brand-500/5 transition-all">
          <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-xs font-bold text-dark-500">
              {userProfile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block max-w-24 truncate">
            {userProfile?.name ?? 'User'}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
