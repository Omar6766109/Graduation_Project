import type { TrendPoint } from '../../pages/Dashboard/mockData';
import { cn } from '../../utils';

interface ThreatTrendChartProps {
  data: TrendPoint[];
  className?: string;
}

const SERIES = [
  { key: 'critical' as const, color: '#f87171', label: 'Critical' },
  { key: 'high'     as const, color: '#fb923c', label: 'High'     },
  { key: 'medium'   as const, color: '#facc15', label: 'Medium'   },
];

const WIDTH  = 420;
const HEIGHT = 120;
const PAD_X  = 10;
const PAD_Y  = 14;

function buildPolyline(
  data: TrendPoint[],
  key: 'critical' | 'high' | 'medium',
  maxVal: number,
): string {
  const n = data.length;
  if (n === 0) return '';
  return data
    .map((d, i) => {
      const x = PAD_X + (i / (n - 1)) * (WIDTH - 2 * PAD_X);
      const y = PAD_Y + (1 - d[key] / maxVal) * (HEIGHT - 2 * PAD_Y);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * ThreatTrendLineChart — 7-day line chart for Critical / High / Medium alerts.
 * Pure SVG, no external library.
 */
export default function ThreatTrendChart({ data, className }: ThreatTrendChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.critical, d.high, d.medium]),
    1,
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Chart */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ height: HEIGHT }}
        preserveAspectRatio="none"
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD_Y + (1 - f) * (HEIGHT - 2 * PAD_Y);
          return (
            <line
              key={f}
              x1={PAD_X} y1={y} x2={WIDTH - PAD_X} y2={y}
              stroke="#1e293b"
              strokeWidth="1"
            />
          );
        })}

        {/* Polylines */}
        {SERIES.map((s) => (
          <polyline
            key={s.key}
            points={buildPolyline(data, s.key, maxVal)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.9"
          />
        ))}

        {/* Day labels */}
        {data.map((d, i) => {
          const x = PAD_X + (i / (data.length - 1)) * (WIDTH - 2 * PAD_X);
          return (
            <text
              key={i}
              x={x}
              y={HEIGHT - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#64748b"
              fontFamily="system-ui"
            >
              {d.day}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
