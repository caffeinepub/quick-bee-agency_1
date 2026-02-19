import { useState, useEffect } from 'react';
import { useGetProjectsByClient } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

export default function ProjectsPage() {
  const { identity } = useInternetIdentity();
  const [enableFetch, setEnableFetch] = useState(false);
  const { data: projects = [], isLoading } = useGetProjectsByClient(identity?.getPrincipal() || null, enableFetch);

  // Enable fetching after component mounts
  useEffect(() => {
    setEnableFetch(true);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <p className="text-soft-gray mt-1">Track your active projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : projects.length === 0 ? (
          <Card className="glass-panel border-border col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-soft-gray">No projects yet. Purchase a service to get started!</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id.toString()} className="glass-panel border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project #{project.id.toString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Status:</span>
                    <span className="text-foreground font-semibold">{project.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Service ID:</span>
                    <span className="text-foreground">{project.serviceId.toString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
