import React, { useState } from 'react';
import { useGetMyNotifications, useMarkNotificationRead } from '../hooks/useQueries';
import type { Notification } from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';

function NotificationIcon({ type }: { type: string }) {
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  if (type === 'success') return <CheckCircle className="w-4 h-4 text-green-400" />;
  return <Info className="w-4 h-4 text-primary" />;
}

function NotificationItem({ notification, onMarkRead }: { notification: Notification; onMarkRead: (id: bigint) => void }) {
  return (
    <div className={cn(
      'card-glass rounded-xl p-4 flex items-start gap-3 transition-all',
      !notification.isRead && 'border-primary/30 bg-primary/5'
    )}>
      <div className="mt-0.5 flex-shrink-0">
        <NotificationIcon type={notification.notificationType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', notification.isRead ? 'text-muted-foreground' : 'text-foreground')}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(Number(notification.createdAt) / 1_000_000).toLocaleString()}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMarkRead(notification.id)}
          className="h-7 px-2 text-xs text-primary hover:bg-primary/10 flex-shrink-0"
        >
          <CheckCheck className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();
  const [tab, setTab] = useState('all');

  const unread = notifications.filter(n => !n.isRead);
  const read = notifications.filter(n => n.isRead);

  const displayed = tab === 'all' ? notifications : tab === 'unread' ? unread : read;

  const handleMarkRead = (id: bigint) => {
    markRead.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading text-foreground">Notifications</h1>
          {unread.length > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {unread.length} unread
            </Badge>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/50 border border-border mb-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Unread ({unread.length})
            </TabsTrigger>
            <TabsTrigger value="read" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Read ({read.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card-glass rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayed.map(n => (
                  <NotificationItem key={Number(n.id)} notification={n} onMarkRead={handleMarkRead} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
