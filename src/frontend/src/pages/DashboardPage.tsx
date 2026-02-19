import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useGetProjectsByClient, useGetAllOrders, useGetCallerUserRole } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const [enableDataFetch, setEnableDataFetch] = useState(false);
  
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsByClient(identity?.getPrincipal() || null, enableDataFetch);
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders(enableDataFetch);

  // Enable data fetching after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableDataFetch(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';
  const isGuest = userRole === 'guest';

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.amount), 0);
  const activeProjects = projects.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userProfile?.name}!</h1>
        <p className="text-soft-gray mt-1">Here's what's happening with your agency today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-border hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">₹{(totalRevenue / 100).toLocaleString()}</div>
                <p className="text-xs text-soft-gray mt-1">+12% from last month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Active Projects</CardTitle>
            <BarChart3 className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{activeProjects}</div>
                <p className="text-xs text-soft-gray mt-1">Across all clients</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Total Orders</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{orders.length}</div>
                <p className="text-xs text-soft-gray mt-1">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-soft-gray">Conversion Rate</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24%</div>
            <p className="text-xs text-soft-gray mt-1">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {isGuest && (
        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-soft-gray">No projects yet. Browse our services to get started!</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id.toString()} className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">Project #{project.id.toString()}</p>
                        <p className="text-sm text-soft-gray mt-1">Status: {project.status}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
