import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyNotifications } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Bell, User, LogOut } from 'lucide-react';
import { useMarkNotificationAsRead } from '../../hooks/useQueries';

export default function TopNav() {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: notifications = [] } = useGetMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleMarkAsRead = async (id: bigint) => {
    await markAsRead.mutateAsync(id);
  };

  return (
    <header className="h-16 glass-panel border-b border-border flex items-center justify-between px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-black font-bold shadow-lg shadow-primary/50">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-panel border-border">
            <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-soft-gray">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id.toString()}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notif.isRead ? 'bg-secondary/30' : 'bg-primary/10 border border-primary/30'
                    }`}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-soft-gray mt-1">{notif.notificationType}</p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                <p className="text-xs text-soft-gray">{userProfile?.role || 'Client'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-border">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
