import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AppShell — Root layout wrapper.
 *
 * Layout:
 * ┌─────────────┬──────────────────────────────┐
 * │             │  Topbar                      │
 * │  Sidebar    ├──────────────────────────────┤
 * │             │  <Outlet /> (page content)   │
 * └─────────────┴──────────────────────────────┘
 */
export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Subtle grid background */}
          <div
            className="min-h-full p-6"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.03) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(239, 68, 68, 0.03) 0%, transparent 60%),
                linear-gradient(rgba(148, 163, 184, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: 'auto, auto, 32px 32px, 32px 32px',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
