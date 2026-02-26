import { useParams } from '@tanstack/react-router';
import { useGetProject } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/authenticated/projects/$projectId' });
  const { data: project } = useGetProject(BigInt(projectId));

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Project #{project.id.toString()}
        </h1>
        <p className="text-muted-foreground mt-1">Project details and status</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Project ID</span>
              <span className="text-foreground font-semibold">#{project.id.toString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground font-semibold">{project.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Service ID</span>
              <span className="text-foreground">{project.serviceId.toString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Started</span>
              <span className="text-foreground">
                {new Date(Number(project.startTime) / 1000000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
