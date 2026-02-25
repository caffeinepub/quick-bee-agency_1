import { useState } from 'react';
import { useGetCallerUserRole, useGetMyNotifications, useMarkNotificationAsRead } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Bell, User, LogOut } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNavigate } from '@tanstack/react-router';

export default function TopNav() {
  const { data: userRole } = useGetCallerUserRole();
  const { data: notifications = [] } = useGetMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }
    setNotifOpen(false);
    
    // Navigate to relevant page based on notification type
    if (notification.notificationType.includes('lead')) {
      navigate({ to: '/leads' });
    } else if (notification.notificationType.includes('payment')) {
      navigate({ to: '/payments' });
    }
  };

  return (
    <div className="h-16 glass-panel border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold gradient-text">Quick Bee Agency OS</h2>
      </div>

      <div className="flex items-center gap-4">
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-panel border-border w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-soft-gray">{unreadCount} unread</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-soft-gray text-center py-8 text-sm">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id.toString()}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-secondary/30 transition-colors ${
                      !notif.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-soft-gray mt-1">
                          {new Date(Number(notif.createdAt) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate({ to: '/notifications' });
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-border">
            <DropdownMenuLabel className="text-foreground">
              Role: {userRole || 'Loading...'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
