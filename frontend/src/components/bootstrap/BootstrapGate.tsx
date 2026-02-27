import React from 'react';
import { useActor } from '../../hooks/useActor';
import { useBootstrapWatchdog } from '../../hooks/useBootstrapWatchdog';
import BootstrapErrorPanel from './BootstrapErrorPanel';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useRouterState } from '@tanstack/react-router';

interface BootstrapGateProps {
  children: React.ReactNode;
}

export default function BootstrapGate({ children }: BootstrapGateProps) {
  const { isFetching: actorFetching } = useActor();
  const { isInitializing, identity } = useInternetIdentity();
  const { hasTimedOut, reset } = useBootstrapWatchdog();
  const routerState = useRouterState();

  const currentPath = routerState.location.pathname;
  // Never block the login/root page — the sign-in button must always be accessible
  const isLoginPage = currentPath === '/' || currentPath === '/login' || currentPath.startsWith('/login');

  // Always pass through on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If user is not authenticated, pass through (they'll be redirected by the page itself)
  if (!identity) {
    return <>{children}</>;
  }

  // For authenticated users on protected routes, show loading/error states
  const isLoading = actorFetching || isInitializing;

  if (hasTimedOut) {
    return (
      <BootstrapErrorPanel
        onRetry={() => {
          reset();
          window.location.reload();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src="/assets/generated/quickbee-logo.dim_256x256.png"
              alt="QuickBee"
              className="w-16 h-16 rounded-2xl animate-pulse"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground font-semibold text-lg">Loading QuickBee...</p>
            <p className="text-muted-foreground text-sm">Connecting to the network</p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
