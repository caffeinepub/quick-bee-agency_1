import React from 'react';
import { SidebarNav } from './SidebarNav';
import TopNav from './TopNav';

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top navigation */}
        <TopNav />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background mesh-bg">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
