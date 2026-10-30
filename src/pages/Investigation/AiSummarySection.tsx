import { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  FileText,
  History,
  CheckCircle2,
  Clock,
  Layers,
  ListChecks,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { AiIncidentSummary, Investigation } from '../../types';
import { cn } from '../../utils';
import {
  getScenariosForIncident,
  findEvidenceById,
  getStoredAiHistory,
  saveStoredAiHistory,
  getStoredActiveRunNumber,
  saveStoredActiveRunNumber,
  type SimulatedAiScenario,
  type AnalysisRunRecord,
} from './aiScenarios';

interface AiSummarySectionProps {
  summary?: AiIncidentSummary;
  incident?: Investigation;
}

export default function AiSummarySection({ summary, incident }: AiSummarySectionProps) {
  const incidentId = incident?.id ?? 'INV-2026-001';
  const availableScenarios = getScenariosForIncident(incidentId);

  // Helper to construct baseline run if none exists in storage
  const createBaselineRun = (): AnalysisRunRecord => {
    const initialScenario = availableScenarios[0];
    const initialTitle = initialScenario?.scenarioTitle ?? 'Initial Lab Synthesis';
    const initialConfidence = initialScenario?.confidenceScore ?? summary?.confidenceScore ?? 94;
    const initialExecutive =
      initialScenario?.executiveSummary ??
      summary?.executiveSummary ??
      'Automated baseline evidence synthesis.';
    const initialEvidenceRefs = initialScenario
      ? Array.from(
          new Set([
            ...initialScenario.rootCause.linkedEvidenceIds,
            ...initialScenario.criticalRiskFactors.flatMap((r) => r.linkedEvidenceIds),
          ]),
        )
      : [];

    return {
      runNumber: 1,
      runId: `RUN-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      scenarioId: initialScenario?.id ?? 'SCN-INITIAL',
      scenarioTitle: initialTitle,
      confidenceScore: initialConfidence,
      summarySnapshot: initialExecutive.slice(0, 95) + '…',
      executiveSummary: initialExecutive,
      evidenceReferences: initialEvidenceRefs,
      linkedEvidenceCount: initialEvidenceRefs.length,
    };
  };

  // 1. History state initialized from localStorage with safe fallback
  const [history, setHistory] = useState<AnalysisRunRecord[]>(() => {
    const stored = getStoredAiHistory(incidentId);
    if (stored && stored.length > 0) {
      return stored;
    }
    const initial = [createBaselineRun()];
    saveStoredAiHistory(incidentId, initial);
    return initial;
  });

  // 2. Selected run number initialized from localStorage or defaulting to the latest run
  const [selectedRunNumber, setSelectedRunNumber] = useState<number>(() => {
    const storedRun = getStoredActiveRunNumber(incidentId);
    const existing = getStoredAiHistory(incidentId);
    const activeHistory = existing && existing.length > 0 ? existing : null;
    if (storedRun !== null && activeHistory && activeHistory.some((r) => r.runNumber === storedRun)) {
      return storedRun;
    }
    return activeHistory?.[0]?.runNumber ?? 1;
  });

  // 3. Active scenario index initialized to match the selected run
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(() => {
    const storedRunNum = getStoredActiveRunNumber(incidentId);
    const existing = getStoredAiHistory(incidentId);
    const activeHistory = existing && existing.length > 0 ? existing : null;
    const activeNum = storedRunNum ?? activeHistory?.[0]?.runNumber ?? 1;
    const targetRun = activeHistory?.find((r) => r.runNumber === activeNum) ?? activeHistory?.[0];
    if (targetRun) {
      const idx = availableScenarios.findIndex((s) => s.id === targetRun.scenarioId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'switched' | 'unchanged';
    message: string;
  } | null>(null);

  // Active run object
  const activeRun = history.find((r) => r.runNumber === selectedRunNumber) ?? history[0];

  // Active scenario object
  const currentScenario: SimulatedAiScenario | undefined = availableScenarios[activeScenarioIdx];

  // If no scenario found for custom incidents, fall back to active run record or passed summary
  const confidenceScore = currentScenario?.confidenceScore ?? activeRun?.confidenceScore ?? summary?.confidenceScore ?? 90;
  const executiveSummary = currentScenario?.executiveSummary ?? activeRun?.executiveSummary ?? summary?.executiveSummary ?? 'No synthesis available.';
  const rootCause = currentScenario
    ? currentScenario.rootCause.hypothesis
    : summary?.rootCause ?? 'Root cause determination in progress.';
  const rootCauseEvidenceIds = currentScenario?.rootCause.linkedEvidenceIds ?? activeRun?.evidenceReferences ?? [];
  const rootCauseCorrelationNote = currentScenario?.rootCause.correlationNote;
  const impactAssessment = currentScenario?.impactAssessment ?? summary?.impactAssessment ?? 'Impact under assessment.';
  const riskFactors = currentScenario?.criticalRiskFactors ?? (summary?.keyRiskIndicators?.map((k) => ({ risk: k, linkedEvidenceIds: [] })) ?? []);
  const recommendedSteps = currentScenario?.recommendedSteps ?? [];
  const confidenceExplanation = currentScenario?.confidenceExplanation ?? 'Simulated score calculated from lab telemetry.';
  const confidenceFactors = currentScenario?.confidenceFactors ?? [
    'Evidence artifact consistency checked across network taps and host sensors',
    'Heuristic rule matching against MITRE ATT&CK techniques',
    'No contradictory telemetry detected in local lab environment',
  ];

  // All unique evidence IDs referenced in current scenario
  const referencedEvidenceIds = Array.from(
    new Set([
      ...rootCauseEvidenceIds,
      ...riskFactors.flatMap((r) => r.linkedEvidenceIds),
    ]),
  );

  function handleRefreshAnalysis() {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setNotification(null);

    // Realistic simulation processing delay
    setTimeout(() => {
      setIsSynthesizing(false);

      if (availableScenarios.length <= 1) {
        // Only 1 scenario exists: re-verify and update timestamp without changing findings
        const maxRun = history.reduce((max, r) => Math.max(max, r.runNumber), 0);
        const newRunNumber = maxRun + 1;
        const currentEvidenceRefs = currentScenario
          ? Array.from(
              new Set([
                ...currentScenario.rootCause.linkedEvidenceIds,
                ...currentScenario.criticalRiskFactors.flatMap((r) => r.linkedEvidenceIds),
              ]),
            )
          : referencedEvidenceIds;

        const record: AnalysisRunRecord = {
          runNumber: newRunNumber,
          runId: `RUN-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          scenarioId: currentScenario?.id ?? 'SCN-01',
          scenarioTitle: currentScenario?.scenarioTitle ?? 'Current Scenario',
          confidenceScore: confidenceScore,
          summarySnapshot: executiveSummary.slice(0, 95) + '…',
          executiveSummary: executiveSummary,
          evidenceReferences: currentEvidenceRefs,
          linkedEvidenceCount: currentEvidenceRefs.length,
        };
        const updatedHistory = [record, ...history];
        setHistory(updatedHistory);
        setSelectedRunNumber(newRunNumber);
        saveStoredAiHistory(incidentId, updatedHistory);
        saveStoredActiveRunNumber(incidentId, newRunNumber);
        setNotification({
          type: 'unchanged',
          message:
            'Analysis re-verified: No alternative attack hypothesis found. All evidence correlations remain consistent with current scenario.',
        });
        return;
      }

      // Cycle to the next predefined simulated scenario
      const nextIdx = (activeScenarioIdx + 1) % availableScenarios.length;
      const nextScenario = availableScenarios[nextIdx];
      setActiveScenarioIdx(nextIdx);

      const maxRun = history.reduce((max, r) => Math.max(max, r.runNumber), 0);
      const newRunNumber = maxRun + 1;
      const nextEvidenceRefs = Array.from(
        new Set([
          ...nextScenario.rootCause.linkedEvidenceIds,
          ...nextScenario.criticalRiskFactors.flatMap((r) => r.linkedEvidenceIds),
        ]),
      );

      const record: AnalysisRunRecord = {
        runNumber: newRunNumber,
        runId: `RUN-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        scenarioId: nextScenario.id,
        scenarioTitle: nextScenario.scenarioTitle,
        confidenceScore: nextScenario.confidenceScore,
        summarySnapshot: nextScenario.executiveSummary.slice(0, 95) + '…',
        executiveSummary: nextScenario.executiveSummary,
        evidenceReferences: nextEvidenceRefs,
        linkedEvidenceCount: nextEvidenceRefs.length,
      };

      const updatedHistory = [record, ...history];
      setHistory(updatedHistory);
      setSelectedRunNumber(newRunNumber);
      saveStoredAiHistory(incidentId, updatedHistory);
      saveStoredActiveRunNumber(incidentId, newRunNumber);
      setNotification({
        type: 'switched',
        message: `Simulated analysis updated: Loaded "${nextScenario.scenarioTitle}" with ${nextScenario.confidenceScore}% confidence.`,
      });
    }, 1100);
  }

  function handleSelectRun(run: AnalysisRunRecord) {
    setSelectedRunNumber(run.runNumber);
    saveStoredActiveRunNumber(incidentId, run.runNumber);
    // Find scenario matching this run
    const matchedIdx = availableScenarios.findIndex((s) => s.id === run.scenarioId);
    if (matchedIdx !== -1) {
      setActiveScenarioIdx(matchedIdx);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            AI-Assisted Incident Synthesis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated reasoning synthesis correlated from multi-sensor evidence artifacts (Simulation)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAnalysis}
            disabled={isSynthesizing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md',
              isSynthesizing
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-not-allowed opacity-80'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20 active:scale-[0.98]',
            )}
          >
            <RefreshCw size={13} className={cn(isSynthesizing && 'animate-spin')} />
            {isSynthesizing ? 'Analyzing Artifacts & Correlating…' : 'Refresh AI Analysis'}
          </button>
        </div>
      </div>

      {/* ── Academic Simulation Notice Banner ─────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-3">
        <AlertTriangle size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="leading-relaxed">
            <span className="font-semibold text-purple-200">Academic Simulation Notice:</span> This AI incident synthesis is pre-computed from lab evidence artifacts for demonstration and educational review. No external cloud AI APIs, LLM vendors, or confidential telemetry are connected.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-purple-400/90 pt-0.5">
            <span>Incident Context: <strong className="font-mono text-purple-200">{incidentId}</strong></span>
            <span>•</span>
            <span>Active Scenario: <strong className="text-purple-200">{currentScenario?.scenarioTitle ?? 'Standard Evaluation'}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Dynamic Refresh Status Feedback ───────────────────────────── */}
      {notification && (
        <div
          className={cn(
            'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs border transition-all animate-fadeIn',
            notification.type === 'switched'
              ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
              : 'bg-slate-900/80 border-slate-700/80 text-slate-300',
          )}
        >
          {notification.type === 'switched' ? (
            <Sparkles size={14} className="text-purple-400 shrink-0" />
          ) : (
            <Info size={14} className="text-cyan-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Main Synthesis Container ─────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-6 border border-slate-700/60 space-y-6">
        {/* Metric & Confidence Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Incident Reasoning Confidence</p>
              <p className="text-[11px] text-slate-500">
                Multi-sensor evidence correlation score (Simulated)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-bold text-purple-400 font-mono">
                  {confidenceScore}%
                </span>
                <span className="text-[10px] text-purple-300/80 font-medium">Simulated</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {confidenceScore >= 90 ? 'High Confidence' : 'Moderate Confidence'}
              </p>
            </div>
            <div className="w-28 h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Confidence Explanation Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Info size={13} className="text-cyan-400" />
              Confidence Determination Factors
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Formula: Heuristic Corroboration Engine v1.4
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed italic">
            "{confidenceExplanation}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1">
            {confidenceFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                <CheckCircle2 size={12} className="text-purple-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Executive Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> Executive Summary
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Scenario: {currentScenario?.scenarioTitle ?? 'Standard Synthesis'}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-inner">
            {executiveSummary}
          </p>
        </div>

        {/* Section 2: Hypothesized Root Cause & Impact Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Root Cause Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                Hypothesized Root Cause
              </span>
              {rootCauseEvidenceIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Linked:</span>
                  {rootCauseEvidenceIds.map((id) => (
                    <span
                      key={id}
                      className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold"
                      title={`Corroborated by Evidence Artifact ${id}`}
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {rootCause}
            </p>
            {rootCauseCorrelationNote && (
              <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                <FileText size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>{rootCauseCorrelationNote}</span>
              </div>
            )}
          </div>

          {/* Impact Assessment Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
              Impact & Scope Assessment
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {impactAssessment}
            </p>
            <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-slate-500">Monitored Target:</span>
              <span className="font-mono text-slate-300 font-semibold">{incident?.targetAsset ?? '192.168.1.10'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Critical Evidence-Based Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400" />
                Critical Evidence-Based Risk Factors
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {riskFactors.length} Risk Indicators Identified
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {riskFactors.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-purple-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{item.risk}</span>
                  </div>
                  {item.linkedEvidenceIds && item.linkedEvidenceIds.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {item.linkedEvidenceIds.map((eid) => (
                        <span
                          key={eid}
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-semibold"
                          title={`Supported by Evidence ${eid}`}
                        >
                          {eid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Recommended Next Steps Derived from Scenario */}
        {recommendedSteps.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks size={13} className="text-emerald-400" />
              Scenario-Derived Recommended Response Steps
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recommendedSteps.map((step, idx) => {
                const phaseStyles: Record<string, string> = {
                  Containment: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
                  Eradication: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
                  Recovery: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
                  Verification: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
                };
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={cn(
                          'font-bold px-2 py-0.5 rounded border uppercase tracking-wider',
                          phaseStyles[step.phase] ?? 'text-slate-300 bg-slate-800 border-slate-700',
                        )}
                      >
                        {step.phase}
                      </span>
                      <span className="font-mono text-slate-500 truncate max-w-[150px]">
                        {step.targetAsset}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{step.action}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 5: Corroborated Evidence Artifacts Summary */}
        {referencedEvidenceIds.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                Corroborated Evidence Artifacts ({referencedEvidenceIds.length})
              </h4>
              <span className="text-[10px] text-slate-500">
                Verified against incident evidence store
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {referencedEvidenceIds.map((eid) => {
                const evItem = findEvidenceById(incident?.evidence, eid);
                return (
                  <div
                    key={eid}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-[11px]">{eid}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {evItem?.type ?? 'artifact'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      {evItem?.title ?? `Evidence Artifact ${eid}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 6: Analysis Run History */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} className="text-purple-400" />
              Analysis Run History ({history.length})
            </h4>
            <span className="text-[10px] text-slate-500">
              Interactive session audit log (Frontend state)
            </span>
          </div>

          <div className="space-y-2">
            {history.map((run) => {
              const isSelected = selectedRunNumber === run.runNumber;
              return (
                <div
                  key={run.runId}
                  onClick={() => handleSelectRun(run)}
                  className={cn(
                    'p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-4 flex-wrap',
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'text-[10px] font-mono font-bold px-2 py-0.5 rounded border',
                        isSelected
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800',
                      )}
                    >
                      Run #{run.runNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{run.scenarioTitle}</span>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                            Active View
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{run.summarySnapshot}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <span className="text-purple-400 font-bold">{run.confidenceScore}% Conf.</span>
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Clock size={11} /> {run.timestamp}
                    </span>
                    <ChevronRight size={13} className={cn('text-slate-600', isSelected && 'text-purple-400')} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="text-[10px] text-slate-600 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span>AI Model Simulation: GPT-4o Security Fine-Tune (Academic Correlation Engine)</span>
          <span>Last Analyzed: {history[0]?.timestamp ?? 'Just now'}</span>
        </div>
      </div>
    </div>
  );
}
