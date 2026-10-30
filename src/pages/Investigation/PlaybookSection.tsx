import { useState, useEffect } from 'react';
import {
  ListChecks,
  Check,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Play,
} from 'lucide-react';
import type { PlaybookAction } from '../../types';
import { cn } from '../../utils';

const STORAGE_KEY = 'cyberdefense_playbook_state';

type SavedActionState = {
  simulatedStatus: 'pending' | 'applied';
  appliedAt?: string;
};

type PlaybookStorage = Record<string, SavedActionState>;

function getStoredPlaybookState(): PlaybookStorage {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlaybookStorage;
  } catch (err) {
    console.warn('Failed to read playbook state from localStorage:', err);
    return {};
  }
}

function savePlaybookState(updates: PlaybookStorage) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredPlaybookState();
    const merged = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to save playbook state to localStorage:', err);
  }
}

function initializeActions(initialActions: PlaybookAction[]): PlaybookAction[] {
  const stored = getStoredPlaybookState();
  return initialActions.map((a) => {
    const saved = stored[a.id];
    if (saved) {
      return {
        ...a,
        simulatedStatus: saved.simulatedStatus,
        appliedAt: saved.appliedAt,
      };
    }
    return a;
  });
}

interface PlaybookSectionProps {
  actions: PlaybookAction[];
  onToggleAction?: (actionId: string) => void;
}

export default function PlaybookSection({
  actions: initialActions,
  onToggleAction,
}: PlaybookSectionProps) {
  const [actions, setActions] = useState<PlaybookAction[]>(() =>
    initializeActions(initialActions),
  );
  const [activePhase, setActivePhase] = useState<string>('all');

  useEffect(() => {
    setActions(initializeActions(initialActions));
  }, [initialActions]);

  function handleActionClick(id: string) {
    let updatedActionState: SavedActionState | null = null;
    const updated = actions.map((a) => {
      if (a.id === id) {
        const isNowApplied = a.simulatedStatus !== 'applied';
        const nextState: SavedActionState = {
          simulatedStatus: isNowApplied ? 'applied' : 'pending',
          appliedAt: isNowApplied ? new Date().toISOString() : undefined,
        };
        updatedActionState = nextState;
        return {
          ...a,
          ...nextState,
        };
      }
      return a;
    });

    setActions(updated);
    if (updatedActionState) {
      savePlaybookState({ [id]: updatedActionState });
    }
    onToggleAction?.(id);
  }

  function handleResetAll() {
    const resetUpdates: PlaybookStorage = {};
    const updated = actions.map((a) => {
      resetUpdates[a.id] = { simulatedStatus: 'pending', appliedAt: undefined };
      return { ...a, simulatedStatus: 'pending' as const, appliedAt: undefined };
    });
    setActions(updated);
    savePlaybookState(resetUpdates);
  }

  const phaseLabels: Record<string, { label: string; color: string }> = {
    containment: { label: 'Phase 1: Containment', color: 'text-red-400' },
    eradication: { label: 'Phase 2: Eradication', color: 'text-orange-400' },
    recovery: { label: 'Phase 3: Recovery & Hardening', color: 'text-cyan-400' },
    verification: { label: 'Phase 4: Post-Incident Verification', color: 'text-green-400' },
  };

  const filtered =
    activePhase === 'all'
      ? actions
      : actions.filter((a) => a.phase === activePhase);

  const appliedCount = actions.filter((a) => a.simulatedStatus === 'applied').length;
  const progressPercent = Math.round((appliedCount / (actions.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <ListChecks size={16} className="text-cyan-400" />
            Authorized Lab Response Playbook
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured NIST SP 800-61 Rev 2 incident containment and remediation procedures
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Playbook Progress:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {appliedCount} / {actions.length} Completed ({progressPercent}%)
            </span>
          </div>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded border border-slate-700 transition-colors"
            title="Reset simulated playbook states"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Lab Simulation Notice */}
      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-3">
        <AlertTriangle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">Authorized Lab Environment Scope:</span> Playbook actions are executed in frontend simulation mode. Clicking an action simulates applying the mitigation on the affected target and updates the incident audit record without sending live network commands.
        </p>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActivePhase('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border',
            activePhase === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200',
          )}
        >
          All Phases ({actions.length})
        </button>
        {Object.entries(phaseLabels).map(([key, cfg]) => {
          const count = actions.filter((a) => a.phase === key).length;
          return (
            <button
              key={key}
              onClick={() => setActivePhase(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border',
                activePhase === key
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200',
              )}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filtered.map((action) => {
          const isApplied = action.simulatedStatus === 'applied';
          const phaseCfg = phaseLabels[action.phase] ?? { label: action.phase, color: 'text-slate-400' };

          return (
            <div
              key={action.id}
              className={cn(
                'glass-panel rounded-xl p-5 border transition-all duration-200',
                isApplied
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-slate-700/60 hover:border-slate-600',
              )}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={cn('text-[11px] font-bold uppercase tracking-wider', phaseCfg.color)}>
                      {phaseCfg.label}
                    </span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Asset: {action.targetAsset}
                    </span>
                    {isApplied && (
                      <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
                        <Check size={11} /> Simulated: Applied
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100">{action.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{action.description}</p>
                </div>

                {/* Simulation Toggle Button */}
                <button
                  onClick={() => handleActionClick(action.id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors border',
                    isApplied
                      ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30'
                      : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20',
                  )}
                >
                  {isApplied ? (
                    <>
                      <Check size={13} /> Applied (Click to Revert)
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-current" /> Simulate Action
                    </>
                  )}
                </button>
              </div>

              {/* Command Snippet Preview */}
              {action.commandSnippet && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-semibold mb-1">
                    <Terminal size={11} />
                    Lab Playbook Command Directive:
                  </div>
                  <pre className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap">
                    {action.commandSnippet}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
