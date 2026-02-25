import { ReactNode } from 'react';
import SidebarNav from './SidebarNav';
import TopNav from './TopNav';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src="/assets/generated/quickbee-bg-mesh.dim_1920x1080.png" alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="relative z-10 flex h-screen">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
