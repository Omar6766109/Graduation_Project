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
  Shield,
  FlaskConical,
  Eye,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Server,
  Pause,
  Play,
} from 'lucide-react';

import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import MetricCard from '../../components/common/MetricCard';
import EventDetailPanel from './EventDetailPanel';
import { useEventFilters, type SortField } from './useEventFilters';
import { EVENTS_MOCK_DATA } from './mockData';
import { ALERT_SOURCE_CONFIG, EVENT_TYPE_CONFIG } from '../../constants';
import { cn, timeAgo } from '../../utils';
import type {
  SecurityEvent,
  Severity,
  SecurityEventType,
  SecurityEventStatus,
} from '../../types';

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

const SEVERITY_OPTIONS: { value: Severity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'info', label: 'Info' },
];

const EVENT_TYPE_OPTIONS: { value: SecurityEventType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Event Types' },
  { value: 'brute_force', label: 'Brute Force' },
  { value: 'anomalous_traffic', label: 'Anomalous Traffic' },
  { value: 'privilege_escalation', label: 'Privilege Escalation' },
  { value: 'lateral_movement', label: 'Lateral Movement' },
  { value: 'malware', label: 'Malware / Ransomware' },
  { value: 'data_exfiltration', label: 'Data Exfiltration' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'network_scan', label: 'Network Scan' },
];

const STATUS_OPTIONS: { value: SecurityEventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'contained', label: 'Contained' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

// ─── Blue Team Monitoring Page ────────────────────────────────────────────────

export default function BlueTeamPage() {
  const [eventsList, setEventsList] = useState<SecurityEvent[]>(EVENTS_MOCK_DATA);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);

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
  } = useEventFilters(eventsList);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== 'all' ||
    filters.eventType !== 'all' ||
    filters.status !== 'all';

  const startIdx = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalFiltered);

  // Summary Metrics calculations
  const totalEvents = eventsList.length;
  const criticalHighEvents = eventsList.filter(
    (e) => e.severity === 'critical' || e.severity === 'high',
  ).length;
  const blockedCount = eventsList.filter(
    (e) => e.status === 'contained' || e.status === 'resolved',
  ).length;

  function handleUpdateStatus(eventId: string, newStatus: SecurityEventStatus) {
    setEventsList((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e)),
    );
    setSelectedEvent((prev) => (prev && prev.id === eventId ? { ...prev, status: newStatus } : prev));
  }

  return (
    <>
      <div className="space-y-6 max-w-screen-2xl mx-auto">
        {/* ── Simulated data notice ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
          <FlaskConical size={14} className="text-cyan-400 shrink-0" />
          <span>
            Blue Team Monitoring operations are{' '}
            <span className="text-cyan-400 font-medium">academically simulated</span>
            {' '}— telemetry events reflect lab sensors without live SIEM or physical tap connections.
          </span>
        </div>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center cyber-glow-blue shrink-0">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Blue Team Monitoring</h1>
              <p className="text-xs text-slate-500">
                Unified security telemetry, intrusion detection feeds, and defensive event correlation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Monitoring Status & Simulated Control */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                {isMonitoringActive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                )}
              </span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                {isMonitoringActive ? 'Sensors: Active' : 'Sensors: Paused'}
              </span>
              <button
                onClick={() => setIsMonitoringActive((prev) => !prev)}
                className="ml-1 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                aria-label={isMonitoringActive ? 'Pause simulated monitoring' : 'Resume simulated monitoring'}
                title="Toggles local frontend stream simulation"
              >
                {isMonitoringActive ? (
                  <>
                    <Pause size={10} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={10} />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>

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
        </div>

        {/* ── Summary Overview Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Events"
            value={totalEvents}
            icon={<Activity size={18} />}
            accentColor="text-blue-400"
            accentBg="bg-blue-500/10"
            accentBorder="border-blue-500/20"
            trend={{ direction: 'up', label: '+16 past 24h' }}
          />
          <MetricCard
            title="Critical & High"
            value={criticalHighEvents}
            icon={<ShieldAlert size={18} />}
            accentColor="text-red-400"
            accentBg="bg-red-500/10"
            accentBorder="border-red-500/20"
            trend={{ direction: 'up', label: '8 requiring review', invertColors: true }}
          />
          <MetricCard
            title="Monitored Assets"
            value={38}
            icon={<Server size={18} />}
            accentColor="text-cyan-400"
            accentBg="bg-cyan-500/10"
            accentBorder="border-cyan-500/20"
            trend={{ direction: 'neutral', label: '4 Subnets active' }}
          />
          <MetricCard
            title="Blocked Threats"
            value={blockedCount}
            icon={<CheckCircle2 size={18} />}
            accentColor="text-green-400"
            accentBg="bg-green-500/10"
            accentBorder="border-green-500/20"
            trend={{ direction: 'up', label: '+5 auto-mitigated' }}
          />
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
              placeholder="Search by ID, IP, asset, or type…"
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

          {/* Event Type filter */}
          <div className="relative">
            <select
              value={filters.eventType}
              onChange={(e) =>
                updateFilter('eventType', e.target.value as SecurityEventType | 'all')
              }
              className={cn(
                'appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border transition-colors cursor-pointer',
                'bg-slate-800 border-slate-700/60 text-slate-200',
                'focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30',
                filters.eventType !== 'all' && 'border-cyan-500/40 text-cyan-300',
              )}
            >
              {EVENT_TYPE_OPTIONS.map((o) => (
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

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                updateFilter('status', e.target.value as SecurityEventStatus | 'all')
              }
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

          {/* Active filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.severity !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                Severity: {filters.severity}
                <button onClick={() => updateFilter('severity', 'all')} aria-label="Remove severity filter">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.eventType !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Type: {EVENT_TYPE_CONFIG[filters.eventType]?.label ?? filters.eventType}
                <button onClick={() => updateFilter('eventType', 'all')} aria-label="Remove type filter">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                Status: {filters.status}
                <button onClick={() => updateFilter('status', 'all')} aria-label="Remove status filter">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* ── Security Events Table ─────────────────────────────────────── */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/50">
                  <ColHeader
                    field="title"
                    label="Event & ID"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[260px]"
                  />
                  <th className="px-4 py-3 text-left w-36">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Type
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[140px] hidden md:table-cell">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Source IP
                    </span>
                  </th>
                  <ColHeader
                    field="affectedAsset"
                    label="Destination / Asset"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="min-w-[180px]"
                  />
                  <ColHeader
                    field="severity"
                    label="Severity"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-28"
                  />
                  <th className="px-4 py-3 text-left w-24 hidden lg:table-cell">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Sensor
                    </span>
                  </th>
                  <ColHeader
                    field="timestamp"
                    label="Time"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-28 hidden sm:table-cell"
                  />
                  <ColHeader
                    field="status"
                    label="Status"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="w-32"
                  />
                  <th className="px-4 py-3 text-right w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/30">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Search size={32} className="opacity-30" />
                        <p className="text-sm font-medium">No security events match your criteria</p>
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
                  paginated.map((evt) => {
                    const isSelected = selectedEvent?.id === evt.id;
                    const typeCfg = EVENT_TYPE_CONFIG[evt.eventType];
                    const sourceCfg = ALERT_SOURCE_CONFIG[evt.source];

                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEvent(isSelected ? null : evt)}
                        className={cn(
                          'group cursor-pointer transition-colors duration-100',
                          isSelected
                            ? 'bg-blue-500/5 border-l-2 border-l-blue-400'
                            : 'hover:bg-slate-800/40',
                        )}
                      >
                        {/* Title & ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={cn(
                                'text-sm font-medium transition-colors',
                                isSelected
                                  ? 'text-cyan-300'
                                  : 'text-slate-200 group-hover:text-slate-100',
                              )}
                            >
                              {evt.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-500">{evt.id}</span>
                              {evt.protocol && (
                                <span className="text-[10px] text-slate-600 font-mono">
                                  • {evt.protocol}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Event Type */}
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

                        {/* Source IP */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <code className="text-xs font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60">
                            {evt.sourceIp}
                          </code>
                        </td>

                        {/* Destination / Asset */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                              {evt.affectedAsset}
                            </span>
                            <code className="text-[10px] font-mono text-slate-500">
                              {evt.destinationIp}
                            </code>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="px-4 py-3.5">
                          <SeverityBadge severity={evt.severity} />
                        </td>

                        {/* Sensor Source */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className={cn('text-xs font-medium', sourceCfg?.color)}>
                            {sourceCfg?.label ?? evt.source}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-xs text-slate-500" title={evt.timestamp}>
                            {timeAgo(evt.timestamp)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={evt.status} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(evt);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            aria-label={`View details for ${evt.id}`}
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
                of <span className="text-slate-300 font-medium">{totalFiltered}</span> events
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
          Click any event row to view forensic details & SOC playbooks · Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400">
            Esc
          </kbd>{' '}
          to close the detail panel
        </p>
      </div>

      {/* ── Event Detail Slide-in Panel ──────────────────────────────── */}
      <EventDetailPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
