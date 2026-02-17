import { useGetAllOrders } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function PaymentsPage() {
  const { data: orders = [] } = useGetAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments & Invoices</h1>
        <p className="text-soft-gray mt-1">View all payment transactions</p>
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Orders ({orders.length})</CardTitle>
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
                    <span className={`px-3 py-1 text-xs rounded-full border ${
                      order.paymentStatus === 'Completed'
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-secondary text-soft-gray border-border'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
