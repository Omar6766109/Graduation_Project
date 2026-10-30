import { useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Cpu,
  Tag,
  Calendar,
  FileText,
  Terminal,
  Network,
  ShieldAlert,
} from 'lucide-react';
import type { TimelineEvent } from '../../types';
import SeverityBadge from '../../components/common/SeverityBadge';
import { formatDate, timeAgo } from '../../utils';

interface TimelineEventModalProps {
  event: TimelineEvent | null;
  stepNumber: number;
  totalSteps: number;
  onClose: () => void;
}

export default function TimelineEventModal({
  event,
  stepNumber,
  totalSteps,
  onClose,
}: TimelineEventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!event) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 space-y-5 text-slate-200 outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                Step {stepNumber} of {totalSteps}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                {event.id}
              </span>
              <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {event.phase}
              </span>
              <SeverityBadge severity={event.severity} dot />
            </div>
            <h2
              id="timeline-modal-title"
              className="text-base font-bold text-slate-100 leading-snug pt-1"
            >
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close event details modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chronology & Timing Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Clock size={11} className="text-cyan-400" /> Relative Timing
            </span>
            <p className="font-mono text-cyan-300 font-medium">{timeAgo(event.timestamp)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar size={11} className="text-purple-400" /> Recorded Timestamp
            </span>
            <p className="font-mono text-slate-300">{formatDate(event.timestamp)}</p>
          </div>
        </div>

        {/* Event Narrative Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-cyan-400" /> Event Narrative & Findings
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {event.description}
          </p>
        </div>

        {/* Sensor & Telemetry Source */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Cpu size={12} className="text-purple-400" /> Detection Sensor / Telemetry Source
          </span>
          <p className="font-mono text-purple-300 font-medium">{event.sensor}</p>
        </div>

        {/* MITRE ATT&CK Framework Mapping */}
        {(event.mitreTechnique || event.mitreTactic) && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Tag size={12} className="text-purple-400" /> MITRE ATT&CK Matrix Alignment
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {event.mitreTactic && (
                <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300">
                  <span className="text-slate-500">Tactic:</span>
                  <span className="font-semibold text-slate-200">{event.mitreTactic}</span>
                </div>
              )}
              {event.mitreTechnique && (
                <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-medium">
                  <span className="text-purple-400">Technique:</span>
                  <span>{event.mitreTechnique}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Available Fields: Network Endpoints (if present) */}
        {(event.sourceIp || event.destinationIp) && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Network size={12} className="text-cyan-400" /> Network Endpoints
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {event.sourceIp && (
                <div>
                  <span className="text-slate-500 text-[10px]">Source IP:</span>
                  <p className="font-mono text-slate-300 font-medium">{event.sourceIp}</p>
                </div>
              )}
              {event.destinationIp && (
                <div>
                  <span className="text-slate-500 text-[10px]">Destination IP:</span>
                  <p className="font-mono text-slate-300 font-medium">{event.destinationIp}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Available Fields: Related Evidence IDs (if present) */}
        {event.relatedEvidenceIds && event.relatedEvidenceIds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-cyan-400" /> Correlated Evidence Artifacts
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {event.relatedEvidenceIds.map((eid) => (
                <span
                  key={eid}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 font-semibold"
                >
                  {eid}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Available Fields: Raw Telemetry Snippet (if present) */}
        {event.rawTelemetry && (
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
              <Terminal size={12} className="text-cyan-400" /> Raw Telemetry Payload
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {event.rawTelemetry}
            </pre>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500 italic">
            Simulated Forensic Event • Press Esc to close
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
