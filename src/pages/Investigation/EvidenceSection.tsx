import { useState } from 'react';
import {
  FileText,
  Network,
  Terminal,
  FileCode2,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import type { EvidenceItem } from '../../types';
import { cn } from '../../utils';

interface EvidenceSectionProps {
  evidence: EvidenceItem[];
}

export default function EvidenceSection({ evidence }: EvidenceSectionProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered =
    filterType === 'all'
      ? evidence
      : evidence.filter((item) => item.type === filterType);

  const typeIcons: Record<string, React.ReactNode> = {
    network: <Network size={14} className="text-cyan-400" />,
    endpoint: <Terminal size={14} className="text-purple-400" />,
    file: <FileCode2 size={14} className="text-amber-400" />,
    auth: <KeyRound size={14} className="text-emerald-400" />,
  };

  const typeLabels: Record<string, string> = {
    network: 'Network Flow',
    endpoint: 'Endpoint Process',
    file: 'File / Hash',
    auth: 'Identity / Auth',
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} className="text-purple-400" />
            Associated Evidence Artifacts ({evidence.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic hashes, network flow captures, and process execution telemetry
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          {['all', 'network', 'endpoint', 'file', 'auth'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-2.5 py-1 rounded-md capitalize font-medium transition-colors',
                filterType === t
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {t === 'all' ? 'All Artifacts' : typeLabels[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-xl p-5 border border-slate-700/60 hover:border-slate-600 transition-colors flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top tag row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  {typeIcons[item.type]}
                  {typeLabels[item.type] ?? item.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
              </div>

              <h4 className="text-sm font-semibold text-slate-100 mb-3">{item.title}</h4>

              {/* Structured Key-Value Pairs */}
              <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                {Object.entries(item.details).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">{k}:</span>
                    <span className="text-slate-300 text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Log or Snippet */}
            {item.rawSnippet && (
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Raw Telemetry Snippet
                  </span>
                  <button
                    onClick={() => handleCopy(item.id, item.rawSnippet!)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label="Copy raw snippet"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={11} className="text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 rounded bg-slate-950 border border-slate-800/90 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {item.rawSnippet}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Simulated Evidence Artifacts — Academic demonstration data from isolated cyber range.</span>
        <span className="text-slate-400 font-mono">Chain of Custody: Verified</span>
      </div>
    </div>
  );
}
