import { ReactNode } from 'react';
import { useBootstrapWatchdog } from '../../hooks/useBootstrapWatchdog';

interface BootstrapGateProps {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function BootstrapGate({
  isLoading,
  hasError,
  errorMessage,
  onRetry,
  children,
  fallback
}: BootstrapGateProps) {
  const { hasTimedOut, reset } = useBootstrapWatchdog();

  const handleRetry = () => {
    reset();
    onRetry();
  };

  // Show error state if explicit error or timeout
  if (hasError || hasTimedOut) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {hasTimedOut ? 'Connection Timeout' : 'Initialization Error'}
          </h2>
          <p className="text-soft-gray mb-6">
            {errorMessage || 'Unable to connect to the backend. Please check your connection and try again.'}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 gradient-teal-glow text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#00C2A8] text-xl mb-4">Loading...</div>
          <div className="text-soft-gray text-sm">Connecting to backend...</div>
        </div>
      </div>
    );
  }

  // Render children when ready
  return <>{children}</>;
}
