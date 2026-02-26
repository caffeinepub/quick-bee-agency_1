import { useGetMyNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import type { Notification } from '../backend';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAsRead = async (id: bigint) => {
    try {
      await markAsRead.mutateAsync(id);
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (
      notification.notificationType === 'lead_qualified' ||
      notification.notificationType === 'payment_confirmed'
    ) {
      navigate({ to: '/leads' });
    } else if (notification.notificationType === 'onboarding_started') {
      navigate({ to: '/projects' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_qualified': return '🎯';
      case 'payment_confirmed': return '💰';
      case 'onboarding_started': return '🚀';
      default: return '📢';
    }
  };

  const renderNotificationList = (notificationList: Notification[]) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (notificationList.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {notificationList.map((notification) => (
          <div
            key={notification.id.toString()}
            onClick={() => handleNotificationClick(notification)}
            className="p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getNotificationIcon(notification.notificationType)}</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{notification.message}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {new Date(Number(notification.createdAt) / 1000000).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">New</Badge>
                )}
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated with your lead activities</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
              <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderNotificationList(notifications)}</TabsContent>
            <TabsContent value="unread">{renderNotificationList(unreadNotifications)}</TabsContent>
            <TabsContent value="read">{renderNotificationList(readNotifications)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
