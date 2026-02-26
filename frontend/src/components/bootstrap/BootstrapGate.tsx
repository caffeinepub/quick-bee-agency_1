import React, { useEffect, useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import BootstrapErrorPanel from './BootstrapErrorPanel';
import { useBootstrapWatchdog } from '../../hooks/useBootstrapWatchdog';
import { Loader2 } from 'lucide-react';

interface BootstrapGateProps {
  children: React.ReactNode;
}

type Phase = 'connecting' | 'authenticating' | 'loading-profile' | 'initializing' | 'ready';

export default function BootstrapGate({ children }: BootstrapGateProps) {
  const { isFetching: actorFetching, actor } = useActor();
  const { isInitializing, identity } = useInternetIdentity();
  const [phase, setPhase] = useState<Phase>('connecting');
  const { hasTimedOut, reset } = useBootstrapWatchdog();

  const isLoading = actorFetching || isInitializing || !actor;

  useEffect(() => {
    if (isInitializing) {
      setPhase('authenticating');
    } else if (actorFetching) {
      setPhase('initializing');
    } else if (actor) {
      setPhase('ready');
    } else {
      setPhase('connecting');
    }
  }, [isInitializing, actorFetching, actor]);

  if (hasTimedOut && isLoading) {
    return <BootstrapErrorPanel onRetry={reset} errorType="timeout" />;
  }

  if (isLoading) {
    const phaseLabels: Record<Phase, string> = {
      connecting: 'Connecting to network...',
      authenticating: 'Authenticating...',
      'loading-profile': 'Loading profile...',
      initializing: 'Initializing...',
      ready: 'Ready',
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center mesh-bg">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-2 logo-glow">
            <img
              src="/assets/generated/quickbee-logo.dim_256x256.png"
              alt="QuickBee"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span className="text-sm font-medium">{phaseLabels[phase]}</span>
          </div>
          <div className="flex gap-1 justify-center">
            {(['connecting', 'authenticating', 'initializing', 'ready'] as Phase[]).map((p, i) => (
              <div
                key={p}
                className={`h-1 rounded-full transition-all duration-300 ${
                  (['connecting', 'authenticating', 'initializing', 'ready'] as Phase[]).indexOf(phase) >= i
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
