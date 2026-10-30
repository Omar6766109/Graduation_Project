import { useEffect, useRef } from 'react';
import { X, Clock, Server, Tag, Activity, FileText, AlertTriangle } from 'lucide-react';
import type { Alert } from '../../types';
import { cn, formatDate } from '../../utils';
import { SEVERITY_CONFIG, ALERT_SOURCE_CONFIG } from '../../constants';
import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';

// ─── Detail row ───────────────────────────────────────────────────────────────

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
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-1">{label}</p>
        <div className="text-sm text-slate-200">{children}</div>
      </div>
    </div>
  );
}

// ─── MITRE ATT&CK tactic mapping (simulated) ──────────────────────────────────

const MITRE_TAGS: Partial<Record<string, string[]>> = {
  'ALT-001': ['T1110 – Brute Force', 'T1078 – Valid Accounts'],
  'ALT-002': ['T1548.003 – Sudo & Sudo Caching', 'T1068 – Exploitation for Privilege Escalation'],
  'ALT-003': ['T1486 – Data Encrypted for Impact'],
  'ALT-004': ['T1550.002 – Pass the Hash', 'T1021 – Remote Services'],
  'ALT-005': ['T1046 – Network Service Discovery'],
  'ALT-006': ['T1071 – Application Layer Protocol', 'T1041 – Exfiltration Over C2'],
  'ALT-007': ['T1190 – Exploit Public-Facing Application'],
  'ALT-008': ['T1059.001 – PowerShell', 'T1105 – Ingress Tool Transfer'],
  'ALT-009': ['T1021.001 – Remote Desktop Protocol'],
  'ALT-010': ['T1505.003 – Web Shell'],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AlertDetailPanelProps {
  alert: Alert | null;
  onClose: () => void;
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function AlertDetailPanel({ alert, onClose }: AlertDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside panel when open
  useEffect(() => {
    if (alert) panelRef.current?.focus();
  }, [alert]);

  const severityCfg = alert ? SEVERITY_CONFIG[alert.severity] : null;
  const sourceCfg   = alert ? ALERT_SOURCE_CONFIG[alert.source] : null;
  const mitreTags   = alert ? (MITRE_TAGS[alert.id] ?? []) : [];

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300',
          alert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-in panel ─────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={alert ? `Alert detail: ${alert.title}` : 'Alert detail'}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-lg',
          'bg-slate-900 border-l border-slate-700/60 shadow-2xl',
          'flex flex-col outline-none',
          'transition-transform duration-300 ease-in-out',
          alert ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-700/60',
          severityCfg && `border-l-2 ${severityCfg.border.replace('border-', 'border-l-')}`,
        )}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {alert && <SeverityBadge severity={alert.severity} />}
              {alert && <StatusBadge status={alert.status} />}
              {alert && (
                <span className="text-[10px] font-mono text-slate-500">{alert.id}</span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-slate-100 leading-snug">
              {alert?.title ?? '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close alert detail"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {alert ? (
            <div className="space-y-0">
              {/* Description */}
              <DetailRow icon={<FileText size={14} />} label="Description">
                <p className="text-slate-300 leading-relaxed text-sm">{alert.description}</p>
              </DetailRow>

              {/* Affected host */}
              <DetailRow icon={<Server size={14} />} label="Affected Host">
                <code className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded text-xs">
                  {alert.affectedHost ?? 'Unknown'}
                </code>
              </DetailRow>

              {/* Source */}
              <DetailRow icon={<Activity size={14} />} label="Alert Source">
                <span className={cn('font-medium', sourceCfg?.color ?? 'text-slate-300')}>
                  {sourceCfg?.label ?? alert.source}
                </span>
              </DetailRow>

              {/* Timestamp */}
              <DetailRow icon={<Clock size={14} />} label="Detected At">
                <span className="font-mono text-slate-300 text-xs">{formatDate(alert.timestamp)}</span>
              </DetailRow>

              {/* Severity detail */}
              <DetailRow icon={<AlertTriangle size={14} />} label="Severity">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={alert.severity} dot />
                  {alert.severity === 'critical' && (
                    <span className="text-xs text-red-400">Immediate response required</span>
                  )}
                  {alert.severity === 'high' && (
                    <span className="text-xs text-orange-400">Respond within 1 hour</span>
                  )}
                  {alert.severity === 'medium' && (
                    <span className="text-xs text-yellow-400">Respond within 24 hours</span>
                  )}
                  {(alert.severity === 'low' || alert.severity === 'info') && (
                    <span className="text-xs text-slate-400">Review at next cycle</span>
                  )}
                </div>
              </DetailRow>

              {/* MITRE ATT&CK tactics */}
              {mitreTags.length > 0 && (
                <DetailRow icon={<Tag size={14} />} label="MITRE ATT&CK Techniques">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mitreTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </DetailRow>
              )}

              {/* Recommended actions */}
              <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/40">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Recommended Actions
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {alert.severity === 'critical' && (
                    <>
                      <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">▸</span> Isolate affected host from the network immediately.</li>
                      <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">▸</span> Capture memory dump and disk image for forensics.</li>
                      <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">▸</span> Escalate to incident response team lead.</li>
                      <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">▸</span> Open an investigation and attach this alert as evidence.</li>
                    </>
                  )}
                  {alert.severity === 'high' && (
                    <>
                      <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> Investigate affected host within 1 hour.</li>
                      <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> Review related logs and correlated events in SIEM.</li>
                      <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> Determine if a containment action is needed.</li>
                    </>
                  )}
                  {alert.severity === 'medium' && (
                    <>
                      <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">▸</span> Review during next analyst shift.</li>
                      <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">▸</span> Verify if the activity is authorized or expected.</li>
                      <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">▸</span> Update asset inventory if new system is involved.</li>
                    </>
                  )}
                  {(alert.severity === 'low' || alert.severity === 'info') && (
                    <>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">▸</span> Log for trend analysis and periodic review.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">▸</span> Dismiss or acknowledge if behavior is expected.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              Select an alert to view details.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-600 italic">Simulated data — no live backend</span>
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
