import { useParams } from '@tanstack/react-router';
import { useGetProject } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const { data: project } = useGetProject(BigInt(projectId));

  if (!project) {
    return <div className="text-center text-soft-gray">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project #{project.id.toString()}</h1>
        <p className="text-soft-gray mt-1">Project details and status</p>
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
    </div>
  );
}
