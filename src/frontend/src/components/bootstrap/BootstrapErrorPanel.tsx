import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BootstrapErrorPanelProps {
  error?: string;
  onRetry: () => void;
  context?: 'login' | 'app';
}

export default function BootstrapErrorPanel({ error, onRetry, context = 'login' }: BootstrapErrorPanelProps) {
  const isLoginContext = context === 'login';

  if (isLoginContext) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Initialization Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            {error || 'Unable to connect to the backend. Please check your connection and try again.'}
          </p>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="bg-background hover:bg-accent"
          >
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Connection Error</h2>
        <p className="text-soft-gray mb-6">
          {error || 'Unable to connect to the backend. Please check your connection and try again.'}
        </p>
        <Button
          onClick={onRetry}
          className="gradient-teal-glow text-black font-semibold hover:scale-105 transition-transform duration-300"
        >
          Retry Connection
        </Button>
      </div>
    </div>
  );
}
