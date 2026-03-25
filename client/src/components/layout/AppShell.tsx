import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-[hsl(var(--muted))]/30 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
