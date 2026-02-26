import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BootstrapErrorPanelProps {
  onRetry: () => void;
  errorType?: 'timeout' | 'connection';
}

export default function BootstrapErrorPanel({ onRetry, errorType = 'timeout' }: BootstrapErrorPanelProps) {
  const isTimeout = errorType === 'timeout';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 mesh-bg">
      <Card className="w-full max-w-md shadow-card-lg">
        <CardHeader className="text-center pb-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            isTimeout ? 'bg-warning/10' : 'bg-destructive/10'
          }`}>
            {isTimeout ? (
              <Clock size={24} className="text-warning" />
            ) : (
              <Wifi size={24} className="text-destructive" />
            )}
          </div>
          <CardTitle className="font-heading text-xl">
            {isTimeout ? 'Connection Timeout' : 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isTimeout
              ? 'The application is taking longer than expected to initialize. This may be due to network latency or the canister waking up.'
              : 'Unable to connect to the backend. Please check your internet connection and try again.'}
          </p>

          <div className="bg-muted/50 rounded-lg p-3 text-left space-y-1.5">
            <p className="text-xs font-semibold text-foreground">Troubleshooting tips:</p>
            {isTimeout ? (
              <>
                <p className="text-xs text-muted-foreground">• Wait a few seconds and retry — the canister may be waking up</p>
                <p className="text-xs text-muted-foreground">• Check your internet connection</p>
                <p className="text-xs text-muted-foreground">• Try refreshing the page</p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">• Verify your internet connection is active</p>
                <p className="text-xs text-muted-foreground">• Check if the ICP network is accessible</p>
                <p className="text-xs text-muted-foreground">• Try again in a few moments</p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onRetry}
              className="flex-1 gap-2"
            >
              <RefreshCw size={14} />
              Retry Connection
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 gap-2"
            >
              <AlertTriangle size={14} />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
