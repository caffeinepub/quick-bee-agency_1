import { useState } from 'react';
import { useGetMyNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export default function NotificationsPage() {
  const { data: notifications = [] } = useGetMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const handleMarkAsRead = async (id: bigint) => {
    try {
      await markAsRead.mutateAsync(id);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(
        unreadNotifications.map(n => markAsRead.mutateAsync(n.id))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.notificationType.includes('lead')) {
      navigate({ to: '/leads' });
    } else if (notification.notificationType.includes('payment')) {
      navigate({ to: '/payments' });
    }
  };

  const getNotificationTypeColor = (type: string) => {
    if (type.includes('qualified')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (type.includes('payment')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (type.includes('onboarding')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-secondary text-soft-gray border-border';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-soft-gray mt-1">View all your notifications and updates</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="border-border"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="space-y-4">
        <TabsList className="glass-panel border-border">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({notifications.filter(n => !n.isRead).length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({notifications.filter(n => n.isRead).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <Card className="glass-panel border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                {filter === 'all' ? 'All Notifications' : filter === 'unread' ? 'Unread Notifications' : 'Read Notifications'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <p className="text-soft-gray text-center py-8">No notifications</p>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id.toString()}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        !notif.isRead
                          ? 'bg-primary/5 border-primary/30 hover:bg-primary/10'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                            <Badge className={getNotificationTypeColor(notif.notificationType)}>
                              {notif.notificationType.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-foreground">{notif.message}</p>
                          <p className="text-xs text-soft-gray mt-2">
                            {new Date(Number(notif.createdAt) / 1000000).toLocaleString()}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
