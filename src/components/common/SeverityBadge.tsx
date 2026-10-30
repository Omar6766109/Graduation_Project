import { SEVERITY_CONFIG } from '../../constants';
import type { Severity } from '../../types';
import { cn } from '../../utils';

interface SeverityBadgeProps {
  severity: Severity;
  /** Show a small leading dot indicator */
  dot?: boolean;
  className?: string;
}

/**
 * SeverityBadge — colored pill for Critical / High / Medium / Low / Info.
 * Reads from SEVERITY_CONFIG so colors are always consistent.
 */
export default function SeverityBadge({ severity, dot = false, className }: SeverityBadgeProps) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border',
        cfg.bg,
        cfg.color,
        cfg.border,
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.color.replace('text-', 'bg-'))} />
      )}
      {cfg.label}
    </span>
  );
}
