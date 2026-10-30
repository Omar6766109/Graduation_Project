import { SEVERITY_CONFIG } from '../../constants';
import type { SeverityCount } from '../../pages/Dashboard/mockData';
import { cn } from '../../utils';

interface SeverityDonutChartProps {
  data: SeverityCount[];
  className?: string;
}

// Map severity → Tailwind stroke color (inline SVG needs explicit colors)
const STROKE_COLORS: Record<string, string> = {
  critical: '#f87171', // red-400
  high:     '#fb923c', // orange-400
  medium:   '#facc15', // yellow-400
  low:      '#60a5fa', // blue-400
  info:     '#94a3b8', // slate-400
};

/**
 * SeverityDonutChart — SVG donut chart of alert counts by severity.
 * Uses no external charting library.
 */
export default function SeverityDonutChart({ data, className }: SeverityDonutChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  // Build donut segments
  const R = 60;        // outer radius
  const r = 38;        // inner radius (hole)
  const cx = 80;
  const cy = 80;
  const gap = 2;       // degrees gap between segments

  type Segment = {
    severity: string;
    count: number;
    startAngle: number;
    endAngle: number;
    color: string;
  };

  const segments: Segment[] = [];
  let currentAngle = -90; // start from top

  data.forEach((d) => {
    if (d.count === 0) return;
    const sweep = (d.count / total) * 360;
    segments.push({
      severity: d.severity,
      count: d.count,
      startAngle: currentAngle + gap / 2,
      endAngle: currentAngle + sweep - gap / 2,
      color: STROKE_COLORS[d.severity] ?? '#94a3b8',
    });
    currentAngle += sweep;
  });

  function polarToCartesian(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(seg: Segment): string {
    const start = polarToCartesian(seg.startAngle, R);
    const end   = polarToCartesian(seg.endAngle,   R);
    const iStart = polarToCartesian(seg.startAngle, r);
    const iEnd   = polarToCartesian(seg.endAngle,   r);
    const large = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

    return [
      `M ${start.x} ${start.y}`,
      `A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y}`,
      `L ${iEnd.x} ${iEnd.y}`,
      `A ${r} ${r} 0 ${large} 0 ${iStart.x} ${iStart.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-6', className)}>
      {/* SVG Donut */}
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={(R + r) / 2}
            fill="none"
            stroke="#1e293b"
            strokeWidth={R - r}
          />
          {/* Segments */}
          {total === 0 ? (
            <circle
              cx={cx} cy={cy} r={(R + r) / 2}
              fill="none"
              stroke="#334155"
              strokeWidth={R - r}
            />
          ) : (
            segments.map((seg) => (
              <path
                key={seg.severity}
                d={arcPath(seg)}
                fill={seg.color}
                opacity={0.9}
              >
                <title>{SEVERITY_CONFIG[seg.severity as keyof typeof SEVERITY_CONFIG]?.label ?? seg.severity}: {seg.count}</title>
              </path>
            ))
          )}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-100" fontSize="22" fontWeight="700" fontFamily="system-ui">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400" fontSize="10" fontFamily="system-ui">
            total
          </text>
        </svg>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-2 w-full">
        {data.map((d) => {
          const cfg = SEVERITY_CONFIG[d.severity as keyof typeof SEVERITY_CONFIG];
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <li key={d.severity} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: STROKE_COLORS[d.severity] }}
              />
              <span className="flex-1 text-xs text-slate-400">{cfg?.label ?? d.severity}</span>
              <span className="text-xs font-semibold text-slate-200 tabular-nums w-4 text-right">{d.count}</span>
              {/* Mini bar */}
              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: STROKE_COLORS[d.severity] }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
