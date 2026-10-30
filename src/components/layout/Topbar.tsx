import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, UserCircle, Moon } from 'lucide-react';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../constants';

// ─── Derive page title from current route ──────────────────────────────────────

function usePageTitle(): string {
  const location = useLocation();
  const match = NAV_ITEMS.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  );
  return match?.label ?? 'Dashboard';
}

// ─── Mock alert count (replace with real hook later) ──────────────────────────

const MOCK_ALERT_COUNT = 7;

// ─── Topbar ────────────────────────────────────────────────────────────────────

export default function Topbar() {
  const { user, logout } = useAuth();
  const pageTitle = usePageTitle();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="flex items-center justify-between h-14 px-5 bg-slate-900/80 border-b border-slate-700/60 backdrop-blur-sm shrink-0">
      {/* ── Left: Page title ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Live indicator dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <h1 className="text-sm font-semibold text-slate-100">{pageTitle}</h1>
        <span className="hidden sm:block text-xs text-slate-600 font-mono">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>

      {/* ── Right: Actions ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Theme placeholder */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
          title="Dark mode (default)"
        >
          <Moon size={16} />
        </button>

        {/* Alert bell */}
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label={`${MOCK_ALERT_COUNT} unread alerts`}
        >
          <Bell size={16} />
          {MOCK_ALERT_COUNT > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {MOCK_ALERT_COUNT > 9 ? '9+' : MOCK_ALERT_COUNT}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-700" />

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
              'text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800',
              dropdownOpen && 'bg-slate-800',
            )}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar */}
            <span className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400">
              {user?.avatarInitials ?? '??'}
            </span>
            <span className="hidden sm:block max-w-[120px] truncate font-medium">
              {user?.name ?? 'Unknown'}
            </span>
            <ChevronDown
              size={14}
              className={cn('text-slate-500 transition-transform', dropdownOpen && 'rotate-180')}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 glass-panel rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-700/60">
                <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>

              {/* Menu items */}
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                <UserCircle size={15} className="text-slate-500" />
                Profile Settings
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
