import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Crosshair,
  Shield,
  Search,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, APP_NAME, APP_SUBTITLE } from '../../constants';
import type { NavItem } from '../../types';

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Bell,
  Crosshair,
  Shield,
  Search,
  FileBarChart,
  Settings,
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ─── NavItem Component ─────────────────────────────────────────────────────────

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const Icon = ICON_MAP[item.icon];

  // Hide items the current user's role doesn't have access to
  if (item.roles && !hasRole(item.roles)) return null;

  const isActive =
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:bg-slate-800/80 hover:text-slate-100',
        isActive
          ? 'bg-slate-800 text-slate-100 shadow-sm'
          : 'text-slate-400',
        collapsed && 'justify-center px-2',
      )}
    >
      {/* Active indicator stripe */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-r-full" />
      )}

      {Icon && (
        <Icon
          size={18}
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300',
          )}
        />
      )}

      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </NavLink>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-slate-900 border-r border-slate-700/60',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Logo / Brand ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-slate-700/60',
          collapsed && 'justify-center px-2',
        )}
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center cyber-glow-cyan">
          <ShieldAlert size={16} className="text-cyan-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">{APP_NAME}</p>
            <p className="text-[10px] text-slate-500 truncate">{APP_SUBTITLE}</p>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 relative">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-slate-700/60">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500',
            'hover:bg-slate-800 hover:text-slate-300 transition-colors',
            collapsed && 'justify-center px-2',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
