import { useEffect, useState } from 'react';
import { useGetAllOrders, useGetPaymentLinks, useGetAllLeads } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Edit } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import EditPaymentLinkDialog from '../components/leads/EditPaymentLinkDialog';
import type { PaymentLink } from '../backend';

export default function PaymentsPage() {
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders(enableFetch);
  const { data: paymentLinks = [], isLoading: linksLoading } = useGetPaymentLinks(enableFetch);
  const { data: leads = [], isLoading: leadsLoading } = useGetAllLeads(enableFetch);
  const [editingPaymentLink, setEditingPaymentLink] = useState<PaymentLink | null>(null);

  useEffect(() => {
    setEnableFetch(true);
  }, []);

  const getLeadName = (leadId: bigint) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name || 'Unknown Lead';
  };

  const isLoading = ordersLoading || linksLoading || leadsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments & Invoices</h1>
        <p className="text-soft-gray mt-1">View all payment transactions and links</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="glass-panel border-border">
          <TabsTrigger value="orders">Stripe Orders</TabsTrigger>
          <TabsTrigger value="razorpay">Razorpay Links</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="glass-panel border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Stripe Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-8 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-soft-gray text-center py-8">No orders yet</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">Order #{order.id.toString()}</p>
                            <p className="text-sm text-soft-gray mt-1">Project #{order.projectId.toString()}</p>
                            <p className="text-lg font-bold text-primary mt-2">₹{(Number(order.amount) / 100).toLocaleString()}</p>
                          </div>
                          <Badge variant={order.paymentStatus === 'Completed' ? 'default' : 'secondary'}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="razorpay">
          <Card className="glass-panel border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Razorpay Payment Links ({paymentLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-8 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentLinks.length === 0 ? (
                    <p className="text-soft-gray text-center py-8">No payment links yet</p>
                  ) : (
                    paymentLinks.map((link) => (
                      <div key={link.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{getLeadName(link.leadId)}</p>
                            <p className="text-sm text-soft-gray mt-1">Lead ID: {link.leadId.toString()}</p>
                            <p className="text-lg font-bold text-primary mt-2">₹{(Number(link.amount) / 100).toLocaleString()}</p>
                            <p className="text-xs text-soft-gray mt-1">
                              Created: {new Date(Number(link.createdAt) / 1000000).toLocaleDateString()}
                            </p>
                            {link.paymentLinkUrl && (
                              <p className="text-xs text-soft-gray mt-1 truncate">
                                Link: {link.paymentLinkUrl}
                              </p>
                            )}
                            {link.qrCodeDataUrl && (
                              <div className="mt-2">
                                <img 
                                  src={link.qrCodeDataUrl} 
                                  alt="Payment QR Code" 
                                  className="w-24 h-24 border border-border rounded"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge 
                              variant={
                                link.status === 'paid' ? 'default' : 
                                link.status === 'expired' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {link.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPaymentLink(link)}
                              className="border-border"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingPaymentLink && (
        <EditPaymentLinkDialog
          open={!!editingPaymentLink}
          onOpenChange={(open) => !open && setEditingPaymentLink(null)}
          paymentLink={editingPaymentLink}
        />
      )}
    </div>
  );
}
