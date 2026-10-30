import { Navigate, type RouteObject } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../pages/Dashboard';
import AlertsPage from '../pages/Alerts';
import RedTeamPage from '../pages/RedTeam';
import BlueTeamPage from '../pages/BlueTeam';
import InvestigationPage from '../pages/Investigation';
import type { UserRole } from '../types';

// ─── Placeholder page factory ──────────────────────────────────────────────────
// These will be replaced with real pages in subsequent phases.

function PlaceholderPage({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${color}`}
      >
        {title[0]}
      </div>
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      <p className="text-slate-400 text-sm">This page will be built in the next phase.</p>
    </div>
  );
}

// ─── Route Guard ───────────────────────────────────────────────────────────────

// NOTE: Full role-based guards will be wired once real AuthContext is integrated.
// For now all routes are accessible (user is mocked as admin).
export type { UserRole };

// ─── Route Definitions ────────────────────────────────────────────────────────

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'red-team',
        element: <RedTeamPage />,
      },
      {
        path: 'scans',
        element: <Navigate to="/red-team" replace />,
      },
      {
        path: 'blue-team',
        element: <BlueTeamPage />,
      },
      {
        path: 'investigation',
        element: <InvestigationPage />,
      },
      {
        path: 'reports',
        element: <PlaceholderPage title="Reports" color="bg-green-500/20 text-green-400" />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage title="Settings" color="bg-slate-500/20 text-slate-400" />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];
