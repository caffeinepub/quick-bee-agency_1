import React from 'react';

interface BootstrapGateProps {
  children: React.ReactNode;
}

export default function BootstrapGate({ children }: BootstrapGateProps) {
  // Always render children immediately — no auth or actor checks
  return <>{children}</>;
}
