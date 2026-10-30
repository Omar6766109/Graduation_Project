import { useState } from 'react';
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Bell,
  FlaskConical,
} from 'lucide-react';

import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import AlertDetailPanel from './AlertDetailPanel';
import { useAlertFilters } from './useAlertFilters';
import { ALERTS_MOCK_DATA } from './mockData';
import { ALERT_SOURCE_CONFIG, SEVERITY_CONFIG } from '../../constants';
import { cn, timeAgo } from '../../utils';
import type { Alert, Severity, AlertStatus } from '../../types';
import type { SortField } from './useAlertFilters';

// ─── Sort icon helper ─────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { field: SortField; active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown size={13} className="text-slate-600" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-cyan-400" />
    : <ChevronDown size={13} className="text-cyan-400" />;
}

// ─── Column header button ─────────────────────────────────────────────────────

function ColHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
  className?: string;
}) {
  return (
    <th className={cn('px-4 py-3 text-left', className)}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors"
      >
        {label}
        <SortIcon field={field} active={sortField === field} dir={sortDir} />
      </button>
    </th>
  );
}

// ─── Severity options ─────────────────────────────────────────────────────────

const SEVERITY_OPTIONS: { value: Severity | 'all'; label: string }[] = [
  { value: 'all',      label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
  { value: 'info',     label: 'Info' },
];

const STATUS_OPTIONS: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All Statuses' },
  { value: 'open',         label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved',     label: 'Resolved' },
  { value: 'dismissed',    label: 'Dismissed' },
];

// ─── Alerts page ──────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const {
    filters,
    updateFilter,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    pageSize,
    paginated,
  } = useAlertFilters(ALERTS_MOCK_DATA);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== 'all' ||
    filters.status !== 'all';

  const startIdx = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx   = Math.min(page * pageSize, totalFiltered);

  return (
    <>
      <div className="space-y-5 max-w-screen-2xl mx-auto">

        {/* ── Simulated data notice ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
          <FlaskConical size={14} className="text-cyan-400 shrink-0" />
          <span>
            All alert data is{' '}
            <span className="text-cyan-400 font-medium">simulated mock data</span>
            {' '}— no live SIEM, IDS, or backend is connected.
          </span>
        </div>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Bell size={16} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Security Alerts</h1>
              <p className="text-xs text-slate-500">
                {totalFiltered} of {ALERTS_MOCK_DATA.length} alerts
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>

          {/* Filter summary chips */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        {/* ── Filter toolbar ────────────────────────────────────────────── */}
        <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <SlidersHorizontal size={14} className="text-slate-500 shrink-0" />

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, source, or host…"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className={cn(
                'w-full pl-8 pr-8 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700/60',
                'text-slate-200 placeholder-slate-500',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors',
              )}
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Severity filter */}
          <div className="relative">
            <select
              value={filters.severity}
              onChange={(e) => updateFilter('severity', e.target.value as Severity | 'all')}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-colors cursor-pointer',
                'bg-slate-800 border-slate-700/60 text-slate-200',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30',
                filters.severity !== 'all' && 'border-cyan-500/40 text-cyan-300',
              )}
            >
              {SEVERITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as AlertStatus | 'all')}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-colors cursor-pointer',
                'bg-slate-800 border-slate-700/60 text-slate-200',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30',
                filters.status !== 'all' && 'border-cyan-500/40 text-cyan-300',
              )}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Active filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.severity !== 'all' && (
              <span className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border font-medium',
                SEVERITY_CONFIG[filters.severity].bg,
                SEVERITY_CONFIG[filters.severity].color,
                SEVERITY_CONFIG[filters.severity].border,
              )}>
                {SEVERITY_CONFIG[filters.severity].label}
                <button onClick={() => updateFilter('severity', 'all')} aria-label="Remove severity filter">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                {STATUS_OPTIONS.find(o => o.value === filters.status)?.label}
                <button onClick={() => updateFilter('status', 'all')} aria-label="Remove status filter">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* ── Alerts table ──────────────────────────────────────────────── */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/50">
                  <ColHeader
                    field="title"
                    label="Alert"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[260px]"
                  />
                  <ColHeader
                    field="severity"
                    label="Severity"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-28"
                  />
                  <th className="px-4 py-3 text-left w-28">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Source</span>
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Host</span>
                  </th>
                  <ColHeader
                    field="timestamp"
                    label="Time"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-32 hidden lg:table-cell"
                  />
                  <ColHeader
                    field="status"
                    label="Status"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-36"
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/30">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Search size={32} className="opacity-30" />
                        <p className="text-sm font-medium">No alerts match your filters</p>
                        <button
                          onClick={resetFilters}
                          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((alert) => {
                    const srcCfg = ALERT_SOURCE_CONFIG[alert.source];
                    const isSelected = selectedAlert?.id === alert.id;
                    return (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlert(isSelected ? null : alert)}
                        className={cn(
                          'group cursor-pointer transition-colors duration-100',
                          isSelected
                            ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500'
                            : 'hover:bg-slate-800/40',
                        )}
                      >
                        {/* Alert title + ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className={cn(
                              'text-sm font-medium transition-colors',
                              isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-slate-100',
                            )}>
                              {alert.title}
                            </span>
                            <span className="text-[11px] font-mono text-slate-600">{alert.id}</span>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="px-4 py-3.5">
                          <SeverityBadge severity={alert.severity} />
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3.5">
                          <span className={cn('text-xs font-medium', srcCfg.color)}>
                            {srcCfg.label}
                          </span>
                        </td>

                        {/* Host */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <code className="text-[11px] font-mono text-slate-400">
                            {alert.affectedHost ?? '—'}
                          </code>
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-500" title={alert.timestamp}>
                            {timeAgo(alert.timestamp)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={alert.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalFiltered > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-800/30 flex-wrap gap-3">
              {/* Count info */}
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="text-slate-300 font-medium">{startIdx}–{endIdx}</span>
                {' '}of{' '}
                <span className="text-slate-300 font-medium">{totalFiltered}</span>
                {' '}alerts
              </p>

              {/* Page controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page number pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '…')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          'w-7 h-7 rounded text-xs font-medium transition-colors',
                          page === p
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700',
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Click-to-open hint ────────────────────────────────────────── */}
        <p className="text-xs text-slate-600 text-center">
          Click any row to view full alert details · Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">Esc</kbd>
          {' '}to close the detail panel
        </p>
      </div>

      {/* ── Detail panel (rendered outside table so it can overlay) ──────── */}
      <AlertDetailPanel
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </>
  );
}
