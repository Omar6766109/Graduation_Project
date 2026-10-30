import {
  Bell,
  Crosshair,
  Activity,
  Server,
  ArrowRight,
  FlaskConical,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import MetricCard from '../../components/common/MetricCard';
import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import SeverityDonutChart from '../../components/charts/SeverityDonutChart';
import ThreatTrendChart from '../../components/charts/ThreatTrendChart';
import { cn } from '../../utils';
import { timeAgo } from '../../utils';
import { ALERT_SOURCE_CONFIG, SCAN_STATUS_CONFIG } from '../../constants';

import {
  MOCK_ALERTS,
  MOCK_SCANS,
  MOCK_METRICS,
  MOCK_SYSTEM_STATUS,
  MOCK_TREND,
  SCAN_TYPE_LABELS,
  getSeverityDistribution,
} from './mockData';
import type { SystemComponent } from './mockData';

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  linkTo,
  linkLabel = 'View all',
}: {
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {linkLabel}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ─── System status row ────────────────────────────────────────────────────────

function SystemStatusIcon({ status }: { status: SystemComponent['status'] }) {
  if (status === 'operational') return <CheckCircle2 size={14} className="text-green-400" />;
  if (status === 'degraded')    return <AlertTriangle size={14} className="text-yellow-400" />;
  return <WifiOff size={14} className="text-red-400" />;
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const severityDist = getSeverityDistribution(MOCK_ALERTS);
  // Show only the 6 most recent alerts in the feed
  const recentAlerts = MOCK_ALERTS.slice(0, 6);

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto">

      {/* ══ Simulated-data notice ════════════════════════════════════════ */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
        <FlaskConical size={14} className="text-cyan-400 shrink-0" />
        <span>
          All data on this dashboard is&nbsp;
          <span className="text-cyan-400 font-medium">simulated mock data</span>
          &nbsp;— no real backend, scanner, or SIEM is connected.
        </span>
      </div>

      {/* ══ 1. Summary Metric Cards ══════════════════════════════════════ */}
      <section>
        <SectionHeader title="Security Overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Alerts"
            value={MOCK_METRICS.totalAlerts}
            icon={<Bell size={18} />}
            accentColor="text-orange-400"
            accentBg="bg-orange-500/10"
            accentBorder="border-orange-500/20"
            trend={{ direction: 'up', label: '+3 today', invertColors: true }}
          />
          <MetricCard
            title="Critical Alerts"
            value={MOCK_METRICS.criticalAlerts}
            icon={<AlertTriangle size={18} />}
            accentColor="text-red-400"
            accentBg="bg-red-500/10"
            accentBorder="border-red-500/20"
            trend={{ direction: 'up', label: '+1 today', invertColors: true }}
          />
          <MetricCard
            title="Active Scans"
            value={MOCK_METRICS.activeScans}
            icon={<Crosshair size={18} />}
            accentColor="text-cyan-400"
            accentBg="bg-cyan-500/10"
            accentBorder="border-cyan-500/20"
            trend={{ direction: 'neutral', label: 'No change' }}
          />
          <MetricCard
            title="Monitored Assets"
            value={MOCK_METRICS.monitoredAssets}
            icon={<Server size={18} />}
            accentColor="text-blue-400"
            accentBg="bg-blue-500/10"
            accentBorder="border-blue-500/20"
            trend={{ direction: 'up', label: '+2 this week' }}
          />
        </div>
      </section>

      {/* ══ 2. Middle row: Chart + Trend ═════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Severity Donut */}
        <section className="glass-panel rounded-xl p-5">
          <SectionHeader title="Alert Severity Distribution" />
          <SeverityDonutChart data={severityDist} />
        </section>

        {/* 7-day Trend */}
        <section className="glass-panel rounded-xl p-5">
          <SectionHeader title="7-Day Threat Trend" />
          <ThreatTrendChart data={MOCK_TREND} />
        </section>
      </div>

      {/* ══ 3. Bottom row: Alerts feed + Scans + System status ══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Security Alerts Feed ─────────────────────────────────────── */}
        <section className="xl:col-span-2 glass-panel rounded-xl p-5">
          <SectionHeader title="Recent Security Alerts" linkTo="/alerts" />
          <div className="divide-y divide-slate-700/40">
            {recentAlerts.map((alert) => {
              const srcCfg = ALERT_SOURCE_CONFIG[alert.source];
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group"
                >
                  {/* Severity stripe */}
                  <div className="mt-0.5">
                    <SeverityBadge severity={alert.severity} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-100 transition-colors">
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {/* Source */}
                      <span className={cn('text-xs font-medium', srcCfg.color)}>
                        {srcCfg.label}
                      </span>
                      {/* Host */}
                      {alert.affectedHost && (
                        <span className="text-xs text-slate-500 font-mono">
                          {alert.affectedHost}
                        </span>
                      )}
                      {/* Time */}
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 mt-0.5">
                    <StatusBadge status={alert.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Recent Scan Activity */}
          <section className="glass-panel rounded-xl p-5 flex-1">
            <SectionHeader title="Recent Scan Activity" linkTo="/red-team" />
            <div className="space-y-3">
              {MOCK_SCANS.map((scan) => {
                const stCfg = SCAN_STATUS_CONFIG[scan.status];
                return (
                  <div key={scan.id} className="flex items-start gap-3">
                    {/* Status dot */}
                    <div className="mt-1.5">
                      <span className="relative flex h-2 w-2">
                        {scan.status === 'running' && (
                          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-70', stCfg.dot)} />
                        )}
                        <span className={cn('relative inline-flex rounded-full h-2 w-2', stCfg.dot)} />
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {SCAN_TYPE_LABELS[scan.id] ?? scan.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {scan.target}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={cn('text-[11px] font-semibold', stCfg.color)}>
                          {stCfg.label}
                        </span>
                        {scan.status === 'completed' && (
                          <span className="text-[11px] text-slate-500">
                            {scan.findingsCount} finding{scan.findingsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-600">
                          {timeAgo(scan.startedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* System Status */}
          <section className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">
                System Status
              </h2>
              <span className="text-[10px] text-slate-600 italic">Simulated</span>
            </div>
            <div className="space-y-2.5">
              {MOCK_SYSTEM_STATUS.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SystemStatusIcon status={comp.status} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{comp.name}</p>
                      <p className="text-[11px] text-slate-600 truncate">{comp.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={comp.status} />
                    {comp.latencyMs !== undefined && (
                      <p className="text-[10px] text-slate-600 mt-0.5">{comp.latencyMs}ms</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend note */}
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2">
              <Activity size={12} className="text-slate-600" />
              <span className="text-[10px] text-slate-600 italic">
                Statuses are simulated — no live backend connections.
              </span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
