import { ReactNode } from 'react';
import { useBootstrapWatchdog } from '../../hooks/useBootstrapWatchdog';

interface BootstrapGateProps {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  children: ReactNode;
  fallback?: ReactNode;
  loadingPhase?: 'connecting' | 'authenticating' | 'loading-profile' | 'initializing';
}

export default function BootstrapGate({
  isLoading,
  hasError,
  errorMessage,
  onRetry,
  children,
  fallback,
  loadingPhase = 'connecting'
}: BootstrapGateProps) {
  const { hasTimedOut, reset } = useBootstrapWatchdog();

  const handleRetry = () => {
    reset();
    onRetry();
  };

  const getLoadingMessage = () => {
    switch (loadingPhase) {
      case 'connecting':
        return 'Connecting to backend...';
      case 'authenticating':
        return 'Authenticating...';
      case 'loading-profile':
        return 'Loading your profile...';
      case 'initializing':
        return 'Initializing services...';
      default:
        return 'Loading...';
    }
  };

  // Show error state if explicit error or timeout
  if (hasError || hasTimedOut) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    const displayError = hasTimedOut 
      ? 'Connection timeout. The backend is taking longer than expected to respond. Please check your network connection and try again.'
      : errorMessage || 'Unable to connect to the backend. Please check your connection and try again.';
    
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {hasTimedOut ? 'Connection Timeout' : 'Initialization Error'}
          </h2>
          <p className="text-soft-gray mb-6">
            {displayError}
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

  // Show loading state with progressive indicators
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#00C2A8] text-xl mb-2">{getLoadingMessage()}</div>
          <div className="text-soft-gray text-sm">Please wait...</div>
        </div>
      </div>
    );
  }

  // Render children when ready
  return <>{children}</>;
}
