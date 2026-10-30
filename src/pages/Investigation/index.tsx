import { useState } from 'react';
import {
  Search,
  Clock,
  FileText,
  Crosshair,
  Sparkles,
  ListChecks,
  FlaskConical,
  Server,
  User,
  Bell,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import StatusBadge from '../../components/common/StatusBadge';
import SeverityBadge from '../../components/common/SeverityBadge';
import TimelineSection from './TimelineSection';
import EvidenceSection from './EvidenceSection';
import AssessmentSection from './AssessmentSection';
import AiSummarySection from './AiSummarySection';
import PlaybookSection from './PlaybookSection';

import { INVESTIGATIONS_MOCK_DATA } from './mockData';
import type { Investigation, InvestigationStatus } from '../../types';
import { cn, formatDate, timeAgo } from '../../utils';

type InvestigationTab = 'timeline' | 'evidence' | 'assessment' | 'ai' | 'playbook';

const STORAGE_PREFIX = 'cyberdefense_incident_status_';

function getStoredIncidentStatus(id: string): InvestigationStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (saved && ['open', 'in_progress', 'resolved', 'closed'].includes(saved)) {
      return saved as InvestigationStatus;
    }
  } catch (err) {
    console.warn(`Failed to read status for incident ${id} from localStorage:`, err);
  }
  return null;
}

function saveIncidentStatus(id: string, status: InvestigationStatus) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, status);
  } catch (err) {
    console.warn(`Failed to save status for incident ${id} to localStorage:`, err);
  }
}

function initializeInvestigations(): Investigation[] {
  return INVESTIGATIONS_MOCK_DATA.map((inv) => {
    const savedStatus = getStoredIncidentStatus(inv.id);
    return savedStatus ? { ...inv, status: savedStatus } : inv;
  });
}

export default function InvestigationPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>(initializeInvestigations);
  const [selectedId, setSelectedId] = useState<string>(INVESTIGATIONS_MOCK_DATA[0].id);
  const [activeTab, setActiveTab] = useState<InvestigationTab>('timeline');

  // Synchronize active incident with any saved status for this incident
  const currentInv =
    investigations.find((inv) => inv.id === selectedId) ?? investigations[0];
  const storedStatus = getStoredIncidentStatus(currentInv.id);
  const selectedInv = storedStatus
    ? { ...currentInv, status: storedStatus }
    : currentInv;

  function handleStatusChange(newStatus: InvestigationStatus) {
    saveIncidentStatus(selectedId, newStatus);
    setInvestigations((prev) =>
      prev.map((inv) => (inv.id === selectedId ? { ...inv, status: newStatus } : inv)),
    );
  }

  const tabs: { key: InvestigationTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      key: 'timeline',
      label: 'Incident Timeline',
      icon: <Clock size={14} />,
      badge: selectedInv.timeline?.length,
    },
    {
      key: 'evidence',
      label: 'Evidence Review',
      icon: <FileText size={14} />,
      badge: selectedInv.evidence?.length,
    },
    {
      key: 'assessment',
      label: 'Associated Assessment',
      icon: <Crosshair size={14} />,
      badge: selectedInv.associatedAssessment ? selectedInv.associatedAssessment.scanId : undefined,
    },
    {
      key: 'ai',
      label: 'AI Incident Synthesis',
      icon: <Sparkles size={14} />,
      badge: selectedInv.aiSummary ? `${selectedInv.aiSummary.confidenceScore}%` : undefined,
    },
    {
      key: 'playbook',
      label: 'Response Playbook',
      icon: <ListChecks size={14} />,
      badge: selectedInv.playbookActions?.length,
    },
  ];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Academic Simulation Notice ───────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
        <FlaskConical size={14} className="text-cyan-400 shrink-0" />
        <span>
          Investigation operations are{' '}
          <span className="text-cyan-400 font-medium">academically simulated</span>
          {' '}— attack chain reconstruction and evidence artifacts correlate Red and Blue Team lab data.
        </span>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10 shrink-0">
            <Search size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Incident Investigation Workspace</h1>
            <p className="text-xs text-slate-500">
              Correlated breach analysis, timeline reconstruction, forensic evidence, and lab playbooks
            </p>
          </div>
        </div>

        {/* Investigation Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Active Incident:</span>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
            >
              {investigations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.title.slice(0, 36)}…
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Incident Overview Hero Card ───────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/70 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {selectedInv.id}
              </span>
              <SeverityBadge severity={selectedInv.severity} />
              <StatusBadge status={selectedInv.status} />
              <span className="text-xs text-slate-500 font-mono">
                Updated {timeAgo(selectedInv.updatedAt)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 leading-snug">{selectedInv.title}</h2>
          </div>

          {/* Quick Status Setter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 uppercase px-2 font-semibold">Status:</span>
            {(['open', 'in_progress', 'resolved', 'closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={cn(
                  'px-2.5 py-1 rounded capitalize text-xs font-medium transition-colors',
                  selectedInv.status === st
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200',
                )}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
              <Server size={11} className="text-cyan-400" /> Affected Target Asset
            </span>
            <p className="font-mono text-cyan-300 font-medium truncate">{selectedInv.targetAsset}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
              <User size={11} className="text-purple-400" /> Lead Investigator
            </span>
            <p className="text-slate-200 font-medium">
              {selectedInv.assignee}
              {selectedInv.leadAnalystRole && (
                <span className="block text-[10px] text-slate-500 font-normal">
                  {selectedInv.leadAnalystRole}
                </span>
              )}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
              <Calendar size={11} className="text-amber-400" /> Incident Opened
            </span>
            <p className="text-slate-300 font-mono">{formatDate(selectedInv.createdAt)}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1.5">
              <Bell size={11} className="text-orange-400" /> Correlated Alerts
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedInv.relatedAlerts.map((aid) => (
                <Link
                  key={aid}
                  to="/alerts"
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-orange-300 hover:text-orange-200 border border-slate-700 transition-colors"
                  title="View alert"
                >
                  {aid}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
          <span className="font-semibold text-slate-400 mr-1.5">Incident Scope:</span>
          {selectedInv.summary}
        </div>
      </div>

      {/* ── Tabs Navigation Bar ───────────────────────────────────────── */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-purple-500 text-purple-300 bg-purple-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700',
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold',
                    isActive
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-slate-800 text-slate-500',
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content Area ───────────────────────────────────── */}
      <div className="pt-2">
        {activeTab === 'timeline' && (
          <TimelineSection timeline={selectedInv.timeline ?? []} />
        )}
        {activeTab === 'evidence' && (
          <EvidenceSection evidence={selectedInv.evidence ?? []} />
        )}
        {activeTab === 'assessment' && (
          <AssessmentSection assessment={selectedInv.associatedAssessment} />
        )}
        {activeTab === 'ai' && (
          <AiSummarySection
            key={selectedInv.id}
            summary={selectedInv.aiSummary}
            incident={selectedInv}
          />
        )}
        {activeTab === 'playbook' && (
          <PlaybookSection
            key={selectedInv.id}
            actions={selectedInv.playbookActions ?? []}
          />
        )}
      </div>
    </div>
  );
}
