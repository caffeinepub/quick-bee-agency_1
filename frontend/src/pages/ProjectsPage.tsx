import { useState, useEffect } from 'react';
import { useGetProjectsByClient, useGetAllServices } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export default function ProjectsPage() {
  const { identity } = useInternetIdentity();
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: projects = [], isLoading } = useGetProjectsByClient(identity?.getPrincipal() || null, enableFetch);
  const { data: services = [] } = useGetAllServices(enableFetch);

  // Enable fetching after component mounts
  useEffect(() => {
    setEnableFetch(true);
  }, []);

  const getServiceName = (serviceId: bigint) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || `Service #${serviceId.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <p className="text-soft-gray mt-1">View and manage your active projects</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-panel border-border">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="glass-panel border-border">
          <CardContent className="py-12 text-center">
            <p className="text-soft-gray">No projects yet. Browse our services to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id.toString()} className="glass-panel border-border hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-foreground">Project #{project.id.toString()}</CardTitle>
                  <Badge 
                    className={
                      project.status === 'Active' 
                        ? 'bg-primary/20 text-primary border-primary' 
                        : 'bg-secondary text-secondary-foreground'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-soft-gray">Service</p>
                  <p className="text-foreground font-medium">{getServiceName(project.serviceId)}</p>
                </div>
                <div>
                  <p className="text-sm text-soft-gray">Started</p>
                  <p className="text-foreground">
                    {new Date(Number(project.startTime) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
