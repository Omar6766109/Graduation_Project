import { useEffect, useRef, useState } from 'react';
import {
  X,
  Clock,
  Server,
  ShieldAlert,
  Terminal,
  Activity,
  Tag,
  ListChecks,
  Check,
  Copy,
  Network,
} from 'lucide-react';
import type { SecurityEvent, SecurityEventStatus } from '../../types';
import { cn, formatDate } from '../../utils';
import { ALERT_SOURCE_CONFIG, EVENT_TYPE_CONFIG } from '../../constants';
import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface EventDetailPanelProps {
  event: SecurityEvent | null;
  onClose: () => void;
  onUpdateStatus?: (eventId: string, newStatus: SecurityEventStatus) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetailPanel({
  event,
  onClose,
  onUpdateStatus,
}: EventDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

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
    if (event) {
      panelRef.current?.focus();
      setCopied(false);
    }
  }, [event]);

  function handleCopyLog() {
    if (event?.rawLog) {
      navigator.clipboard.writeText(event.rawLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const sourceCfg = event ? ALERT_SOURCE_CONFIG[event.source] : null;
  const typeCfg = event ? EVENT_TYPE_CONFIG[event.eventType] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300',
          event ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
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
        aria-label={event ? `Event details: ${event.title}` : 'Security event detail'}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-xl',
          'bg-slate-900 border-l border-slate-700/60 shadow-2xl',
          'flex flex-col outline-none',
          'transition-transform duration-300 ease-in-out',
          event ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-700/60 bg-slate-900/90">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {event && <SeverityBadge severity={event.severity} />}
              {event && <StatusBadge status={event.status} />}
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
              {event && <span className="text-[10px] font-mono text-slate-500">{event.id}</span>}
            </div>
            <h2 className="text-base font-semibold text-slate-100 leading-snug">
              {event?.title ?? '—'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close event detail"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {event ? (
            <>
              {/* Event Metadata Group */}
              <div className="glass-panel rounded-xl p-4 space-y-0">
                <DetailRow icon={<Network size={14} />} label="Traffic & IP Addressing">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-slate-400">Src:</span>
                    <code className="font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {event.sourceIp}
                      {event.sourcePort ? `:${event.sourcePort}` : ''}
                    </code>
                    <span className="text-slate-600">➔</span>
                    <span className="text-slate-400">Dst:</span>
                    <code className="font-mono text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {event.destinationIp}
                      {event.destinationPort ? `:${event.destinationPort}` : ''}
                    </code>
                    {event.protocol && (
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {event.protocol}
                      </span>
                    )}
                  </div>
                </DetailRow>

                <DetailRow icon={<Server size={14} />} label="Affected Asset">
                  <span className="font-medium text-slate-200 text-xs">
                    {event.affectedAsset}
                  </span>
                </DetailRow>

                <DetailRow icon={<Activity size={14} />} label="Sensor & Detection Engine">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-semibold', sourceCfg?.color)}>
                        {sourceCfg?.label ?? event.source}
                      </span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-xs text-slate-300">{event.sensor}</span>
                    </div>
                  </div>
                </DetailRow>

                <DetailRow icon={<Clock size={14} />} label="Event Timestamp">
                  <span className="font-mono text-slate-300 text-xs">
                    {formatDate(event.timestamp)}
                  </span>
                </DetailRow>

                {event.mitreTechnique && (
                  <DetailRow icon={<Tag size={14} />} label="MITRE ATT&CK Mapping">
                    <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {event.mitreTechnique}
                    </span>
                  </DetailRow>
                )}
              </div>

              {/* Event Description */}
              <div className="glass-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-cyan-400" />
                  Incident Narrative
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
              </div>

              {/* Indicators of Compromise */}
              {event.iocs && event.iocs.length > 0 && (
                <div className="glass-panel rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Observed Artifacts & IOCs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.iocs.map((ioc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 break-all"
                      >
                        {ioc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Telemetry Log Snippet */}
              {event.rawLog && (
                <div className="glass-panel rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal size={13} className="text-cyan-400" />
                      Raw Sensor Telemetry Log
                    </p>
                    <button
                      onClick={handleCopyLog}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                      aria-label="Copy log snippet"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {event.rawLog}
                  </pre>
                </div>
              )}

              {/* Investigation Playbook */}
              {event.investigationSteps && event.investigationSteps.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ListChecks size={13} className="text-cyan-400" />
                    Recommended SOC Playbook Steps
                  </p>
                  <ul className="space-y-2">
                    {event.investigationSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Update Quick Action Controls */}
              {onUpdateStatus && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Update Incident Status (Local State)
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onUpdateStatus(event.id, 'investigating')}
                      disabled={event.status === 'investigating'}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        event.status === 'investigating'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 cursor-default'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30',
                      )}
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => onUpdateStatus(event.id, 'contained')}
                      disabled={event.status === 'contained'}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        event.status === 'contained'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 cursor-default'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30',
                      )}
                    >
                      Contained
                    </button>
                    <button
                      onClick={() => onUpdateStatus(event.id, 'resolved')}
                      disabled={event.status === 'resolved'}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        event.status === 'resolved'
                          ? 'bg-green-500/20 text-green-300 border-green-500/40 cursor-default'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-green-500/10 hover:text-green-300 hover:border-green-500/30',
                      )}
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => onUpdateStatus(event.id, 'dismissed')}
                      disabled={event.status === 'dismissed'}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        event.status === 'dismissed'
                          ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-default'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200',
                      )}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              Select an event to view forensic telemetry.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex items-center justify-between gap-3 bg-slate-900/90">
          <span className="text-[10px] text-slate-600 italic">
            Simulated Blue Team Telemetry — No live SIEM agent or physical tap connected.
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
