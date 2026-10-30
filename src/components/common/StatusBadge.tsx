import { cn } from '../../utils';
import type {
  AlertStatus,
  ScanStatus,
  ComponentStatus,
  SecurityEventStatus,
  InvestigationStatus,
} from '../../types';

// ─── Combined union of all status types this badge handles ────────────────────

type AnyStatus =
  | AlertStatus
  | ScanStatus
  | ComponentStatus
  | SecurityEventStatus
  | InvestigationStatus;

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dot: string;
  pulse?: boolean;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Alert & Event statuses
  open:          { label: 'Open',          color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  acknowledged:  { label: 'Acknowledged',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   dot: 'bg-cyan-400' },
  investigating: { label: 'Investigating', color: 'text-purple-400', bg: 'bg-purple-500/10', dot: 'bg-purple-400', pulse: true },
  in_progress:   { label: 'In Progress',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   dot: 'bg-cyan-400', pulse: true },
  contained:     { label: 'Contained',     color: 'text-blue-400',   bg: 'bg-blue-500/10',   dot: 'bg-blue-400' },
  resolved:      { label: 'Resolved',      color: 'text-green-400',  bg: 'bg-green-500/10',  dot: 'bg-green-400' },
  closed:        { label: 'Closed',        color: 'text-slate-400',  bg: 'bg-slate-500/10',  dot: 'bg-slate-500' },
  dismissed:     { label: 'Dismissed',     color: 'text-slate-400',  bg: 'bg-slate-500/10',  dot: 'bg-slate-500' },
  // Scan statuses
  running:      { label: 'Running',      color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   dot: 'bg-cyan-400', pulse: true },
  completed:    { label: 'Completed',    color: 'text-green-400',  bg: 'bg-green-500/10',  dot: 'bg-green-400' },
  failed:       { label: 'Failed',       color: 'text-red-400',    bg: 'bg-red-500/10',    dot: 'bg-red-400' },
  queued:       { label: 'Queued',       color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  // System statuses
  operational:  { label: 'Operational',  color: 'text-green-400',  bg: 'bg-green-500/10',  dot: 'bg-green-400' },
  degraded:     { label: 'Degraded',     color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400', pulse: true },
  offline:      { label: 'Offline',      color: 'text-red-400',    bg: 'bg-red-500/10',    dot: 'bg-red-400' },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

/**
 * StatusBadge — colored pill with animated dot for all platform status types.
 */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? {
    label: status,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    dot: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold',
        cfg.bg,
        cfg.color,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {cfg.pulse && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-70', cfg.dot)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
}
