import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils';

export type TrendDirection = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  /** Accent color class, e.g. 'text-red-400' */
  accentColor: string;
  /** Background glow class, e.g. 'bg-red-500/10' */
  accentBg: string;
  /** Border accent, e.g. 'border-red-500/20' */
  accentBorder: string;
  /** Optional trend indicator */
  trend?: {
    direction: TrendDirection;
    label: string;
    /** Whether UP is bad (e.g. critical alerts going up is bad) */
    invertColors?: boolean;
  };
  className?: string;
}

/**
 * MetricCard — KPI tile used on Dashboard.
 * Shows icon + big number + optional trend arrow.
 */
export default function MetricCard({
  title,
  value,
  icon,
  accentColor,
  accentBg,
  accentBorder,
  trend,
  className,
}: MetricCardProps) {
  const trendColor = (() => {
    if (!trend) return '';
    const { direction, invertColors } = trend;
    if (direction === 'neutral') return 'text-slate-400';
    const isGood = invertColors ? direction === 'down' : direction === 'up';
    return isGood ? 'text-green-400' : 'text-red-400';
  })();

  const TrendIcon =
    !trend || trend.direction === 'neutral'
      ? Minus
      : trend.direction === 'up'
        ? TrendingUp
        : TrendingDown;

  return (
    <div
      className={cn(
        'relative glass-panel rounded-xl p-5 overflow-hidden',
        'hover:border-slate-600/60 transition-colors duration-200',
        className,
      )}
    >
      {/* Background accent orb */}
      <div
        className={cn(
          'absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none',
          accentBg,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
            accentBg,
            accentBorder,
          )}
        >
          <span className={accentColor}>{icon}</span>
        </div>

        {/* Trend */}
        {trend && (
          <span className={cn('flex items-center gap-1 text-xs font-medium mt-0.5', trendColor)}>
            <TrendIcon size={12} />
            {trend.label}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide uppercase">{title}</p>
      </div>
    </div>
  );
}
