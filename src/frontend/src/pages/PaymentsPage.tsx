import { useGetAllOrders, useGetPaymentLinks, useGetAllLeads } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function PaymentsPage() {
  const { data: orders = [] } = useGetAllOrders();
  const { data: paymentLinks = [] } = useGetPaymentLinks();
  const { data: leads = [] } = useGetAllLeads();

  const getLeadName = (leadId: bigint) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name || 'Unknown Lead';
  };

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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="razorpay">
          <Card className="glass-panel border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Razorpay Payment Links ({paymentLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentLinks.length === 0 ? (
                  <p className="text-soft-gray text-center py-8">No payment links yet</p>
                ) : (
                  paymentLinks.map((link) => (
                    <div key={link.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{getLeadName(link.leadId)}</p>
                          <p className="text-sm text-soft-gray mt-1">Lead ID: {link.leadId.toString()}</p>
                          <p className="text-lg font-bold text-primary mt-2">₹{(Number(link.amount) / 100).toLocaleString()}</p>
                          <p className="text-xs text-soft-gray mt-1">
                            Created: {new Date(Number(link.createdAt) / 1000000).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            link.status === 'paid' ? 'default' : 
                            link.status === 'expired' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {link.status}
                        </Badge>
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
