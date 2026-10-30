import { useState } from 'react';
import {
  Search,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Crosshair,
  FlaskConical,
  Eye,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Server,
} from 'lucide-react';

import StatusBadge from '../../components/common/StatusBadge';
import ScanDetailPanel from './ScanDetailPanel';
import NewScanModal from './NewScanModal';
import { useScanFilters, type SortField } from './useScanFilters';
import { SCANS_MOCK_DATA } from './mockData';
import { SCAN_STATUS_CONFIG, SCAN_TYPE_CONFIG } from '../../constants';
import { cn, timeAgo } from '../../utils';
import type { Scan, ScanStatus, ScanType } from '../../types';

// ─── Sort icon helper ─────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown size={13} className="text-slate-600" />;
  return dir === 'asc' ? (
    <ChevronUp size={13} className="text-cyan-400" />
  ) : (
    <ChevronDown size={13} className="text-cyan-400" />
  );
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
        <SortIcon active={sortField === field} dir={sortDir} />
      </button>
    </th>
  );
}

// ─── Filter select options ────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: ScanStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'queued', label: 'Queued' },
];

const TYPE_OPTIONS: { value: ScanType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Scan Types' },
  { value: 'network_recon', label: 'Network Recon' },
  { value: 'vulnerability', label: 'Vulnerability Scan' },
  { value: 'web_app', label: 'Web Application' },
  { value: 'port_scan', label: 'Port Discovery' },
  { value: 'compliance', label: 'Compliance Audit' },
  { value: 'brute_force', label: 'Auth Stress Test' },
];

// ─── Scans / Red Team Page ────────────────────────────────────────────────────

export default function RedTeamPage() {
  const [scansList, setScansList] = useState<Scan[]>(SCANS_MOCK_DATA);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  } = useScanFilters(scansList);

  const hasActiveFilters =
    filters.search !== '' || filters.status !== 'all' || filters.scanType !== 'all';

  const startIdx = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalFiltered);

  // Summary Metrics
  const totalScans = scansList.length;
  const runningScans = scansList.filter((s) => s.status === 'running').length;
  const completedScans = scansList.filter((s) => s.status === 'completed').length;
  const totalFindings = scansList.reduce((acc, s) => acc + s.findingsCount, 0);

  function handleLaunchScan(newScan: Scan) {
    setScansList((prev) => [newScan, ...prev]);
    setSelectedScan(newScan);
  }

  return (
    <>
      <div className="space-y-6 max-w-screen-2xl mx-auto">
        {/* ── Simulated data notice ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
          <FlaskConical size={14} className="text-cyan-400 shrink-0" />
          <span>
            Red Team Scan operations are{' '}
            <span className="text-cyan-400 font-medium">academically simulated</span>
            {' '}— safe sandboxed execution for lab evaluation and reporting.
          </span>
        </div>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center cyber-glow-red shrink-0">
              <Crosshair size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Red Team Scan Results</h1>
              <p className="text-xs text-slate-500">
                Authorized reconnaissance, vulnerability enumeration, and attack surface assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <X size={12} />
                Clear filters
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus size={14} />
              New Scan
            </button>
          </div>
        </div>

        {/* ── Summary KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Scans</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{totalScans}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Server size={18} />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Running Scans</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{runningScans}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity size={18} className="animate-pulse" />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{completedScans}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Findings</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{totalFindings}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={18} />
            </div>
          </div>
        </div>

        {/* ── Filter Toolbar ────────────────────────────────────────────── */}
        <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <SlidersHorizontal size={14} className="text-slate-500 shrink-0" />

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name, target, or engine…"
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

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as ScanStatus | 'all')}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-colors cursor-pointer',
                'bg-slate-800 border-slate-700/60 text-slate-200',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30',
                filters.status !== 'all' && 'border-cyan-500/40 text-cyan-300',
              )}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={filters.scanType}
              onChange={(e) => updateFilter('scanType', e.target.value as ScanType | 'all')}
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-colors cursor-pointer',
                'bg-slate-800 border-slate-700/60 text-slate-200',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30',
                filters.scanType !== 'all' && 'border-cyan-500/40 text-cyan-300',
              )}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>

          {/* Active filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.status !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Status: {SCAN_STATUS_CONFIG[filters.status]?.label ?? filters.status}
                <button onClick={() => updateFilter('status', 'all')} aria-label="Remove status filter">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.scanType !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                Type: {SCAN_TYPE_CONFIG[filters.scanType]?.label ?? filters.scanType}
                <button onClick={() => updateFilter('scanType', 'all')} aria-label="Remove type filter">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* ── Scans Table ───────────────────────────────────────────────── */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/50">
                  <ColHeader
                    field="name"
                    label="Scan Name"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[240px]"
                  />
                  <th className="px-4 py-3 text-left w-36">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Type
                    </span>
                  </th>
                  <ColHeader
                    field="target"
                    label="Target"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[160px]"
                  />
                  <ColHeader
                    field="status"
                    label="Status"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-32"
                  />
                  <ColHeader
                    field="startedAt"
                    label="Started"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-32 hidden md:table-cell"
                  />
                  <th className="px-4 py-3 text-left w-28 hidden lg:table-cell">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Duration
                    </span>
                  </th>
                  <ColHeader
                    field="findingsCount"
                    label="Findings"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-28 text-center"
                  />
                  <th className="px-4 py-3 text-right w-20">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/30">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Search size={32} className="opacity-30" />
                        <p className="text-sm font-medium">No scans match your criteria</p>
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
                  paginated.map((scan) => {
                    const isSelected = selectedScan?.id === scan.id;
                    const typeCfg = scan.scanType ? SCAN_TYPE_CONFIG[scan.scanType] : null;

                    return (
                      <tr
                        key={scan.id}
                        onClick={() => setSelectedScan(isSelected ? null : scan)}
                        className={cn(
                          'group cursor-pointer transition-colors duration-100',
                          isSelected
                            ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500'
                            : 'hover:bg-slate-800/40',
                        )}
                      >
                        {/* Name & ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={cn(
                                'text-sm font-medium transition-colors',
                                isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-slate-100',
                              )}
                            >
                              {scan.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-500">{scan.id}</span>
                              {scan.scannerEngine && (
                                <span className="text-[10px] text-slate-600 truncate max-w-[140px]">
                                  • {scan.scannerEngine}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          {typeCfg ? (
                            <span
                              className={cn(
                                'inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-[130px]',
                                typeCfg.bg,
                                typeCfg.color,
                                typeCfg.border,
                              )}
                            >
                              {typeCfg.label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>

                        {/* Target */}
                        <td className="px-4 py-3.5">
                          <code className="text-xs font-mono text-cyan-300/90 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 truncate inline-block max-w-[200px]">
                            {scan.target}
                          </code>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={scan.status} />
                        </td>

                        {/* Started */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-400" title={scan.startedAt}>
                            {timeAgo(scan.startedAt)}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 font-mono">
                            {scan.duration ?? '—'}
                          </span>
                        </td>

                        {/* Findings */}
                        <td className="px-4 py-3.5 text-center">
                          {scan.findingsCount > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              {scan.findingsCount}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 font-medium">0</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScan(scan);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            aria-label={`View details for ${scan.name}`}
                          >
                            <Eye size={15} />
                          </button>
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
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="text-slate-300 font-medium">
                  {startIdx}–{endIdx}
                </span>{' '}
                of <span className="text-slate-300 font-medium">{totalFiltered}</span> scans
              </p>

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

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '…')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-600 text-xs">
                        …
                      </span>
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

        {/* ── Hint footer ──────────────────────────────────────────────── */}
        <p className="text-xs text-slate-600 text-center">
          Click any scan row to view findings & execution details · Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">
            Esc
          </kbd>{' '}
          to close the detail panel
        </p>
      </div>

      {/* ── Scan Detail Slide-in Panel ───────────────────────────────── */}
      <ScanDetailPanel scan={selectedScan} onClose={() => setSelectedScan(null)} />

      {/* ── New Scan Modal ───────────────────────────────────────────── */}
      <NewScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunchScan={handleLaunchScan}
      />
    </>
  );
}
