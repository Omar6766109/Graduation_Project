import { useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Crosshair,
  Server,
  Terminal,
  User,
  ShieldAlert,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import type { Scan, ScanFinding } from '../../types';
import { cn, formatDate } from '../../utils';
import { SCAN_TYPE_CONFIG } from '../../constants';
import StatusBadge from '../../components/common/StatusBadge';
import SeverityBadge from '../../components/common/SeverityBadge';

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-700/40 last:border-0">
      <span className="mt-0.5 text-slate-500 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-1">
          {label}
        </p>
        <div className="text-sm text-slate-200">{children}</div>
      </div>
    </div>
  );
}

// ─── Finding Card ─────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: ScanFinding }) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={finding.severity} dot />
          {finding.cvss !== undefined && finding.cvss > 0 && (
            <span
              className={cn(
                'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
                finding.cvss >= 9.0
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : finding.cvss >= 7.0
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
              )}
            >
              CVSS {finding.cvss.toFixed(1)}
            </span>
          )}
          {finding.cve && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
              {finding.cve}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0">{finding.id}</span>
      </div>

      <h4 className="text-sm font-semibold text-slate-100">{finding.title}</h4>

      {finding.affectedItem && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">Target/Port:</span>
          <code className="text-[11px] font-mono text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
            {finding.affectedItem}
          </code>
        </div>
      )}

      <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

      {finding.remediation && (
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 mb-1">
            Remediation Recommendation
          </p>
          <p className="text-xs text-slate-400">{finding.remediation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScanDetailPanelProps {
  scan: Scan | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScanDetailPanel({ scan, onClose }: ScanDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside panel when opened
  useEffect(() => {
    if (scan) panelRef.current?.focus();
  }, [scan]);

  const typeCfg = scan?.scanType ? SCAN_TYPE_CONFIG[scan.scanType] : null;
  const findings = scan?.findings ?? [];

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const highCount = findings.filter((f) => f.severity === 'high').length;
  const mediumCount = findings.filter((f) => f.severity === 'medium').length;
  const lowCount = findings.filter((f) => f.severity === 'low').length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300',
          scan ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={scan ? `Scan detail: ${scan.name}` : 'Scan detail'}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-xl',
          'bg-slate-900 border-l border-slate-700/60 shadow-2xl',
          'flex flex-col outline-none',
          'transition-transform duration-300 ease-in-out',
          scan ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-700/60 bg-slate-900/90">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {scan && <StatusBadge status={scan.status} />}
              {typeCfg && (
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                    typeCfg.bg,
                    typeCfg.color,
                    typeCfg.border,
                  )}
                >
                  {typeCfg.label}
                </span>
              )}
              {scan && <span className="text-[10px] font-mono text-slate-500">{scan.id}</span>}
            </div>
            <h2 className="text-base font-semibold text-slate-100 leading-snug">
              {scan?.name ?? '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close scan detail"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {scan ? (
            <>
              {/* Scan Metadata Group */}
              <div className="glass-panel rounded-xl p-4 space-y-0">
                <DetailRow icon={<Server size={14} />} label="Scan Target">
                  <code className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded text-xs">
                    {scan.target}
                  </code>
                </DetailRow>

                <DetailRow icon={<Cpu size={14} />} label="Scanner Engine">
                  <span className="text-xs text-slate-200 font-medium">
                    {scan.scannerEngine ?? 'Standard Lab Engine'}
                  </span>
                </DetailRow>

                <DetailRow icon={<Clock size={14} />} label="Execution Timeline">
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-300">
                      Started: <span className="font-mono text-slate-400">{formatDate(scan.startedAt)}</span>
                    </p>
                    {scan.completedAt && (
                      <p className="text-slate-300">
                        Finished: <span className="font-mono text-slate-400">{formatDate(scan.completedAt)}</span>
                      </p>
                    )}
                    <p className="text-cyan-400 font-medium">
                      Duration: {scan.duration ?? 'In progress'}
                    </p>
                  </div>
                </DetailRow>

                <DetailRow icon={<User size={14} />} label="Operator / Dispatcher">
                  <span className="text-xs text-slate-300">
                    {scan.executedBy ?? 'Red Team Analyst'}
                  </span>
                </DetailRow>

                {scan.parameters && (
                  <DetailRow icon={<Terminal size={14} />} label="Command Parameters">
                    <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                      {scan.parameters}
                    </pre>
                  </DetailRow>
                )}
              </div>

              {/* Findings Summary Stats */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} className="text-cyan-400" />
                    Discovered Vulnerabilities ({findings.length})
                  </h3>
                  <span className="text-[10px] text-slate-500 italic">Simulated Lab Findings</span>
                </div>

                {findings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-sm font-bold text-red-400">{criticalCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Critical</p>
                      </div>
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                        <p className="text-sm font-bold text-orange-400">{highCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">High</p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <p className="text-sm font-bold text-yellow-400">{mediumCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Medium</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                        <p className="text-sm font-bold text-blue-400">{lowCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Low</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {findings.map((finding) => (
                        <FindingCard key={finding.id} finding={finding} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center space-y-2">
                    {scan.status === 'running' ? (
                      <>
                        <Crosshair size={28} className="mx-auto text-cyan-400 animate-spin" />
                        <p className="text-sm font-medium text-slate-200">Scan In Progress</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Scanner engine is executing simulated reconnaissance probes. Findings will populate upon cycle completion.
                        </p>
                      </>
                    ) : scan.status === 'queued' ? (
                      <>
                        <Clock size={28} className="mx-auto text-yellow-400" />
                        <p className="text-sm font-medium text-slate-200">Scan Queued</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Waiting for available scanner execution slot.
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={28} className="mx-auto text-green-400" />
                        <p className="text-sm font-medium text-slate-200">No Open Vulnerabilities</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          The target responded normally to all probes. No high-risk security flaws or exposed services detected.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              Select a scan to view execution details.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex items-center justify-between gap-3 bg-slate-900/90">
          <span className="text-[10px] text-slate-600 italic">
            Simulated environment data — no real network packets transmitted
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
