import { useState } from 'react';
import { Clock, Tag, Cpu, ChevronRight } from 'lucide-react';
import type { TimelineEvent } from '../../types';
import { cn, formatDate, timeAgo } from '../../utils';
import SeverityBadge from '../../components/common/SeverityBadge';
import TimelineEventModal from './TimelineEventModal';

interface TimelineSectionProps {
  timeline: TimelineEvent[];
}

export default function TimelineSection({ timeline }: TimelineSectionProps) {
  const [selectedEventInfo, setSelectedEventInfo] = useState<{
    event: TimelineEvent;
    stepNumber: number;
  } | null>(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
        <Clock size={32} className="mx-auto mb-2 opacity-40 text-cyan-400" />
        <p className="text-sm font-medium">No timeline events recorded for this incident.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            Attack Progression Timeline ({timeline.length} Events)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological forensic reconstruction of the simulated breach lifecycle — click any event to view details
          </p>
        </div>
        <span className="text-[10px] text-slate-500 italic bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          Simulated Event Telemetry
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-purple-500/40 before:to-slate-800">
        {timeline.map((evt, idx) => {
          const stepNumber = idx + 1;
          return (
            <div key={evt.id} className="relative group">
              {/* Node dot on timeline line */}
              <div
                className={cn(
                  'absolute -left-[1.85rem] top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-125',
                  evt.severity === 'critical'
                    ? 'bg-red-500 shadow-sm shadow-red-500/50'
                    : evt.severity === 'high'
                      ? 'bg-orange-500 shadow-sm shadow-orange-500/50'
                      : 'bg-cyan-500 shadow-sm shadow-cyan-500/50',
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Clickable & Keyboard-Accessible Event Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEventInfo({ event: evt, stepNumber })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEventInfo({ event: evt, stepNumber });
                  }
                }}
                aria-label={`View details for Step ${stepNumber}: ${evt.title}`}
                className="glass-panel rounded-xl p-4 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-bold">
                      Step {stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {evt.phase}
                    </span>
                    <SeverityBadge severity={evt.severity} dot />
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs text-slate-400 font-mono" title={evt.timestamp}>
                        {timeAgo(evt.timestamp)}
                      </span>
                      <p className="text-[10px] text-slate-600 font-mono">{formatDate(evt.timestamp)}</p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1.5">
                  {evt.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{evt.description}</p>

                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-[11px] flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cpu size={12} className="text-slate-500" />
                    <span>Sensor:</span>
                    <span className="text-slate-300 font-mono">{evt.sensor}</span>
                  </div>

                  {evt.mitreTechnique && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Tag size={12} className="text-purple-400" />
                      <span className="text-purple-300 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {evt.mitreTechnique}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Event Details Modal ────────────────────────────────────────── */}
      <TimelineEventModal
        event={selectedEventInfo?.event ?? null}
        stepNumber={selectedEventInfo?.stepNumber ?? 1}
        totalSteps={timeline.length}
        onClose={() => setSelectedEventInfo(null)}
      />
    </div>
  );
}
