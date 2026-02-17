import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-soft-gray mt-1">Track your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹2,45,000</div>
            <p className="text-xs text-soft-gray mt-1">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Active Clients</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">42</div>
            <p className="text-xs text-soft-gray mt-1">+5 new this month</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Conversion Rate</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24%</div>
            <p className="text-xs text-soft-gray mt-1">+3% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Top Service</CardTitle>
            <BarChart3 className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">Website Dev</div>
            <p className="text-xs text-soft-gray mt-1">28 orders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
